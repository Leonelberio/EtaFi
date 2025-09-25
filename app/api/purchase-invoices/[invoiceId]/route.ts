import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";
import { z } from "zod";

// Validation schemas
const invoiceLineSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  amount: z.number().min(0, "Amount must be positive"),
  taxCodeId: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  taxAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0, "Total amount must be positive"),
  activityId: z.string().optional(),
  subActivityId: z.string().optional(),
  costCategory: z.enum(["M", "S", "D", "E", "MOD"]).optional(),
  revenueAccountId: z.string().optional(),
  sortOrder: z.number().default(0),
});

const purchaseInvoiceSchema = z.object({
  number: z.string().min(1, "Invoice number is required"),
  status: z
    .enum(["DRAFT", "SENT", "PAID", "CANCELLED", "OVERDUE"])
    .default("DRAFT"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.string().optional(),
  ref: z.string().optional(),
  poNumber: z.string().optional(),
  vendorId: z.string().min(1, "Vendor is required for purchase invoices"),
  projectId: z.string().optional(),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  taxAmount: z.number().min(0, "Tax amount must be positive"),
  total: z.number().min(0, "Total must be positive"),
  paidAmount: z.number().min(0).default(0),
  currency: z.string().default("CAD"),
  paymentTerms: z.string().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  lines: z
    .array(invoiceLineSchema)
    .min(1, "At least one line item is required"),
});

// GET /api/purchase-invoices/[invoiceId] - Get purchase invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const { invoiceId } = await params;

    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId: orgId,
        type: "PURCHASE", // Only purchase invoices
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        lines: {
          include: {
            taxCode: {
              select: {
                id: true,
                name: true,
                rate: true,
              },
            },
            activity: {
              select: {
                id: true,
                name: true,
              },
            },
            subActivity: {
              select: {
                id: true,
                name: true,
              },
            },
            revenueAccount: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
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
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Purchase invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching purchase invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase invoice" },
      { status: 500 }
    );
  }
}

// PUT /api/purchase-invoices/[invoiceId] - Update purchase invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const { invoiceId } = await params;

    // Check if invoice exists and is a purchase invoice
    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId: orgId,
        type: "PURCHASE",
      },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Purchase invoice not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = purchaseInvoiceSchema.parse(body);

    // Check if invoice number already exists (excluding current invoice)
    const duplicateInvoice = await db.invoice.findFirst({
      where: {
        organizationId: orgId,
        number: validatedData.number,
        type: "PURCHASE",
        id: { not: invoiceId },
      },
    });

    if (duplicateInvoice) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 400 }
      );
    }

    // Update invoice with lines in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update invoice
      const invoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          number: validatedData.number,
          status: validatedData.status,
          date: new Date(validatedData.date),
          dueDate: validatedData.dueDate
            ? new Date(validatedData.dueDate)
            : null,
          ref: validatedData.ref,
          poNumber: validatedData.poNumber,
          vendorId: validatedData.vendorId,
          projectId: validatedData.projectId,
          subtotal: validatedData.subtotal,
          taxAmount: validatedData.taxAmount,
          total: validatedData.total,
          paidAmount: validatedData.paidAmount,
          currency: validatedData.currency,
          paymentTerms: validatedData.paymentTerms,
          discountPercent: validatedData.discountPercent,
          discountAmount: validatedData.discountAmount,
          notes: validatedData.notes,
          internalNotes: validatedData.internalNotes,
        },
      });

      // Delete existing lines
      await tx.invoiceLine.deleteMany({
        where: { invoiceId: invoiceId },
      });

      // Create new lines
      const lines = await Promise.all(
        validatedData.lines.map((line, index) =>
          tx.invoiceLine.create({
            data: {
              organizationId: orgId,
              invoiceId: invoice.id,
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              amount: line.amount,
              taxCodeId: line.taxCodeId,
              taxRate: line.taxRate,
              taxAmount: line.taxAmount || 0,
              totalAmount: line.totalAmount,
              activityId: line.activityId,
              subActivityId: line.subActivityId,
              costCategory: line.costCategory,
              revenueAccountId: line.revenueAccountId,
              sortOrder: line.sortOrder || index,
            },
          })
        )
      );

      return { invoice, lines };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating purchase invoice:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update purchase invoice" },
      { status: 500 }
    );
  }
}

// DELETE /api/purchase-invoices/[invoiceId] - Delete purchase invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const { invoiceId } = await params;

    // Check if invoice exists and is a purchase invoice
    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId: orgId,
        type: "PURCHASE",
      },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: "Purchase invoice not found" },
        { status: 404 }
      );
    }

    // Check if invoice has payments
    const hasPayments = await db.invoicePayment.findFirst({
      where: { invoiceId: invoiceId },
    });

    if (hasPayments) {
      return NextResponse.json(
        { error: "Cannot delete invoice with payments" },
        { status: 400 }
      );
    }

    // Delete invoice (lines will be deleted automatically due to cascade)
    await db.invoice.delete({
      where: { id: invoiceId },
    });

    return NextResponse.json({
      message: "Purchase invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting purchase invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase invoice" },
      { status: 500 }
    );
  }
}
