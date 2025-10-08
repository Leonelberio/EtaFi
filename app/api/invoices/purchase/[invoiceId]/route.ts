import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ invoiceId: string }>;
}

// GET /api/invoices/purchase/[invoiceId] - Get a specific purchase invoice
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = await params;

    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
        type: "PURCHASE",
      },
      include: {
        vendor: {
          select: {
            id: true,
            code: true,
            name: true,
            defaultCostGroup: true,
            withholdingRate: true,
            taxable: true,
            taxExempt: true,
          },
        },
        project: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        lines: {
          orderBy: { sortOrder: "asc" },
          include: {
            project: {
              select: { id: true, code: true, name: true },
            },
            activity: {
              select: { id: true, code: true, name: true },
            },
            subActivity: {
              select: { id: true, code: true, name: true },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        poster: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture d'achat non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error fetching purchase invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase invoice" },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/purchase/[invoiceId] - Update a purchase invoice
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const body = await request.json();

    // Vérifier que la facture existe et appartient à l'organisation
    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
        type: "PURCHASE",
      },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Facture d'achat non trouvée" },
        { status: 404 }
      );
    }

    // Ne pas permettre la modification si déjà comptabilisée (POSTED) ou payée (PAID)
    if (
      existingInvoice.status === "POSTED" ||
      existingInvoice.status === "PAID"
    ) {
      return NextResponse.json(
        {
          error:
            "Impossible de modifier une facture comptabilisée ou payée. Utilisez une écriture de correction.",
        },
        { status: 400 }
      );
    }

    // Mettre à jour la facture dans une transaction
    const invoice = await db.$transaction(async (tx) => {
      // Supprimer les anciennes lignes
      await tx.invoiceLine.deleteMany({
        where: { invoiceId },
      });

      // Mettre à jour l'en-tête
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          number: body.number,
          status: body.status,
          approvalStatus: body.approvalStatus,

          // Dates
          date: new Date(body.date),
          actualDate: body.actualDate ? new Date(body.actualDate) : null,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,

          // Parties
          vendorId: body.vendorId,
          projectId: body.projectId,

          // Références
          poNumber: body.poNumber || null,
          ref: body.ref || null,

          // Retenues
          withholdingPercent: body.withholdingPercent || null,
          withholdingAmount: body.withholdingAmount || null,
          totalWithholding: body.totalWithholding || 0,

          // Montants
          subtotal: body.subtotal || 0,
          gstAmount: body.gstAmount || 0,
          qstAmount: body.qstAmount || 0,
          hstAmount: body.hstAmount || 0,
          otherTaxes: body.otherTaxes || 0,
          taxAmount: body.taxAmount || 0,
          total: body.total || 0,
          balanceDue: body.balanceDue || 0,
          amountBeforeTax: body.subtotal || 0,

          // Workflow
          department: body.department || null,
          paymentMethod: body.paymentMethod || null,
          paymentTerms: body.paymentTerms || null,

          // Notes
          notes: body.notes || null,
          internalNotes: body.internalNotes || null,
        },
      });

      // Créer les nouvelles lignes
      if (body.lines && body.lines.length > 0) {
        await tx.invoiceLine.createMany({
          data: body.lines.map((line: any, index: number) => ({
            organizationId,
            invoiceId: updatedInvoice.id,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            amount: line.quantity * line.unitPrice,

            // Affectation projet/activité
            projectId: line.projectId || body.projectId,
            activityId: line.activityId || null,
            subActivityId: line.subActivityId || null,

            // Groupe de coût
            costCategory: line.costGroup,

            // Taxes
            taxCodeId: line.taxCodeId || null,
            taxRate: line.taxRate || 0,
            taxAmount: line.taxAmount || 0,
            totalAmount: line.totalAmount || 0,

            // Compte GL
            revenueAccountId: line.glAccountId || null,

            sortOrder: index,
          })),
        });
      }

      return updatedInvoice;
    });

    // Récupérer la facture complète avec ses relations
    const fullInvoice = await db.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        vendor: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        lines: {
          orderBy: { sortOrder: "asc" },
          include: {
            project: {
              select: { code: true, name: true },
            },
            activity: {
              select: { code: true, name: true },
            },
            subActivity: {
              select: { code: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      invoice: fullInvoice,
      message: "Facture d'achat mise à jour avec succès",
    });
  } catch (error) {
    console.error("Error updating purchase invoice:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la mise à jour de la facture",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/purchase/[invoiceId] - Delete a purchase invoice (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Vérifier que la facture existe
    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
        type: "PURCHASE",
      },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Facture d'achat non trouvée" },
        { status: 404 }
      );
    }

    // Ne pas permettre la suppression si déjà comptabilisée ou payée
    if (
      existingInvoice.status === "POSTED" ||
      existingInvoice.status === "PAID"
    ) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer une facture comptabilisée ou payée. Utilisez une écriture de correction.",
        },
        { status: 400 }
      );
    }

    // Soft delete - marquer comme inactive
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        isActive: false,
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Facture d'achat supprimée avec succès",
    });
  } catch (error) {
    console.error("Error deleting purchase invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase invoice" },
      { status: 500 }
    );
  }
}

