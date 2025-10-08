import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";

// POST /api/invoices/purchase - Create a new purchase invoice
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
        { error: "Le numéro de facture fournisseur est obligatoire" },
        { status: 400 }
      );
    }

    if (!body.vendorId) {
      return NextResponse.json(
        { error: "Le fournisseur est obligatoire" },
        { status: 400 }
      );
    }

    if (!body.projectId) {
      return NextResponse.json(
        { error: "Le projet est obligatoire pour une facture d'achat" },
        { status: 400 }
      );
    }

    if (!body.lines || body.lines.length === 0) {
      return NextResponse.json(
        { error: "Au moins une ligne est requise" },
        { status: 400 }
      );
    }

    // Vérifier si le numéro de facture existe déjà pour ce fournisseur
    const existingInvoice = await db.invoice.findFirst({
      where: {
        organizationId,
        vendorId: body.vendorId,
        number: body.number,
        type: "PURCHASE",
      },
    });

    if (existingInvoice) {
      return NextResponse.json(
        {
          error: `Une facture avec le numéro "${body.number}" existe déjà pour ce fournisseur`,
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
          type: "PURCHASE",
          number: body.number,
          status: body.status || "DRAFT",
          approvalStatus: body.approvalStatus || "PENDING",

          // Dates (conformité NCECF)
          date: new Date(body.date),
          actualDate: body.actualDate ? new Date(body.actualDate) : null,
          entryDate: new Date(), // Auto-générée
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
          paidAmount: 0,
          amountBeforeTax: body.subtotal || 0,

          // Workflow
          department: body.department || null,
          paymentMethod: body.paymentMethod || null,
          paymentTerms: body.paymentTerms || null,

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

      return newInvoice;
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
        message: "Facture d'achat créée avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating purchase invoice:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création de la facture",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/invoices/purchase - Get all purchase invoices
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
    const vendorId = searchParams.get("vendorId");
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      type: "PURCHASE",
    };

    if (status) {
      where.status = status;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { vendor: { name: { contains: search, mode: "insensitive" } } },
        { project: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
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
    console.error("Error fetching purchase invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase invoices" },
      { status: 500 }
    );
  }
}

