import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { requireRole } from "@/lib/rbac-middleware";

// POST /api/project-templates/[templateId]/apply - Apply template to create a new project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require MEMBER role for applying templates
    await requireRole("MEMBER")(request);

    const { templateId } = await params;
    const body = await request.json();
    const {
      projectCode,
      projectName,
      projectDescription,
      clientId,
      managerId,
      tempManagerId,
      tempManagerEnd,
      startDate,
      endDate,
      totalBudget,
      currency = "CAD",
      kind = "BILLABLE",
      status = "ACTIVE",
    } = body;

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // Get the template with activities
    const template = await db.projectTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { organizationId: membership.organizationId },
          { isPublic: true },
        ],
        isActive: true,
      },
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
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Create project and activities in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the project
      const project = await tx.project.create({
        data: {
          organizationId: membership.organizationId,
          code: projectCode,
          name: projectName,
          description: projectDescription,
          clientId: clientId || null,
          managerId: managerId || null,
          tempManagerId: tempManagerId || null,
          tempManagerEnd: tempManagerEnd ? new Date(tempManagerEnd) : null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          totalBudget: totalBudget ? parseFloat(totalBudget) : template.totalBudget,
          currency,
          kind,
          status,
        },
      });

      // Create activities from template
      const activityMap = new Map<string, string>(); // template activity ID -> new activity ID

      for (const templateActivity of template.templateActivities) {
        const activity = await tx.activity.create({
          data: {
            organizationId: membership.organizationId,
            projectId: project.id,
            code: templateActivity.code,
            name: templateActivity.name,
            description: templateActivity.description,
            budgetAmount: templateActivity.budgetAmount,
            budgetM: templateActivity.budgetM,
            budgetS: templateActivity.budgetS,
            budgetD: templateActivity.budgetD,
            budgetE: templateActivity.budgetE,
            budgetMOD: templateActivity.budgetMOD,
            isActive: templateActivity.isActive,
            sortOrder: templateActivity.sortOrder,
          },
        });

        activityMap.set(templateActivity.id, activity.id);

        // Create sub-activities from template
        for (const templateSubActivity of templateActivity.templateSubActivities) {
          await tx.subActivity.create({
            data: {
              organizationId: membership.organizationId,
              projectId: project.id,
              activityId: activity.id,
              code: templateSubActivity.code,
              name: templateSubActivity.name,
              description: templateSubActivity.description,
              budgetAmount: templateSubActivity.budgetAmount,
              budgetM: templateSubActivity.budgetM,
              budgetS: templateSubActivity.budgetS,
              budgetD: templateSubActivity.budgetD,
              budgetE: templateSubActivity.budgetE,
              budgetMOD: templateSubActivity.budgetMOD,
              isActive: templateSubActivity.isActive,
              sortOrder: templateSubActivity.sortOrder,
            },
          });
        }
      }

      return project;
    });

    // Fetch the complete project with activities
    const completeProject = await db.project.findUnique({
      where: { id: result.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tempManager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        activities: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            subActivities: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        _count: {
          select: {
            activities: true,
            journalLines: true,
          },
        },
      },
    });

    return NextResponse.json({
      project: completeProject,
      success: true,
      message: `Project created successfully from template "${template.name}"`,
    });
  } catch (error) {
    console.error("Error applying project template:", error);
    return NextResponse.json(
      { error: "Failed to apply project template" },
      { status: 500 }
    );
  }
}