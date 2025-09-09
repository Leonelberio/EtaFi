import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import {
  activityCostGroupSchema,
  type ActivityCostGroupInput,
} from "@/lib/validations";

interface RouteParams {
  params: Promise<{ activityId: string }>;
}

// GET /api/activities/[activityId]/cost-groups - Get activity cost groups
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activityId } = await params;

    // Verify activity exists and belongs to organization
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

    // Get cost groups for this activity
    const costGroups = await db.activityCostGroup.findMany({
      where: {
        activityId,
        isActive: true,
      },
      include: {
        glAccount: {
          select: {
            id: true,
            number: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { costGroup: "asc" },
    });

    // Calculate total percentage
    const totalPercentage = costGroups.reduce(
      (sum, group) => sum + Number(group.percentage),
      0
    );

    return NextResponse.json({
      activityId,
      activityName: activity.name,
      activityCode: activity.code,
      project: activity.project,
      costGroups,
      totalPercentage,
      isValid: Math.abs(totalPercentage - 100) < 0.01, // Allow small rounding errors
    });
  } catch (error) {
    console.error("Error fetching activity cost groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost groups" },
      { status: 500 }
    );
  }
}

// POST /api/activities/[activityId]/cost-groups - Create activity cost group
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activityId } = await params;
    const body: ActivityCostGroupInput = activityCostGroupSchema.parse(
      await req.json()
    );

    // Verify activity exists and belongs to organization
    const activity = await db.activity.findFirst({
      where: {
        id: activityId,
        organizationId,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Check if this cost group already exists for this activity
    const existingGroup = await db.activityCostGroup.findUnique({
      where: {
        activityId_costGroup: {
          activityId,
          costGroup: body.costGroup,
        },
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "This cost group already exists for this activity" },
        { status: 400 }
      );
    }

    // Verify GL account if provided
    if (body.glAccountId) {
      const glAccount = await db.chartAccount.findFirst({
        where: {
          id: body.glAccountId,
          organizationId,
          isActive: true,
        },
      });

      if (!glAccount) {
        return NextResponse.json(
          { error: "Chart account not found" },
          { status: 404 }
        );
      }
    }

    // Check that total percentage won't exceed 100%
    const existingGroups = await db.activityCostGroup.findMany({
      where: {
        activityId,
        isActive: true,
      },
    });

    const currentTotal = existingGroups.reduce(
      (sum, group) => sum + Number(group.percentage),
      0
    );

    if (currentTotal + body.percentage > 100.01) {
      // Allow small rounding errors
      return NextResponse.json(
        {
          error: "Total percentage would exceed 100%",
          currentTotal,
          requestedPercentage: body.percentage,
        },
        { status: 400 }
      );
    }

    // Create the cost group
    const costGroup = await db.activityCostGroup.create({
      data: {
        activityId,
        costGroup: body.costGroup,
        percentage: body.percentage,
        glAccountId: body.glAccountId,
        description: body.description,
        isActive: body.isActive ?? true,
      },
      include: {
        glAccount: {
          select: {
            id: true,
            number: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(costGroup, { status: 201 });
  } catch (error) {
    console.error("Error creating activity cost group:", error);
    return NextResponse.json(
      { error: "Failed to create cost group" },
      { status: 500 }
    );
  }
}

// PUT /api/activities/[activityId]/cost-groups - Update all cost groups for activity
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activityId } = await params;
    const body: { costGroups: ActivityCostGroupInput[] } = await req.json();

    // Verify activity exists and belongs to organization
    const activity = await db.activity.findFirst({
      where: {
        id: activityId,
        organizationId,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Validate that percentages add up to 100%
    const totalPercentage = body.costGroups.reduce(
      (sum, group) => sum + group.percentage,
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      return NextResponse.json(
        {
          error: "Total percentage must equal 100%",
          currentTotal: totalPercentage,
        },
        { status: 400 }
      );
    }

    // Update cost groups in a transaction
    const result = await db.$transaction(async (tx) => {
      // Delete existing cost groups
      await tx.activityCostGroup.deleteMany({
        where: { activityId },
      });

      // Create new cost groups
      const createdGroups = [];
      for (const groupData of body.costGroups) {
        // Validate the group data
        const validatedData = activityCostGroupSchema.parse(groupData);

        const group = await tx.activityCostGroup.create({
          data: {
            activityId,
            costGroup: validatedData.costGroup,
            percentage: validatedData.percentage,
            glAccountId: validatedData.glAccountId,
            description: validatedData.description,
            isActive: validatedData.isActive ?? true,
          },
          include: {
            glAccount: {
              select: {
                id: true,
                number: true,
                name: true,
                type: true,
              },
            },
          },
        });
        createdGroups.push(group);
      }

      return createdGroups;
    });

    return NextResponse.json({
      activityId,
      costGroups: result,
      totalPercentage,
      message: "Cost groups updated successfully",
    });
  } catch (error) {
    console.error("Error updating activity cost groups:", error);
    return NextResponse.json(
      { error: "Failed to update cost groups" },
      { status: 500 }
    );
  }
}
