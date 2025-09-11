import { NextRequest, NextResponse } from "next/server";
import { currentUser, getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";

// Default Canadian Cost Categories
const DEFAULT_COST_CATEGORIES = [
  {
    code: "M",
    name: "Matériel & Fournitures",
    description: "Materials, supplies, and inventory items used in projects",
    color: "#3B82F6", // Blue
    icon: "📦",
    sortOrder: 1,
  },
  {
    code: "S",
    name: "Sous-traitance & Services externes",
    description: "Subcontracting and external services",
    color: "#8B5CF6", // Purple
    icon: "🤝",
    sortOrder: 2,
  },
  {
    code: "D",
    name: "Frais généraux & Divers",
    description: "General expenses and miscellaneous costs",
    color: "#F59E0B", // Amber
    icon: "📋",
    sortOrder: 3,
  },
  {
    code: "E",
    name: "Équipement & Immobilisations",
    description: "Equipment and fixed assets",
    color: "#10B981", // Green
    icon: "🔧",
    sortOrder: 4,
  },
  {
    code: "MOD",
    name: "Main-d'œuvre & Charges sociales",
    description: "Labor costs and social charges",
    color: "#EF4444", // Red
    icon: "👥",
    sortOrder: 5,
  },
];

/**
 * POST /api/cost-categories/initialize
 * Initialize default 5-group cost categories for the organization
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

    const { overwriteExisting = false } = await request.json();

    // Check if organization already has cost categories
    const existingCategories = await db.costCategory.count({
      where: {
        organizationId,
      },
    });

    if (existingCategories > 0 && !overwriteExisting) {
      return NextResponse.json(
        {
          error:
            "Organization already has cost categories. Set overwriteExisting=true to replace them.",
          existingCount: existingCategories,
        },
        { status: 400 }
      );
    }

    // If overwriting, delete existing categories
    if (overwriteExisting && existingCategories > 0) {
      await db.costCategory.deleteMany({
        where: {
          organizationId,
        },
      });
    }

    // Create default cost categories
    const createdCategories = [];
    for (const category of DEFAULT_COST_CATEGORIES) {
      const createdCategory = await db.costCategory.create({
        data: {
          ...category,
          organizationId,
        },
      });
      createdCategories.push(createdCategory);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully initialized 5-group cost categories",
      categoriesCreated: createdCategories.length,
      categories: createdCategories,
    });
  } catch (error) {
    console.error("Error initializing cost categories:", error);
    return NextResponse.json(
      { error: "Failed to initialize cost categories" },
      { status: 500 }
    );
  }
}
