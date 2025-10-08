import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";

// POST /api/invoices/sales - Create a new sales invoice
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Valider les champs obligatoires
    if (!body.number) {
      return NextResponse.json(
        { error: "Le numéro de facture est obligatoire" },
        { status: 400 }
      );
    }

    if (!body.customerId) {
      return NextResponse.json(
        { error: "Le client est obligatoire" },
        { status: 400 }
      );
    }

    if (!body.projectId) {
      return NextResponse.json(
        {
          error: "Le projet/contrat est obligatoire pour une facture de vente",
        },
        { status: 400 }
      );
    }

    if (!body.lines || body.lines.length === 0) {
      return NextResponse.json(
        { error: "Au moins une ligne est requise" },
        { status: 400 }
      );
    }

    // Vérifier si le numéro de facture existe déjà
    const existingInvoice = await db.invoice.findFirst({
      where: {
        organizationId,
        number: body.number,
        type: "SALES",
      },
    });

    if (existingInvoice) {
      return NextResponse.json(
        {
          error: `Une facture avec le numéro "${body.number}" existe déjà`,
        },
        { status: 400 }
      );
    }

    // Créer la facture avec toutes les lignes dans une transaction
    const invoice = await db.$transaction(async (tx) => {
      // Créer l'en-tête de facture
      const newInvoice = await tx.invoice.create({
        data: {
          organizationId,
          type: "SALES",
          number: body.number,
          status: body.status || "DRAFT",
          approvalStatus: body.approvalStatus || "PENDING",

          // Dates (conformité NCECF)
          date: new Date(body.date),
          entryDate: new Date(), // Auto-générée
          dueDate: body.dueDate ? new Date(body.dueDate) : null,

          // Parties
          customerId: body.customerId,
          projectId: body.projectId,

          // Références
          ref: body.ref || null,

          // Retenue contractuelle
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
          paidAmount: 0,
          amountBeforeTax: body.subtotal || 0,

          // Payment Terms
          paymentTerms: body.paymentTerms || null,
          paymentMethod: body.paymentMethod || null,

          // Notes
          notes: body.notes || null,
          internalNotes: body.internalNotes || null,

          // Audit
          createdBy: session.user.id,
          currency: body.currency || "CAD",
        },
      });

      // Créer les lignes de facture
      if (body.lines && body.lines.length > 0) {
        await tx.invoiceLine.createMany({
          data: body.lines.map((line: any, index: number) => ({
            organizationId,
            invoiceId: newInvoice.id,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            amount: line.quantity * line.unitPrice,

            // Affectation projet/activité
            projectId: line.projectId || body.projectId,
            activityId: line.activityId || null,
            subActivityId: line.subActivityId || null,

            // 🆕 Revenue Classification
            revenueType: line.revenueType, // CONTRACTUAL ou ADDITIONAL
            revenueGroup: line.revenueGroup, // CONSTRUCTION, SERVICES, EQUIPMENT, OTHER

            // Taxes
            taxCodeId: line.taxCodeId || null,
            taxRate: line.taxRate || 0,
            taxAmount: line.taxAmount || 0,
            totalAmount: line.totalAmount || 0,

            // Compte GL
            revenueAccountId: line.revenueAccountId || null,

            sortOrder: index,
          })),
        });
      }

      return newInvoice;
    });

    // Récupérer la facture complète avec ses relations
    const fullInvoice = await db.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: {
          select: {
            id: true,
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        invoice: fullInvoice,
        message: "Facture de vente créée avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating sales invoice:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création de la facture",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/invoices/sales - Get all sales invoices
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      type: "SALES",
    };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { project: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
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
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: "desc" },
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
    console.error("Error fetching sales invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales invoices" },
      { status: 500 }
    );
  }
}
