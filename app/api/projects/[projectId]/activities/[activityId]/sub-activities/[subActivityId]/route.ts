import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{
    projectId: string;
    activityId: string;
    subActivityId: string;
  }>;
}

// DELETE - Delete a specific sub-activity
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, activityId, subActivityId } = await params;

    // Verify the sub-activity exists and belongs to the organization
    const subActivity = await db.subActivity.findFirst({
      where: {
        id: subActivityId,
        activityId: activityId,
        projectId: projectId,
        organizationId: organizationId,
      },
    });

    if (!subActivity) {
      return NextResponse.json(
        { error: "Sub-activity not found" },
        { status: 404 }
      );
    }

    // Delete the sub-activity
    await db.subActivity.delete({
      where: {
        id: subActivityId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sub-activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a specific sub-activity
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, activityId, subActivityId } = await params;
    const body = await req.json();

    // Verify the sub-activity exists and belongs to the organization
    const existingSubActivity = await db.subActivity.findFirst({
      where: {
        id: subActivityId,
        activityId: activityId,
        projectId: projectId,
        organizationId: organizationId,
      },
    });

    if (!existingSubActivity) {
      return NextResponse.json(
        { error: "Sub-activity not found" },
        { status: 404 }
      );
    }

    // Update the sub-activity
    const updatedSubActivity = await db.subActivity.update({
      where: {
        id: subActivityId,
      },
      data: {
        name: body.name,
        description: body.description,
        budgetAmount: body.budgetAmount,
        budgetM: body.budgetM,
        budgetS: body.budgetS,
        budgetD: body.budgetD,
        budgetE: body.budgetE,
        budgetMOD: body.budgetMOD,
        budgetMODHours: body.budgetMODHours,
        actualMODHours: body.actualMODHours,
        costType: body.costType,
        costCategory: body.costCategory,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    });

    return NextResponse.json(updatedSubActivity);
  } catch (error) {
    console.error("Error updating sub-activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
