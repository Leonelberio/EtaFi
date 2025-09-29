import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import {
  activitySchema,
  activityWithSubActivitiesSchema,
} from "@/lib/validations";

interface RouteParams {
  params: Promise<{ projectId: string; activityId: string }>;
}

// GET - Get specific activity
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, activityId } = await params;

    const activity = await db.activity.findFirst({
      where: {
        id: activityId,
        projectId,
        organizationId,
      },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            name: true,
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
          orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
        },
        _count: {
          select: {
            subActivities: true,
            journalLines: true,
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update activity
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, activityId } = await params;
    const body = activityWithSubActivitiesSchema.parse(await req.json());

    // Check if activity exists and belongs to organization
    const existingActivity = await db.activity.findFirst({
      where: {
        id: activityId,
        projectId,
        organizationId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Check if code is unique within project (excluding current activity)
    const duplicateCode = await db.activity.findFirst({
      where: {
        projectId,
        code: body.code,
        id: { not: activityId },
      },
    });

    if (duplicateCode) {
      return NextResponse.json(
        { error: "Activity code already exists in this project" },
        { status: 400 }
      );
    }

    // Calculate total budget from 5-group breakdown if provided
    const totalBudget =
      body.budgetAmount ||
      (body.budgetM || 0) +
        (body.budgetS || 0) +
        (body.budgetD || 0) +
        (body.budgetE || 0) +
        (body.budgetMOD || 0);

    // Use transaction to update activity and sub-activities
    const updatedActivity = await db.$transaction(async (tx) => {
      // First, delete existing sub-activities
      await tx.subActivity.deleteMany({
        where: {
          activityId: activityId,
        },
      });

      // Update the activity
      const activity = await tx.activity.update({
        where: {
          id: activityId,
        },
        data: {
          code: body.code,
          name: body.name,
          description: body.description,
          budgetAmount: totalBudget,
          budgetM: body.budgetM || 0,
          budgetS: body.budgetS || 0,
          budgetD: body.budgetD || 0,
          budgetE: body.budgetE || 0,
          budgetMOD: body.budgetMOD || 0,
          isActive: body.isActive ?? true,
          sortOrder: body.sortOrder ?? 0,
        },
      });

      // Create new sub-activities if any
      if (body.subActivities && body.subActivities.length > 0) {
        await tx.subActivity.createMany({
          data: body.subActivities.map((subActivity, index) => ({
            organizationId,
            projectId: projectId,
            activityId: activityId,
            code: `${body.code}-${String(index + 1).padStart(2, "0")}`,
            name: subActivity.name,
            description: subActivity.description || "",
            budgetAmount: subActivity.estimatedCost,
            estimatedHours: subActivity.estimatedHours,
            isActive: true,
            sortOrder: index,
          })),
        });
      }

      // Return the updated activity with sub-activities
      return await tx.activity.findUnique({
        where: { id: activityId },
        include: {
          subActivities: {
            orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
          },
          _count: {
            select: {
              subActivities: true,
              journalLines: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete activity
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, activityId } = await params;

    // Check if activity exists and belongs to organization
    const existingActivity = await db.activity.findFirst({
      where: {
        id: activityId,
        projectId,
        organizationId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Check if activity has journal entries
    const journalEntryCount = await db.journalLine.count({
      where: {
        activityId: activityId,
      },
    });

    if (journalEntryCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete activity",
          details: `This activity has ${journalEntryCount} journal entries. Please deactivate it instead.`,
        },
        { status: 400 }
      );
    }

    // Check if activity has sub-activities
    const subActivityCount = await db.subActivity.count({
      where: {
        activityId: activityId,
      },
    });

    if (subActivityCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete activity",
          details: `This activity has ${subActivityCount} sub-activities. Please delete them first or deactivate the activity.`,
        },
        { status: 400 }
      );
    }

    await db.activity.delete({
      where: {
        id: activityId,
      },
    });

    return NextResponse.json({
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
