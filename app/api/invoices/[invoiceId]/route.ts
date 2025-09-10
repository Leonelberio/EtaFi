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

const invoiceUpdateSchema = z.object({
  number: z.string().min(1, "Invoice number is required").optional(),
  type: z.enum(["SALES", "PURCHASE"]).optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "CANCELLED", "OVERDUE"]).optional(),
  date: z.string().min(1, "Date is required").optional(),
  dueDate: z.string().optional(),
  ref: z.string().optional(),
  poNumber: z.string().optional(),
  customerId: z.string().optional(),
  vendorId: z.string().optional(),
  projectId: z.string().optional(),
  subtotal: z.number().min(0, "Subtotal must be positive").optional(),
  taxAmount: z.number().min(0, "Tax amount must be positive").optional(),
  total: z.number().min(0, "Total must be positive").optional(),
  paidAmount: z.number().min(0).optional(),
  currency: z.string().optional(),
  paymentTerms: z.string().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  lines: z.array(invoiceLineSchema).optional(),
});

// GET /api/invoices/[invoiceId] - Get specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
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
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        vendor: { select: { id: true, name: true, email: true, phone: true } },
        project: {
          select: {
            id: true,
            code: true,
            name: true,
            client: { select: { name: true } },
          },
        },
        lines: {
          include: {
            project: { select: { code: true, name: true } },
            activity: { select: { code: true, name: true } },
            subActivity: { select: { code: true, name: true } },
            taxCode: { select: { code: true, name: true, rate: true } },
            revenueAccount: { select: { number: true, name: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
        creator: { select: { name: true, email: true } },
        approver: { select: { name: true, email: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[invoiceId] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { invoiceId } = await params;
    const body = await request.json();
    const validatedData = invoiceUpdateSchema.parse(body);

    // Check if invoice exists and belongs to organization
    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check if invoice number is being changed and if it already exists
    if (
      validatedData.number &&
      validatedData.number !== existingInvoice.number
    ) {
      const duplicateInvoice = await db.invoice.findFirst({
        where: {
          organizationId,
          number: validatedData.number,
          id: { not: invoiceId },
        },
      });

      if (duplicateInvoice) {
        return NextResponse.json(
          { error: "Invoice number already exists" },
          { status: 400 }
        );
      }
    }

    // Update invoice in transaction
    const result = await db.$transaction(async (tx) => {
      // Prepare update data
      const updateData: any = {
        ...validatedData,
        updatedAt: new Date(),
      };

      // Convert date strings to Date objects
      if (validatedData.date) {
        updateData.date = new Date(validatedData.date);
      }
      if (validatedData.dueDate) {
        updateData.dueDate = new Date(validatedData.dueDate);
      }

      // Remove lines from update data if present (will be handled separately)
      delete updateData.lines;

      // Update invoice
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: updateData,
      });

      // Update lines if provided
      if (validatedData.lines) {
        // Delete existing lines
        await tx.invoiceLine.deleteMany({
          where: { invoiceId },
        });

        // Create new lines
        const lines = await Promise.all(
          validatedData.lines.map((line, index) =>
            tx.invoiceLine.create({
              data: {
                organizationId,
                invoiceId,
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                amount: line.amount,
                taxCodeId: line.taxCodeId,
                taxRate: line.taxRate,
                taxAmount: line.taxAmount || 0,
                totalAmount: line.totalAmount,
                projectId: validatedData.projectId, // Use invoice projectId
                activityId: line.activityId,
                subActivityId: line.subActivityId,
                costCategory: line.costCategory,
                revenueAccountId: line.revenueAccountId,
                sortOrder: line.sortOrder || index,
              },
            })
          )
        );

        return { invoice: updatedInvoice, lines };
      }

      return { invoice: updatedInvoice, lines: [] };
    });

    return NextResponse.json({
      message: "Invoice updated successfully",
      invoice: result.invoice,
      lines: result.lines,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[invoiceId] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = await params;

    // Check if invoice exists and belongs to organization
    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check if invoice can be deleted (not paid)
    if (existingInvoice.status === "PAID" || (existingInvoice.paidAmount && Number(existingInvoice.paidAmount) > 0)) {
      return NextResponse.json(
        { error: "Cannot delete paid invoice" },
        { status: 400 }
      );
    }

    // Delete invoice (cascade will delete lines and payments)
    await db.invoice.delete({
      where: { id: invoiceId },
    });

    return NextResponse.json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
