import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { vendorSchema } from "@/schemas";

export async function GET(req: NextRequest) {
  try {
    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = {
      organizationId: orgId,
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [vendors, total] = await Promise.all([
      db.vendor.findMany({
        where,
        include: {
          payableAccount: {
            select: { number: true, name: true },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      db.vendor.count({ where }),
    ]);

    return NextResponse.json({
      vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = vendorSchema.parse(body);

    // Vérifier si le code existe déjà pour cette organisation
    const existingVendor = await db.vendor.findFirst({
      where: {
        organizationId: orgId,
        code: validatedData.code,
      },
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: "Un fournisseur avec ce code existe déjà" },
        { status: 400 }
      );
    }

    const vendor = await db.vendor.create({
      data: {
        ...validatedData,
        organizationId: orgId,
      },
      include: {
        payableAccount: {
          select: { number: true, name: true },
        },
      },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
