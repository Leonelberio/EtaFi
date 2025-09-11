import { NextRequest, NextResponse } from "next/server";
import { currentUser, getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Cost Category validation schema
const costCategorySchema = z.object({
  code: z
    .string()
    .min(1)
    .max(10)
    .regex(
      /^[A-Z0-9_-]+$/,
      "Code must contain only uppercase letters, numbers, underscores, and hyphens"
    ),
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(500),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

/**
 * GET /api/cost-categories
 * Get all cost categories for the organization
 */
export async function GET(request: NextRequest) {
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
        {
          error: "No organization found. Please create an organization first.",
          action: "create_organization",
          redirectTo: "/dashboard/organizations/new",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const whereClause: any = {
      organizationId,
    };

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const costCategories = await db.costCategory.findMany({
      where: whereClause,
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    });

    // Group by status for stats
    const stats = {
      total: costCategories.length,
      active: costCategories.filter((cat) => cat.isActive).length,
      inactive: costCategories.filter((cat) => !cat.isActive).length,
    };

    return NextResponse.json({
      costCategories,
      stats,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching cost categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cost-categories
 * Create a new cost category
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = costCategorySchema.parse(body);

    // Check if cost category code already exists
    const existingCategory = await db.costCategory.findFirst({
      where: {
        organizationId,
        code: validatedData.code,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Cost category code already exists" },
        { status: 400 }
      );
    }

    // Create the cost category
    const costCategory = await db.costCategory.create({
      data: {
        ...validatedData,
        organizationId,
      },
    });

    return NextResponse.json({
      costCategory,
      success: true,
      message: "Cost category created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating cost category:", error);
    return NextResponse.json(
      { error: "Failed to create cost category" },
      { status: 500 }
    );
  }
}
