import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ invoiceId: string }>;
}

// POST /api/invoices/purchase/[invoiceId]/approve - Approve a purchase invoice
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
    const body = await request.json();
    const { approved, comments } = body;

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

    // Vérifier que la facture est en attente d'approbation
    if (existingInvoice.approvalStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Cette facture a déjà été approuvée ou rejetée" },
        { status: 400 }
      );
    }

    // Mettre à jour le statut d'approbation
    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        approvalStatus: approved ? "APPROVED" : "REJECTED",
        approvedBy: session.user.id,
        status: approved ? "APPROVED" : "DRAFT",
        internalNotes: comments
          ? `${existingInvoice.internalNotes || ""}\n\n[Approbation] ${new Date().toISOString()}: ${comments}`
          : existingInvoice.internalNotes,
      },
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
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: approved
        ? "✅ Facture approuvée avec succès"
        : "❌ Facture rejetée",
    });
  } catch (error) {
    console.error("Error approving purchase invoice:", error);
    return NextResponse.json(
      { error: "Failed to approve purchase invoice" },
      { status: 500 }
    );
  }
}

