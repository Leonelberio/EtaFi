import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { customerSchema } from "@/schemas";

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
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
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
    const validatedData = customerSchema.parse(body);

    const customer = await db.customer.create({
      data: {
        ...validatedData,
        organizationId: orgId,
      },
      include: {
        receivableAccount: {
          select: { number: true, name: true },
        },
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
