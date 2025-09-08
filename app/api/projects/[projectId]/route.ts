import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac-middleware";
import { db } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: {
    projectId: string;
  };
}

// Project update schema
const updateProjectSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/)
    .optional(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  clientId: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
  tempManagerId: z.string().nullable().optional(),
  tempManagerEnd: z.string().datetime().nullable().optional(),
  kind: z.enum(["ADMIN", "BILLABLE"]).optional(),
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  totalBudget: z.number().positive().nullable().optional(),
  currency: z.string().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
});

/**
 * GET /api/projects/[projectId]
 * Get specific project details with comprehensive data
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

    const { projectId } = context.params;

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
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
          include: {
            subActivities: {
              include: {
                _count: {
                  select: {
                    journalLines: true,
                  },
                },
              },
              orderBy: { code: "asc" },
            },
            _count: {
              select: {
                subActivities: true,
                journalLines: true,
              },
            },
          },
          orderBy: { code: "asc" },
        },
        _count: {
          select: {
            activities: true,
            journalLines: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get recent project transactions
    const recentTransactions = await prisma.journalLine.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        entry: {
          select: {
            id: true,
            reference: true,
            description: true,
            date: true,
            status: true,
          },
        },
        account: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
        activity: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        subActivity: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Calculate project financial summary
    const financialSummary = await prisma.journalLine.groupBy({
      by: ["groupCode"],
      where: {
        projectId: projectId,
        entry: {
          status: "POSTED",
        },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    // Transform financial summary into 5-group format
    const groupSummary = {
      M: { debit: 0, credit: 0, net: 0 }, // Matériel
      S: { debit: 0, credit: 0, net: 0 }, // Sous-traitance
      D: { debit: 0, credit: 0, net: 0 }, // Divers
      E: { debit: 0, credit: 0, net: 0 }, // Équipement
      MOD: { debit: 0, credit: 0, net: 0 }, // Main-d'œuvre
    };

    financialSummary.forEach((group) => {
      if (
        group.groupCode &&
        groupSummary[group.groupCode as keyof typeof groupSummary]
      ) {
        const debit = Number(group._sum.debit) || 0;
        const credit = Number(group._sum.credit) || 0;
        groupSummary[group.groupCode as keyof typeof groupSummary] = {
          debit,
          credit,
          net: debit - credit,
        };
      }
    });

    // Calculate total budget
    const totalBudget = project.budgets
      .filter((b) => b.isApproved)
      .reduce((sum, budget) => {
        return (
          sum +
          Number(budget.budgetM) +
          Number(budget.budgetS) +
          Number(budget.budgetD) +
          Number(budget.budgetE) +
          Number(budget.budgetMOD)
        );
      }, 0);

    // Calculate total costs
    const totalCosts = Object.values(groupSummary).reduce(
      (sum, group) => sum + group.net,
      0
    );

    return NextResponse.json({
      project,
      recentTransactions,
      financialSummary: {
        groupSummary,
        totalBudget: Number(project.totalBudget) || totalBudget,
        totalCosts,
        remainingBudget:
          (Number(project.totalBudget) || totalBudget) - totalCosts,
        budgetUtilization:
          totalBudget > 0 ? (totalCosts / totalBudget) * 100 : 0,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/projects/[projectId]
 * Update project
 */
export const PUT = requireUpdate("PROJECTS")(async (
  request,
  context,
  authContext
) => {
  try {
    const { projectId } = context.params;
    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // Check if project exists and belongs to organization
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: authContext.organizationId,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If changing project code, check for duplicates
    if (validatedData.code && validatedData.code !== existingProject.code) {
      const duplicateProject = await prisma.project.findFirst({
        where: {
          organizationId: authContext.organizationId,
          code: validatedData.code,
          id: { not: projectId },
        },
      });

      if (duplicateProject) {
        return NextResponse.json(
          { error: "Project code already exists" },
          { status: 400 }
        );
      }
    }

    // Validate client if being changed
    if (validatedData.clientId !== undefined && validatedData.clientId) {
      const client = await prisma.customer.findFirst({
        where: {
          id: validatedData.clientId,
          organizationId: authContext.organizationId,
        },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 400 }
        );
      }
    }

    // Validate managers if being changed
    if (validatedData.managerId !== undefined && validatedData.managerId) {
      const manager = await prisma.organizationMembership.findFirst({
        where: {
          userId: validatedData.managerId,
          organizationId: authContext.organizationId,
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

    if (
      validatedData.tempManagerId !== undefined &&
      validatedData.tempManagerId
    ) {
      const tempManager = await prisma.organizationMembership.findFirst({
        where: {
          userId: validatedData.tempManagerId,
          organizationId: authContext.organizationId,
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

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...validatedData,
        clientId:
          validatedData.clientId === null ? null : validatedData.clientId,
        managerId:
          validatedData.managerId === null ? null : validatedData.managerId,
        tempManagerId:
          validatedData.tempManagerId === null
            ? null
            : validatedData.tempManagerId,
        tempManagerEnd:
          validatedData.tempManagerEnd === null
            ? null
            : validatedData.tempManagerEnd
              ? new Date(validatedData.tempManagerEnd)
              : undefined,
        startDate:
          validatedData.startDate === null
            ? null
            : validatedData.startDate
              ? new Date(validatedData.startDate)
              : undefined,
        endDate:
          validatedData.endDate === null
            ? null
            : validatedData.endDate
              ? new Date(validatedData.endDate)
              : undefined,
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
      project: updatedProject,
      success: true,
      message: "Project updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/projects/[projectId]
 * Delete project (with safety checks)
 */
export const DELETE = requireDelete("PROJECTS")(async (
  request,
  context,
  authContext
) => {
  try {
    const { projectId } = context.params;

    // Check if project exists and belongs to organization
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: authContext.organizationId,
      },
      include: {
        _count: {
          select: {
            activities: true,
            journalLines: true,
          },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Prevent deletion if project has transactions
    if (existingProject._count.journalLines > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete project with transaction history. Set status to CANCELLED instead.",
          hasTransactions: true,
        },
        { status: 400 }
      );
    }

    // Prevent deletion if project has invoices
    if (existingProject._count.invoices > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete project with invoices. Set status to CANCELLED instead.",
          hasInvoices: true,
        },
        { status: 400 }
      );
    }

    // Prevent deletion if project has purchase orders
    if (existingProject._count.purchaseOrders > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete project with purchase orders. Set status to CANCELLED instead.",
          hasPurchaseOrders: true,
        },
        { status: 400 }
      );
    }

    // Prevent deletion if project has timesheet entries
    if (existingProject._count.timesheets > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete project with timesheet entries. Set status to CANCELLED instead.",
          hasTimesheets: true,
        },
        { status: 400 }
      );
    }

    // Safe to delete (will cascade to activities and sub-activities)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
});
