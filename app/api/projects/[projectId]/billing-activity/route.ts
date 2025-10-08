import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId]/billing-activity - Get default billing activity for project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Find the billing default activity for this project
    const billingActivity = await db.activity.findFirst({
      where: {
        projectId,
        organizationId,
        isBillingDefault: true,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
      },
    });

    if (!billingActivity) {
      return NextResponse.json(
        {
          error:
            "Aucune activité de facturation par défaut trouvée pour ce projet",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ activity: billingActivity });
  } catch (error) {
    console.error("Error fetching billing activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing activity" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId]/billing-activity - Set default billing activity
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const { activityId } = body;

    if (!activityId) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    // Verify the activity belongs to this project
    const activity = await db.activity.findFirst({
      where: {
        id: activityId,
        projectId,
        organizationId,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Use a transaction to update
    await db.$transaction(async (tx) => {
      // First, remove billing default flag from all activities in this project
      await tx.activity.updateMany({
        where: {
          projectId,
          organizationId,
        },
        data: {
          isBillingDefault: false,
        },
      });

      // Then set the new billing default
      await tx.activity.update({
        where: {
          id: activityId,
        },
        data: {
          isBillingDefault: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Activité de facturation par défaut mise à jour",
    });
  } catch (error) {
    console.error("Error setting billing activity:", error);
    return NextResponse.json(
      { error: "Failed to set billing activity" },
      { status: 500 }
    );
  }
}
