import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { requireRole } from "@/lib/rbac-middleware";
import { budgetSchema } from "@/lib/validations";

// GET /api/budgets/[budgetId] - Get a specific budget
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ budgetId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { budgetId } = await params;

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const budget = await db.budget.findFirst({
      where: {
        id: budgetId,
        organizationId: membership.organizationId,
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
        revisions: {
          orderBy: { createdAt: "desc" },
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          include: {
            resolver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget" },
      { status: 500 }
    );
  }
}

// PUT /api/budgets/[budgetId] - Update a budget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ budgetId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require ADMIN role for updating budgets
    await requireRole("ADMIN")(request);

    const { budgetId } = await params;
    const body = await request.json();
    const validatedData = budgetSchema.parse(body);

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // Check if budget exists and user has access
    const existingBudget = await db.budget.findFirst({
      where: {
        id: budgetId,
        organizationId: membership.organizationId,
      },
    });

    if (!existingBudget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Update budget
    const budget = await db.budget.update({
      where: { id: budgetId },
      data: {
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
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
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
    console.error("Error updating budget:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[budgetId] - Delete a budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ budgetId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require ADMIN role for deleting budgets
    await requireRole("ADMIN")(request);

    const { budgetId } = await params;

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // Check if budget exists and user has access
    const existingBudget = await db.budget.findFirst({
      where: {
        id: budgetId,
        organizationId: membership.organizationId,
      },
    });

    if (!existingBudget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Delete budget (cascade will handle related records)
    await db.budget.delete({
      where: { id: budgetId },
    });

    return NextResponse.json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    );
  }
}
