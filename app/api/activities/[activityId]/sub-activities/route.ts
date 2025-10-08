import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    activityId: string;
  }>;
}

// GET /api/activities/[activityId]/sub-activities - Get all sub-activities for an activity
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { activityId } = await params;
    const organizationId = await getCurrentOrgId();

    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch sub-activities for the activity
    const subActivities = await db.subActivity.findMany({
      where: {
        activityId,
        organizationId,
        isActive: true, // Only return active sub-activities
      },
      select: {
        id: true,
        code: true,
        name: true,
        activityId: true,
      },
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    });

    return NextResponse.json(subActivities);
  } catch (error) {
    console.error("Error fetching sub-activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch sub-activities" },
      { status: 500 }
    );
  }
}
