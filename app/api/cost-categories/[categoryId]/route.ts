import { NextRequest, NextResponse } from "next/server";
import { currentUser, getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{
    categoryId: string;
  }>;
}

// Cost Category update schema
const updateCostCategorySchema = z.object({
  code: z
    .string()
    .min(1)
    .max(3)
    .refine((val) => ["M", "S", "D", "E", "MOD"].includes(val), {
      message: "Code must be one of: M, S, D, E, MOD",
    })
    .optional(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(2).max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

/**
 * GET /api/cost-categories/[categoryId]
 * Get specific cost category details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get organization ID
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    const { categoryId } = await params;

    const costCategory = await db.costCategory.findFirst({
      where: {
        id: categoryId,
        organizationId,
      },
    });

    if (!costCategory) {
      return NextResponse.json(
        { error: "Cost category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      costCategory,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching cost category:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost category" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cost-categories/[categoryId]
 * Update cost category
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get organization ID
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    const { categoryId } = await params;
    const body = await request.json();
    const validatedData = updateCostCategorySchema.parse(body);

    // Check if cost category exists and belongs to organization
    const existingCategory = await db.costCategory.findFirst({
      where: {
        id: categoryId,
        organizationId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Cost category not found" },
        { status: 404 }
      );
    }

    // If changing code, check for duplicates
    if (
      validatedData.code &&
      validatedData.code !== existingCategory.code
    ) {
      const duplicateCategory = await db.costCategory.findFirst({
        where: {
          organizationId,
          code: validatedData.code,
          id: { not: categoryId },
        },
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: "Cost category code already exists" },
          { status: 400 }
        );
      }
    }

    // Update the cost category
    const updatedCategory = await db.costCategory.update({
      where: { id: categoryId },
      data: validatedData,
    });

    return NextResponse.json({
      costCategory: updatedCategory,
      success: true,
      message: "Cost category updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating cost category:", error);
    return NextResponse.json(
      { error: "Failed to update cost category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cost-categories/[categoryId]
 * Delete cost category (with safety checks)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get organization ID
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    const { categoryId } = await params;

    // Check if cost category exists and belongs to organization
    const existingCategory = await db.costCategory.findFirst({
      where: {
        id: categoryId,
        organizationId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Cost category not found" },
        { status: 404 }
      );
    }

    // Check if category is being used in journal lines
    const journalLineCount = await db.journalLine.count({
      where: {
        costGroup: existingCategory.code,
        organizationId,
      },
    });

    if (journalLineCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete cost category with existing journal entries. Deactivate instead.",
          hasTransactions: true,
        },
        { status: 400 }
      );
    }

    // Safe to delete
    await db.costCategory.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Cost category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cost category:", error);
    return NextResponse.json(
      { error: "Failed to delete cost category" },
      { status: 500 }
    );
  }
}
