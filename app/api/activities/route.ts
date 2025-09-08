import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac-middleware";
import { db } from "@/lib/db";

/**
 * GET /api/activities
 * Get all activities across all projects for the organization
 */
export const GET = requireRole("MEMBER")(async (request, context) => {
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
});
