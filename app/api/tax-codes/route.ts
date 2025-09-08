import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { taxCodeSchema } from "@/lib/validations";

// GET - Récupérer tous les codes de taxe de l'organisation
export async function GET() {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taxCodes = await db.taxCode.findMany({
      where: { organizationId },
      orderBy: { code: "asc" },
    });

    return NextResponse.json(taxCodes);
  } catch (error) {
    console.error("Error fetching tax codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau code de taxe
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = taxCodeSchema.parse(await req.json());

    // Note: Chart account linking will be implemented when we add account relations

    const taxCode = await db.taxCode.create({
      data: {
        organizationId,
        code: body.code,
        name: body.name || body.code, // Use name field from schema
        rate: body.rate,
        province: body.province,
        isActive: body.isActive ?? true,
        isCompound: body.isCompound ?? false,
        description: body.description,
      },
    });

    return NextResponse.json(taxCode, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating tax code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
