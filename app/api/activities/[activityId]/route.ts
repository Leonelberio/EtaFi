import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/activities/[activityId]
 * Get a specific activity by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;

    const { getCurrentOrgId } = await import("@/lib/auth");
    const organizationId = await getCurrentOrgId();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    const activity = await db.activity.findFirst({
      where: {
        id: activityId,
        organizationId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subActivities: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            budgetAmount: true,
            budgetM: true,
            budgetS: true,
            budgetD: true,
            budgetE: true,
            budgetMOD: true,
            budgetMODHours: true,
            actualMODHours: true,
            costType: true,
            costCategory: true,
            isActive: true,
            sortOrder: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/activities/[activityId]
 * Update a specific activity
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;

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
      isActive,
    } = body;

    // Check if activity exists and belongs to the organization
    const existingActivity = await db.activity.findFirst({
      where: {
        id: activityId,
        organizationId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Check if code is being changed and if it conflicts with another activity
    if (code && code !== existingActivity.code) {
      const conflictingActivity = await db.activity.findFirst({
        where: {
          projectId: existingActivity.projectId,
          code,
          id: { not: activityId },
        },
      });

      if (conflictingActivity) {
        return NextResponse.json(
          { error: "Activity code already exists in this project" },
          { status: 409 }
        );
      }
    }

    // Update the activity
    const updatedActivity = await db.activity.update({
      where: {
        id: activityId,
      },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(budgetAmount !== undefined && {
          budgetAmount: budgetAmount ? parseFloat(budgetAmount) : null,
        }),
        ...(budgetM !== undefined && {
          budgetM: budgetM ? parseFloat(budgetM) : 0,
        }),
        ...(budgetS !== undefined && {
          budgetS: budgetS ? parseFloat(budgetS) : 0,
        }),
        ...(budgetD !== undefined && {
          budgetD: budgetD ? parseFloat(budgetD) : 0,
        }),
        ...(budgetE !== undefined && {
          budgetE: budgetE ? parseFloat(budgetE) : 0,
        }),
        ...(budgetMOD !== undefined && {
          budgetMOD: budgetMOD ? parseFloat(budgetMOD) : 0,
        }),
        ...(budgetMODHours !== undefined && {
          budgetMODHours: budgetMODHours ? parseFloat(budgetMODHours) : 0,
        }),
        ...(actualMODHours !== undefined && {
          actualMODHours: actualMODHours ? parseFloat(actualMODHours) : 0,
        }),
        ...(costType && { costType }),
        ...(costCategory && { costCategory }),
        ...(isActive !== undefined && { isActive }),
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

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/activities/[activityId]
 * Delete a specific activity
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;

    const { getCurrentOrgId } = await import("@/lib/auth");
    const organizationId = await getCurrentOrgId();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    // Check if activity exists and belongs to the organization
    const existingActivity = await db.activity.findFirst({
      where: {
        id: activityId,
        organizationId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Delete the activity (this will cascade delete sub-activities due to foreign key constraints)
    await db.activity.delete({
      where: {
        id: activityId,
      },
    });

    return NextResponse.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}
