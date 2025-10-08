import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";
import {
  activitySchema,
  activityWithSubActivitiesSchema,
} from "@/lib/validations";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// GET - Get all activities for a project
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Verify project exists and belongs to organization
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const activities = await db.activity.findMany({
      where: {
        projectId,
        organizationId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subActivities: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            subActivities: true,
            journalLines: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    });

    console.log(
      `Found ${activities.length} activities for project ${projectId}`
    );
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new activity
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = activityWithSubActivitiesSchema.parse(await req.json());

    // Verify project exists and belongs to organization
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if activity code is unique within project
    const existingActivity = await db.activity.findFirst({
      where: {
        projectId,
        code: body.code,
      },
    });

    if (existingActivity) {
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

    const activity = await db.activity.create({
      data: {
        organizationId,
        projectId,
        createdById: session.user.id,
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
        subActivities: {
          create:
            body.subActivities?.map((subActivity, index) => ({
              organizationId,
              projectId: projectId,
              createdById: session.user.id,
              code: `${body.code}-${String(index + 1).padStart(2, "0")}`,
              name: subActivity.name,
              description: subActivity.description || "",
              budgetAmount: subActivity.estimatedCost,
              budgetM: subActivity.budgetM || 0,
              budgetS: subActivity.budgetS || 0,
              budgetD: subActivity.budgetD || 0,
              budgetE: subActivity.budgetE || 0,
              budgetMOD: subActivity.budgetMOD || 0,
              budgetMODHours: subActivity.budgetMODHours || 0,
              estimatedHours: subActivity.estimatedHours,
              costType: subActivity.costType || "FIXED",
              costCategory: subActivity.costCategory || "CONTRACTUAL",
              isActive: true,
              sortOrder: index,
            })) || [],
        },
      },
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

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
