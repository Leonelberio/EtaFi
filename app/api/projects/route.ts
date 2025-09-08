import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac-middleware";
import { db } from "@/lib/db";
import { z } from "zod";

// Project validation schema
const projectSchema = z.object({
  code: z
    .string()
    .min(3, "Project code must be at least 3 characters")
    .max(20, "Project code must be at most 20 characters")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Project code must contain only uppercase letters, numbers, underscore, and dash"
    ),
  name: z.string().min(2, "Project name is required").max(100),
  description: z.string().optional(),
  clientId: z.string().optional(),
  managerId: z.string().optional(),
  tempManagerId: z.string().optional(),
  tempManagerEnd: z.string().datetime().optional(),
  kind: z.enum(["ADMIN", "BILLABLE"]).default("BILLABLE"),
  status: z
    .enum(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
    .default("ACTIVE"),
  totalBudget: z.number().positive().optional(),
  currency: z.string().default("CAD"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * GET /api/projects
 * Get all projects for the organization
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
    const status = searchParams.get("status");
    const kind = searchParams.get("kind");
    const managerId = searchParams.get("managerId");
    const clientId = searchParams.get("clientId");
    const includeArchived = searchParams.get("includeArchived") === "true";

    const whereClause: any = {
      organizationId,
    };

    // Filter by status
    if (
      status &&
      ["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"].includes(status)
    ) {
      whereClause.status = status;
    } else if (!includeArchived) {
      whereClause.status = { in: ["ACTIVE", "ON_HOLD"] };
    }

    // Filter by project kind
    if (kind && ["ADMIN", "BILLABLE"].includes(kind)) {
      whereClause.kind = kind;
    }

    // Filter by manager
    if (managerId) {
      whereClause.OR = [{ managerId: managerId }, { tempManagerId: managerId }];
    }

    // Filter by client
    if (clientId) {
      whereClause.clientId = clientId;
    }

    const projects = await db.project.findMany({
      where: whereClause,
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
          select: {
            id: true,
            code: true,
            name: true,
            isActive: true,
            budgetAmount: true,
            costToDate: true,
            _count: {
              select: {
                subActivities: true,
              },
            },
          },
          orderBy: { code: "asc" },
        },
        _count: {
          select: {
            activities: true,
            invoices: true,
            journalLines: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { code: "asc" }],
    });

    // Calculate totals for each project
    const projectsWithTotals = projects.map((project) => {
      const calculatedBudget = project.activities.reduce((sum, activity) => {
        return sum + Number(activity.budgetAmount || 0);
      }, 0);

      const calculatedActual = project.activities.reduce((sum, activity) => {
        return sum + Number(activity.costToDate || 0);
      }, 0);

      return {
        ...project,
        totalBudget: project.totalBudget || calculatedBudget,
        calculatedBudget,
        calculatedActual,
      };
    });

    // Group projects by status for better organization
    const groupedProjects = {
      ACTIVE: projectsWithTotals.filter((p) => p.status === "ACTIVE"),
      ON_HOLD: projectsWithTotals.filter((p) => p.status === "ON_HOLD"),
      COMPLETED: projectsWithTotals.filter((p) => p.status === "COMPLETED"),
      CANCELLED: projectsWithTotals.filter((p) => p.status === "CANCELLED"),
    };

    return NextResponse.json({
      projects: projectsWithTotals,
      groupedProjects,
      totalCount: projectsWithTotals.length,
      summary: {
        active: groupedProjects.ACTIVE.length,
        onHold: groupedProjects.ON_HOLD.length,
        completed: groupedProjects.COMPLETED.length,
        cancelled: groupedProjects.CANCELLED.length,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
export const POST = requireRole("ADMIN")(async (request, context) => {
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

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    // Check if project code already exists
    const existingProject = await db.project.findFirst({
      where: {
        organizationId,
        code: validatedData.code,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project code already exists" },
        { status: 400 }
      );
    }

    // Validate client if specified
    if (validatedData.clientId) {
      const client = await db.customer.findFirst({
        where: {
          id: validatedData.clientId,
          organizationId,
        },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 400 }
        );
      }
    }

    // Validate manager if specified
    if (validatedData.managerId) {
      const manager = await db.organizationMembership.findFirst({
        where: {
          userId: validatedData.managerId,
          organizationId,
          isActive: true,
        },
      });

      if (!manager) {
        return NextResponse.json(
          { error: "Project manager not found in organization" },
          { status: 400 }
        );
      }
    }

    // Validate temporary manager if specified
    if (validatedData.tempManagerId) {
      const tempManager = await db.organizationMembership.findFirst({
        where: {
          userId: validatedData.tempManagerId,
          organizationId,
          isActive: true,
        },
      });

      if (!tempManager) {
        return NextResponse.json(
          { error: "Temporary manager not found in organization" },
          { status: 400 }
        );
      }

      if (!validatedData.tempManagerEnd) {
        return NextResponse.json(
          { error: "Temporary manager end date is required" },
          { status: 400 }
        );
      }
    }

    // Create the project
    const project = await db.project.create({
      data: {
        ...validatedData,
        organizationId,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        tempManagerEnd: validatedData.tempManagerEnd
          ? new Date(validatedData.tempManagerEnd)
          : null,
      },
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
      },
    });

    return NextResponse.json({
      project,
      success: true,
      message: "Project created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
});
