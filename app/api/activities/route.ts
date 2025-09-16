import { NextRequest, NextResponse } from "next/server";
// TODO: Restore RBAC when middleware is fixed
// import { requireRole } from "@/lib/rbac-middleware";
import { db } from "@/lib/db";

/**
 * GET /api/activities
 * Get all activities across all projects for the organization
 */
export async function GET(request: NextRequest) {
  // TODO: Add role-based access control
  try {
    // Get current organization ID from auth context
    const { getCurrentOrgId } = await import("@/lib/auth");
    const organizationId = await getCurrentOrgId();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const isActive = searchParams.get("isActive");

    const whereClause: any = {
      organizationId,
    };

    // Filter by project if specified
    if (projectId) {
      whereClause.projectId = projectId;
    }

    // Filter by active status if specified
    if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }

    const activities = await db.activity.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
        },
        subActivities: {
          select: {
            id: true,
            code: true,
            name: true,
          },
          orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
        },
        _count: {
          select: {
            subActivities: true,
            journalLines: true,
          },
        },
      },
      orderBy: [
        { project: { name: "asc" } },
        { sortOrder: "asc" },
        { code: "asc" },
      ],
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activities
 * Create a new activity
 */
export async function POST(request: NextRequest) {
  try {
    const { getCurrentOrgId } = await import("@/lib/auth");
    const organizationId = await getCurrentOrgId();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      projectId,
      code,
      name,
      description,
      budgetAmount,
      budgetM,
      budgetS,
      budgetD,
      budgetE,
      budgetMOD,
      budgetMODHours,
      actualMODHours,
      costType,
      costCategory,
      isActive = true,
    } = body;

    // Validate required fields
    if (!projectId || !code || !name) {
      return NextResponse.json(
        { error: "Project ID, code, and name are required" },
        { status: 400 }
      );
    }

    // Check if activity code already exists in the project
    const existingActivity = await db.activity.findFirst({
      where: {
        projectId,
        code,
      },
    });

    if (existingActivity) {
      return NextResponse.json(
        { error: "Activity code already exists in this project" },
        { status: 409 }
      );
    }

    // Create the activity
    const activity = await db.activity.create({
      data: {
        organizationId,
        projectId,
        code,
        name,
        description,
        budgetAmount: budgetAmount ? parseFloat(budgetAmount) : null,
        budgetM: budgetM ? parseFloat(budgetM) : 0,
        budgetS: budgetS ? parseFloat(budgetS) : 0,
        budgetD: budgetD ? parseFloat(budgetD) : 0,
        budgetE: budgetE ? parseFloat(budgetE) : 0,
        budgetMOD: budgetMOD ? parseFloat(budgetMOD) : 0,
        budgetMODHours: budgetMODHours ? parseFloat(budgetMODHours) : 0,
        actualMODHours: actualMODHours ? parseFloat(actualMODHours) : 0,
        costType: costType || "FIXED",
        costCategory: costCategory || "CONTRACTUAL",
        isActive,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
