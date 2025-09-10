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

const invoiceSchema = z.object({
  number: z.string().min(1, "Invoice number is required"),
  type: z.enum(["SALES", "PURCHASE"]),
  status: z
    .enum(["DRAFT", "SENT", "PAID", "CANCELLED", "OVERDUE"])
    .default("DRAFT"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.string().optional(),
  ref: z.string().optional(),
  poNumber: z.string().optional(),
  customerId: z.string().optional(),
  vendorId: z.string().optional(),
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

// GET /api/invoices - List invoices
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");

    // Build where clause
    const whereClause: any = { organizationId };

    if (search) {
      whereClause.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { ref: { contains: search, mode: "insensitive" } },
        { poNumber: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const [invoices, totalCount] = await Promise.all([
      db.invoice.findMany({
        where: whereClause,
        include: {
          customer: { select: { id: true, name: true } },
          vendor: { select: { id: true, name: true } },
          project: { select: { id: true, code: true, name: true } },
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
          creator: { select: { name: true } },
          approver: { select: { name: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.invoice.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      invoices,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create invoice
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = invoiceSchema.parse(body);

    // Check if invoice number already exists
    const existingInvoice = await db.invoice.findFirst({
      where: {
        organizationId,
        number: validatedData.number,
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
          type: validatedData.type,
          status: validatedData.status,
          date: new Date(validatedData.date),
          dueDate: validatedData.dueDate
            ? new Date(validatedData.dueDate)
            : null,
          ref: validatedData.ref,
          poNumber: validatedData.poNumber,
          customerId: validatedData.customerId,
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

      return { invoice, lines };
    });

    return NextResponse.json({
      message: "Invoice created successfully",
      invoice: result.invoice,
      lines: result.lines,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
