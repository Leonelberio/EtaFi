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

// GET /api/purchase-invoices - List purchase invoices
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const vendorId = searchParams.get("vendorId") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      organizationId: orgId,
      type: "PURCHASE", // Only purchase invoices
    };

    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { ref: { contains: search, mode: "insensitive" } },
        { poNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          lines: true,
          _count: {
            select: {
              lines: true,
              payments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching purchase invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase invoices" },
      { status: 500 }
    );
  }
}

// POST /api/purchase-invoices - Create purchase invoice
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = purchaseInvoiceSchema.parse(body);

    // Check if invoice number already exists
    const existingInvoice = await db.invoice.findFirst({
      where: {
        organizationId: orgId,
        number: validatedData.number,
        type: "PURCHASE",
      },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice number already exists" },
        { status: 400 }
      );
    }

    // Create invoice with lines in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create invoice
      const invoice = await tx.invoice.create({
        data: {
          organizationId,
          number: validatedData.number,
          type: "PURCHASE", // Always PURCHASE for this endpoint
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
          createdBy: session.user.id,
        },
      });

      // Create invoice lines
      const lines = await Promise.all(
        validatedData.lines.map((line, index) =>
          tx.invoiceLine.create({
            data: {
              organizationId,
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

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase invoice:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create purchase invoice" },
      { status: 500 }
    );
  }
}
