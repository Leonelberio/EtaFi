import { prisma } from "./prisma";

type PostResult = { entryId: string };

export async function postInvoice(
  organizationId: string,
  invoiceId: string
): Promise<PostResult> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    include: {
      lines: {
        include: {
          taxCode: true,
          activity: true,
        },
      },
      customer: {
        include: {
          receivableAccount: true,
        },
      },
      vendor: {
        include: {
          payableAccount: true,
        },
      },
      project: true,
    },
  });

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "POSTED") throw new Error("Already posted");

  // Récupère les comptes par défaut de l'orga
  const settings = await getPostingSettings(organizationId);
  const journal = invoice.type === "PURCHASE" ? "HA" : "VE";

  // Construit les lignes d'écritures
  const jl: Array<Parameters<typeof prisma.journalLine.create>[0]["data"]> = [];

  // Pour chaque ligne facture : compte de charge/produit selon le groupe
  for (const l of invoice.lines) {
    // Use default group code since InvoiceLine doesn't have groupCode field
    const groupCode = "D" as const; // Default to "Divers" group
    
    const mapAccountId = await resolveAccountForGroup({
      organizationId,
      type: invoice.type as "PURCHASE" | "SALES",
      groupCode,
    });

    if (!mapAccountId)
      throw new Error(`Aucun compte mappé pour ${invoice.type}/${groupCode}`);

    // Débit (ACHAT) charges/immos ; Crédit (VENTE) produits
    if (invoice.type === "PURCHASE") {
      jl.push({
        organizationId,
        accountId: mapAccountId,
        debitAmount: l.amount,
        creditAmount: 0,
        projectId: invoice.projectId ?? undefined,
        activityId: l.activityId,
        description: l.description,
        entryDate: invoice.date,
      });

      if (Number(l.taxAmount) > 0) {
        // TODO: Implement proper tax account mapping
        // For now, skip tax handling until TaxCode model is updated
        console.warn(`Tax amount ${l.taxAmount} not posted - tax account mapping not implemented`);
      }
    } else {
      // SALES
      jl.push({
        organizationId,
        accountId: mapAccountId,
        debitAmount: 0,
        creditAmount: l.amount,
        projectId: invoice.projectId ?? undefined,
        activityId: l.activityId,
        description: l.description,
        entryDate: invoice.date,
      });

      if (Number(l.taxAmount) > 0) {
        // TODO: Implement proper tax account mapping
        // For now, skip tax handling until TaxCode model is updated
        console.warn(`Tax amount ${l.taxAmount} not posted - tax account mapping not implemented`);
      }
    }
  }

  // Ligne partenaire TTC
  const totalTTC = invoice.lines.reduce((s, l) => s + Number(l.totalAmount), 0);
  if (invoice.type === "PURCHASE") {
    if (!invoice.vendor?.payableAccountId)
      throw new Error("Fournisseur sans compte 401");
    jl.push({
      organizationId,
      accountId: invoice.vendor.payableAccountId,
      debitAmount: 0,
      creditAmount: totalTTC,
      partnerId: invoice.vendor.id,
      partnerType: "VENDOR",
      description: `Facture ${invoice.ref}`,
      entryDate: invoice.date,
    });
  } else {
    if (!invoice.customer?.receivableAccountId)
      throw new Error("Client sans compte 411");
    jl.push({
      organizationId,
      accountId: invoice.customer.receivableAccountId,
      debitAmount: totalTTC,
      creditAmount: 0,
      partnerId: invoice.customer.id,
      partnerType: "CUSTOMER",
      description: `Facture ${invoice.ref}`,
      entryDate: invoice.date,
    });
  }

  // Crée la pièce + lignes atomiquement
  const entry = await prisma.$transaction(async (tx) => {
    const e = await tx.journalEntry.create({
      data: {
        organizationId,
        invoiceId: invoice.id,
        date: invoice.date,
        journal,
        ref: invoice.ref,
      },
    });

    for (const line of jl) {
      await tx.journalLine.create({
        data: { ...line, entryId: e.id },
      });
    }

    await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: "POSTED" },
    });

    return e;
  });

  // Vérif équilibre (optionnel)
  const lines = await prisma.journalLine.findMany({
    where: { entryId: entry.id },
  });

  const totalDebit = lines.reduce((sum, line) => sum + Number(line.debitAmount), 0);
  const totalCredit = lines.reduce((sum, line) => sum + Number(line.creditAmount), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(
      `Écriture non équilibrée: Débit=${totalDebit}, Crédit=${totalCredit}`
    );
  }

  return { entryId: entry.id };
}

async function resolveAccountForGroup(params: {
  organizationId: string;
  type: "PURCHASE" | "SALES";
  groupCode: "M" | "S" | "D" | "E" | "L" | "R";
}) {
  // Récupère le mapping depuis la table PostingMap
  const map = await prisma.postingMap.findFirst({
    where: params,
  });
  return map?.accountId ?? null;
}

// Récupère les paramètres de posting de l'organisation
async function getPostingSettings(organizationId: string) {
  // Pour l'instant, retourne un objet vide
  // Plus tard, on pourra stocker des paramètres comme l'arrondi (CFA entier vs 2 décimales)
  return {};
}

// Fonction utilitaire pour arrondir selon les paramètres de l'organisation
export function roundAmount(amount: number, organizationId: string): number {
  // Par défaut, arrondi à 2 décimales
  // Plus tard, on pourra récupérer le paramètre depuis la base
  return Math.round(amount * 100) / 100;
}
