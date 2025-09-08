import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { taxCodeSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ taxCodeId: string }>;
}

// GET - Get specific tax code
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taxCodeId } = await params;

    const taxCode = await db.taxCode.findFirst({
      where: {
        id: taxCodeId,
        organizationId,
      },
    });

    if (!taxCode) {
      return NextResponse.json(
        { error: "Tax code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(taxCode);
  } catch (error) {
    console.error("Error fetching tax code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update tax code
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taxCodeId } = await params;
    const body = taxCodeSchema.parse(await req.json());

    // Check if tax code exists and belongs to organization
    const existingTaxCode = await db.taxCode.findFirst({
      where: {
        id: taxCodeId,
        organizationId,
      },
    });

    if (!existingTaxCode) {
      return NextResponse.json(
        { error: "Tax code not found" },
        { status: 404 }
      );
    }

    // Check if code is unique within organization (excluding current tax code)
    const duplicateCode = await db.taxCode.findFirst({
      where: {
        organizationId,
        code: body.code,
        id: { not: taxCodeId },
      },
    });

    if (duplicateCode) {
      return NextResponse.json(
        { error: "Tax code already exists" },
        { status: 400 }
      );
    }

    const updatedTaxCode = await db.taxCode.update({
      where: {
        id: taxCodeId,
      },
      data: {
        code: body.code,
        name: body.name,
        rate: body.rate,
        province: body.province || null,
        isActive: body.isActive ?? true,
        isCompound: body.isCompound ?? false,
        description: body.description || null,
      },
    });

    return NextResponse.json(updatedTaxCode);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating tax code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Partially update tax code (for quick toggles like isActive)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taxCodeId } = await params;
    const body = await req.json();

    // Check if tax code exists and belongs to organization
    const existingTaxCode = await db.taxCode.findFirst({
      where: {
        id: taxCodeId,
        organizationId,
      },
    });

    if (!existingTaxCode) {
      return NextResponse.json(
        { error: "Tax code not found" },
        { status: 404 }
      );
    }

    // Only allow certain fields to be patched
    const allowedFields = ["isActive"];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedTaxCode = await db.taxCode.update({
      where: {
        id: taxCodeId,
      },
      data: updateData,
    });

    return NextResponse.json(updatedTaxCode);
  } catch (error) {
    console.error("Error patching tax code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete tax code
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taxCodeId } = await params;

    // Check if tax code exists and belongs to organization
    const existingTaxCode = await db.taxCode.findFirst({
      where: {
        id: taxCodeId,
        organizationId,
      },
    });

    if (!existingTaxCode) {
      return NextResponse.json(
        { error: "Tax code not found" },
        { status: 404 }
      );
    }

    // Check if tax code is being used in journal lines
    const usageCount = await db.journalLine.count({
      where: {
        taxCodeId: taxCodeId,
      },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete tax code",
          details: `This tax code is used in ${usageCount} journal entries. Please deactivate it instead.`,
        },
        { status: 400 }
      );
    }

    await db.taxCode.delete({
      where: {
        id: taxCodeId,
      },
    });

    return NextResponse.json({
      message: "Tax code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tax code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
