import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { requireRole } from "@/lib/rbac-middleware";
import { budgetSchema } from "@/lib/validations";

// GET /api/budgets - List all budgets
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const activityId = searchParams.get("activityId");
    const subActivityId = searchParams.get("subActivityId");
    const status = searchParams.get("status");
    const isActive = searchParams.get("isActive");

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    const whereClause: any = {
      organizationId: membership.organizationId,
    };

    // Apply filters
    if (projectId) whereClause.projectId = projectId;
    if (activityId) whereClause.activityId = activityId;
    if (subActivityId) whereClause.subActivityId = subActivityId;
    if (status) whereClause.status = status;
    if (isActive !== null) whereClause.isActive = isActive === "true";

    const budgets = await db.budget.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        activity: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        subActivity: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        alerts: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            revisions: true,
            alerts: true,
          },
        },
      },
      orderBy: [
        { project: { name: "asc" } },
        { activity: { sortOrder: "asc" } },
        { subActivity: { sortOrder: "asc" } },
      ],
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add role-based access control for budget creation

    const body = await request.json();
    const validatedData = budgetSchema.parse(body);

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    // Verify project exists and user has access
    const project = await db.project.findFirst({
      where: {
        id: validatedData.projectId,
        organizationId: membership.organizationId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify activity exists if provided
    if (validatedData.activityId) {
      const activity = await db.activity.findFirst({
        where: {
          id: validatedData.activityId,
          projectId: validatedData.projectId,
          organizationId: membership.organizationId,
        },
      });

      if (!activity) {
        return NextResponse.json(
          { error: "Activity not found" },
          { status: 404 }
        );
      }
    }

    // Verify sub-activity exists if provided
    if (validatedData.subActivityId) {
      const subActivity = await db.subActivity.findFirst({
        where: {
          id: validatedData.subActivityId,
          projectId: validatedData.projectId,
          organizationId: membership.organizationId,
        },
      });

      if (!subActivity) {
        return NextResponse.json(
          { error: "Sub-activity not found" },
          { status: 404 }
        );
      }
    }

    // Create budget
    const budget = await db.budget.create({
      data: {
        organizationId: membership.organizationId,
        projectId: validatedData.projectId,
        activityId: validatedData.activityId || null,
        subActivityId: validatedData.subActivityId || null,
        name: validatedData.name,
        description: validatedData.description,
        budgetAmount: validatedData.budgetAmount,
        currency: validatedData.currency,
        budgetM: validatedData.budgetM || 0,
        budgetS: validatedData.budgetS || 0,
        budgetD: validatedData.budgetD || 0,
        budgetE: validatedData.budgetE || 0,
        budgetMOD: validatedData.budgetMOD || 0,
        status: validatedData.status,
        isActive: validatedData.isActive,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        activity: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        subActivity: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            revisions: true,
            alerts: true,
          },
        },
      },
    });

    return NextResponse.json({
      budget,
      success: true,
    });
  } catch (error) {
    console.error("Error creating budget:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}
