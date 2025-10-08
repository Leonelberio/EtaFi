import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ invoiceId: string }>;
}

// POST /api/invoices/sales/[invoiceId]/post - Post (comptabiliser) a sales invoice
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
        type: "SALES",
      },
      include: {
        lines: {
          orderBy: { sortOrder: "asc" },
        },
        customer: true,
        project: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture de vente non trouvée" },
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
          journalType: "SALES",
          reference: `VENTE-${invoice.number}`,
          description: `Facture de vente ${invoice.customer?.name || ""} - ${invoice.number}`,
          entryDate: invoice.date,
          status: "POSTED",
          totalAmount: Number(invoice.total),
          postedBy: session.user.id,
          postedAt: new Date(),
        },
      });

      // 2. DÉBIT - Compte client (montant à recevoir)
      const amountReceivable = Number(invoice.balanceDue || invoice.total);
      await tx.journalLine.create({
        data: {
          organizationId,
          journalId: journal.id,
          accountId:
            invoice.customer?.receivableAccountId ||
            "default-receivable-account", // À remplacer
          description: `Compte à recevoir - ${invoice.customer?.name || ""}`,
          debitAmount: amountReceivable,
          creditAmount: 0,
          entryDate: invoice.date,
          projectId: invoice.projectId,
        },
      });

      // 3. CRÉDIT - Comptes de revenus (par ligne et par groupe)
      for (const line of invoice.lines) {
        // CRÉDIT - Compte de revenu selon le groupe
        await tx.journalLine.create({
          data: {
            organizationId,
            journalId: journal.id,
            accountId: line.revenueAccountId || "default-revenue-account", // À remplacer
            description: `${line.description} (${line.revenueType === "CONTRACTUAL" ? "Contractuel" : "Supplémentaire"})`,
            debitAmount: 0,
            creditAmount: Number(line.amount),
            entryDate: invoice.date,
            projectId: line.projectId,
            activityId: line.activityId,
            subActivityId: line.subActivityId,
          },
        });
      }

      // 4. CRÉDIT - TPS à facturer (payable)
      if (invoice.gstAmount && Number(invoice.gstAmount) > 0) {
        await tx.journalLine.create({
          data: {
            organizationId,
            journalId: journal.id,
            accountId: "gst-payable-account", // À remplacer par le vrai compte
            description: "TPS à facturer",
            debitAmount: 0,
            creditAmount: Number(invoice.gstAmount),
            entryDate: invoice.date,
            projectId: invoice.projectId,
          },
        });
      }

      // 5. CRÉDIT - TVQ à facturer (payable)
      if (invoice.qstAmount && Number(invoice.qstAmount) > 0) {
        await tx.journalLine.create({
          data: {
            organizationId,
            journalId: journal.id,
            accountId: "qst-payable-account", // À remplacer par le vrai compte
            description: "TVQ à facturer",
            debitAmount: 0,
            creditAmount: Number(invoice.qstAmount),
            entryDate: invoice.date,
            projectId: invoice.projectId,
          },
        });
      }

      // 6. CRÉDIT - Retenue à recevoir (si applicable)
      if (invoice.totalWithholding && Number(invoice.totalWithholding) > 0) {
        await tx.journalLine.create({
          data: {
            organizationId,
            journalId: journal.id,
            accountId: "withholding-receivable-account", // À remplacer
            description: "Retenue contractuelle à recevoir",
            debitAmount: Number(invoice.totalWithholding),
            creditAmount: 0,
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
    console.error("Error posting sales invoice:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la comptabilisation de la facture",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
