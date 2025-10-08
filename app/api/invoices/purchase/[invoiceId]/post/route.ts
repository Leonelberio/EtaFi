import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ invoiceId: string }>;
}

// POST /api/invoices/purchase/[invoiceId]/post - Post (comptabiliser) a purchase invoice
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = await params;

    // Récupérer la facture avec toutes ses lignes
    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
        type: "PURCHASE",
      },
      include: {
        lines: {
          orderBy: { sortOrder: "asc" },
        },
        vendor: true,
        project: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture d'achat non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que la facture est approuvée
    if (invoice.approvalStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "La facture doit être approuvée avant d'être comptabilisée" },
        { status: 400 }
      );
    }

    // Vérifier qu'elle n'est pas déjà comptabilisée
    if (invoice.status === "POSTED" || invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Cette facture a déjà été comptabilisée" },
        { status: 400 }
      );
    }

    // Créer l'écriture de journal dans une transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Créer le journal
      const journal = await tx.journal.create({
        data: {
          organizationId,
          journalType: "PURCHASE",
          reference: `ACHAT-${invoice.number}`,
          description: `Facture d'achat ${invoice.vendor?.name || ""} - ${invoice.number}`,
          entryDate: invoice.date,
          status: "POSTED",
          totalAmount: Number(invoice.total),
          postedBy: session.user.id,
          postedAt: new Date(),
        },
      });

      // 2. Créer les lignes de journal pour chaque ligne de facture
      for (const line of invoice.lines) {
        // DÉBIT - Compte de dépense (selon groupe de coût)
        // TODO: Récupérer le compte GL approprié selon le groupe de coût
        // Pour l'instant, on utilise un compte générique
        await tx.journalLine.create({
          data: {
            organizationId,
            journalId: journal.id,
            accountId: line.revenueAccountId || "default-expense-account", // À remplacer
            description: line.description,
            debitAmount: Number(line.amount),
            creditAmount: 0,
            entryDate: invoice.date,
            projectId: line.projectId,
            activityId: line.activityId,
            subActivityId: line.subActivityId,
            costGroup: line.costCategory,
          },
        });
      }

      // 3. DÉBIT - TPS à recevoir
      if (invoice.gstAmount && Number(invoice.gstAmount) > 0) {
        await tx.journalLine.create({
          data: {
            organizationId,
            journalId: journal.id,
            accountId: "gst-receivable-account", // À remplacer par le vrai compte
            description: "TPS à recevoir",
            debitAmount: Number(invoice.gstAmount),
            creditAmount: 0,
            entryDate: invoice.date,
            projectId: invoice.projectId,
          },
        });
      }

      // 4. DÉBIT - TVQ à recevoir
      if (invoice.qstAmount && Number(invoice.qstAmount) > 0) {
        await tx.journalLine.create({
          data: {
            organizationId,
            journalId: journal.id,
            accountId: "qst-receivable-account", // À remplacer par le vrai compte
            description: "TVQ à recevoir",
            debitAmount: Number(invoice.qstAmount),
            creditAmount: 0,
            entryDate: invoice.date,
            projectId: invoice.projectId,
          },
        });
      }

      // 5. CRÉDIT - Compte fournisseur (total - retenue)
      const amountPayable = Number(invoice.balanceDue);
      if (amountPayable > 0) {
        await tx.journalLine.create({
          data: {
            organizationId,
            journalId: journal.id,
            accountId:
              invoice.vendor?.payableAccountId || "default-payable-account", // À remplacer
            description: `Compte à payer - ${invoice.vendor?.name || ""}`,
            debitAmount: 0,
            creditAmount: amountPayable,
            entryDate: invoice.date,
            projectId: invoice.projectId,
          },
        });
      }

      // 6. CRÉDIT - Retenue à payer (si applicable)
      if (invoice.totalWithholding && Number(invoice.totalWithholding) > 0) {
        await tx.journalLine.create({
          data: {
            organizationId,
            journalId: journal.id,
            accountId: "withholding-payable-account", // À remplacer
            description: "Retenue contractuelle",
            debitAmount: 0,
            creditAmount: Number(invoice.totalWithholding),
            entryDate: invoice.date,
            projectId: invoice.projectId,
          },
        });
      }

      // 7. Mettre à jour le statut de la facture
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "POSTED",
          postedBy: session.user.id,
          postedAt: new Date(),
        },
      });

      return { journal, invoice: updatedInvoice };
    });

    return NextResponse.json({
      success: true,
      invoice: result.invoice,
      journal: result.journal,
      message: "✅ Facture comptabilisée avec succès",
    });
  } catch (error) {
    console.error("Error posting purchase invoice:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la comptabilisation de la facture",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
