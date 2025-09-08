import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { requireRole } from "@/lib/rbac-middleware";

// GET /api/project-templates - List all project templates
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const industry = searchParams.get("industry");
    const isPublic = searchParams.get("isPublic");
    const isActive = searchParams.get("isActive");

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const whereClause: any = {
      OR: [
        { organizationId: membership.organizationId },
        { isPublic: true },
      ],
    };

    // Apply filters
    if (category) {
      whereClause.category = category;
    }
    if (industry) {
      whereClause.industry = industry;
    }
    if (isPublic !== null) {
      whereClause.isPublic = isPublic === "true";
    }
    if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }

    const templates = await db.projectTemplate.findMany({
      where: whereClause,
      include: {
        templateActivities: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            templateSubActivities: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            templateActivities: true,
          },
        },
      },
      orderBy: [
        { isPublic: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching project templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch project templates" },
      { status: 500 }
    );
  }
}

// POST /api/project-templates - Create a new project template
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require ADMIN role for creating templates
    await requireRole("ADMIN")(request);

    const body = await request.json();
    const {
      name,
      description,
      category,
      industry,
      totalBudget,
      currency = "CAD",
      isPublic = false,
      activities = [],
    } = body;

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // Create template with activities in a transaction
    const template = await db.$transaction(async (tx) => {
      // Create the template
      const newTemplate = await tx.projectTemplate.create({
        data: {
          organizationId: membership.organizationId,
          name,
          description,
          category,
          industry,
          totalBudget: totalBudget ? parseFloat(totalBudget) : null,
          currency,
          isPublic,
          createdById: session.user.id,
        },
      });

      // Create template activities
      for (const activity of activities) {
        const templateActivity = await tx.templateActivity.create({
          data: {
            templateId: newTemplate.id,
            code: activity.code,
            name: activity.name,
            description: activity.description,
            budgetAmount: activity.budgetAmount ? parseFloat(activity.budgetAmount) : null,
            budgetM: activity.budgetM ? parseFloat(activity.budgetM) : null,
            budgetS: activity.budgetS ? parseFloat(activity.budgetS) : null,
            budgetD: activity.budgetD ? parseFloat(activity.budgetD) : null,
            budgetE: activity.budgetE ? parseFloat(activity.budgetE) : null,
            budgetMOD: activity.budgetMOD ? parseFloat(activity.budgetMOD) : null,
            isActive: activity.isActive !== false,
            sortOrder: activity.sortOrder || 0,
          },
        });

        // Create template sub-activities if any
        if (activity.subActivities && activity.subActivities.length > 0) {
          for (const subActivity of activity.subActivities) {
            await tx.templateSubActivity.create({
              data: {
                templateId: newTemplate.id,
                activityId: templateActivity.id,
                code: subActivity.code,
                name: subActivity.name,
                description: subActivity.description,
                budgetAmount: subActivity.budgetAmount ? parseFloat(subActivity.budgetAmount) : null,
                budgetM: subActivity.budgetM ? parseFloat(subActivity.budgetM) : null,
                budgetS: subActivity.budgetS ? parseFloat(subActivity.budgetS) : null,
                budgetD: subActivity.budgetD ? parseFloat(subActivity.budgetD) : null,
                budgetE: subActivity.budgetE ? parseFloat(subActivity.budgetE) : null,
                budgetMOD: subActivity.budgetMOD ? parseFloat(subActivity.budgetMOD) : null,
                isActive: subActivity.isActive !== false,
                sortOrder: subActivity.sortOrder || 0,
              },
            });
          }
        }
      }

      return newTemplate;
    });

    // Fetch the complete template with relations
    const completeTemplate = await db.projectTemplate.findUnique({
      where: { id: template.id },
      include: {
        templateActivities: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            templateSubActivities: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            templateActivities: true,
          },
        },
      },
    });

    return NextResponse.json({
      template: completeTemplate,
      success: true,
    });
  } catch (error) {
    console.error("Error creating project template:", error);
    return NextResponse.json(
      { error: "Failed to create project template" },
      { status: 500 }
    );
  }
}