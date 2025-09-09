import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId } from "@/lib/auth";
import { invoiceSchema } from "@/lib/validations";

// GET - Récupérer toutes les factures de l'organisation
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const where: any = { organizationId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          project: { select: { name: true } },
          vendor: { select: { name: true } },
          customer: { select: { name: true } },
          lines: {
            include: {
              activity: { select: { code: true, name: true } },
              taxCode: { select: { code: true, name: true } },
            },
          },
        },
        orderBy: { date: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.invoice.count({ where }),
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
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle facture
// TODO: Fix InvoiceLine data structure
export async function POST(req: NextRequest) {
  // TODO: Fix InvoiceLine data structure compatibility with Prisma
  return NextResponse.json(
    {
      error:
        "Invoice creation temporarily disabled - data structure needs fixing",
    },
    { status: 501 }
  );

  /* Original code commented out until InvoiceLine structure is fixed
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = invoiceSchema.parse(await req.json());

    // Règles de présence du partenaire
    if (payload.type === "PURCHASE" && !payload.vendorId) {
      return NextResponse.json(
        { error: "vendorId requis pour ACHAT" },
        { status: 400 }
      );
    }
    if (payload.type === "SALES" && !payload.customerId) {
      return NextResponse.json(
        { error: "customerId requis pour VENTE" },
        { status: 400 }
      );
    }

    // Calcul des montants par ligne (utilise le tax rate stocké)
    const linesData = await Promise.all(
      payload.lines.map(async (l) => {
        const tax = l.taxCodeId
          ? await prisma.taxCode.findFirst({
              where: { id: l.taxCodeId!, organizationId },
              select: { rate: true },
            })
          : null;

        const amountTax = tax ? round2(l.amountHT * Number(tax.rate)) : 0;
        const amountTTC = round2(l.amountHT + amountTax);

        return { ...l, amountTax, amountTTC };
      })
    );

    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        type: payload.type,
        date: new Date(payload.date),
        ref: payload.ref,
        projectId: payload.projectId ?? null,
        vendorId: payload.vendorId ?? null,
        customerId: payload.customerId ?? null,
        currency: payload.currency,
        lines: { create: linesData },
      },
      include: {
        lines: {
          include: {
            activity: { select: { code: true, name: true } },
            taxCode: { select: { code: true, name: true } },
          },
        },
        project: { select: { name: true } },
        vendor: { select: { name: true } },
        customer: { select: { name: true } },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
  */
}

function round2(n: number) {
  // Arrondi à 2 décimales
  return Math.round(n * 100) / 100;
}
