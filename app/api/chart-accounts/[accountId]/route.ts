import { NextRequest, NextResponse } from "next/server";
import { currentUser, getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

interface RouteParams {
  params: Promise<{
    accountId: string;
  }>;
}

// Chart Account update schema
const updateChartAccountSchema = z.object({
  number: z.string().min(4).max(10).optional(),
  name: z.string().min(2).max(100).optional(),
  type: z
    .enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE", "TAX"])
    .optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  allowManualEntries: z.boolean().optional(),
  requireProjectAllocation: z.boolean().optional(),
  defaultTaxCodeId: z.string().nullable().optional(),
});

/**
 * GET /api/chart-accounts/[accountId]
 * Get specific chart account details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get organization ID
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    const { accountId } = await params;

    const chartAccount = await db.chartAccount.findFirst({
      where: {
        id: accountId,
        organizationId,
      },
      include: {
        defaultTaxCode: {
          select: {
            id: true,
            name: true,
            rate: true,
          },
        },
        _count: {
          select: {
            journalLines: true,
          },
        },
      },
    });

    if (!chartAccount) {
      return NextResponse.json(
        { error: "Chart account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      chartAccount,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching chart account:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart account" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/chart-accounts/[accountId]
 * Update chart account
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get organization ID
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    const { accountId } = await params;
    const body = await request.json();
    const validatedData = updateChartAccountSchema.parse(body);

    // Check if account exists and belongs to organization
    const existingAccount = await db.chartAccount.findFirst({
      where: {
        id: accountId,
        organizationId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Chart account not found" },
        { status: 404 }
      );
    }

    // Prevent modification of system accounts
    if (existingAccount.isSystem) {
      return NextResponse.json(
        { error: "Cannot modify system accounts" },
        { status: 400 }
      );
    }

    // If changing account number, check for duplicates
    if (
      validatedData.number &&
      validatedData.number !== existingAccount.number
    ) {
      const duplicateAccount = await db.chartAccount.findFirst({
        where: {
          organizationId,
          number: validatedData.number,
          id: { not: accountId },
        },
      });

      if (duplicateAccount) {
        return NextResponse.json(
          { error: "Account number already exists" },
          { status: 400 }
        );
      }
    }

    // Update the account
    const updatedAccount = await db.chartAccount.update({
      where: { id: accountId },
      data: {
        ...validatedData,
        defaultTaxCodeId:
          validatedData.defaultTaxCodeId === null
            ? null
            : validatedData.defaultTaxCodeId,
      },
      include: {
        defaultTaxCode: {
          select: {
            id: true,
            name: true,
            rate: true,
          },
        },
      },
    });

    return NextResponse.json({
      chartAccount: updatedAccount,
      success: true,
      message: "Chart account updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating chart account:", error);
    return NextResponse.json(
      { error: "Failed to update chart account" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chart-accounts/[accountId]
 * Delete chart account (with safety checks)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get organization ID
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    const { accountId } = await params;

    // Check if account exists and belongs to organization
    const existingAccount = await db.chartAccount.findFirst({
      where: {
        id: accountId,
        organizationId,
      },
      include: {
        _count: {
          select: {
            journalLines: true,
          },
        },
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: "Chart account not found" },
        { status: 404 }
      );
    }

    // Prevent deletion of system accounts
    if (existingAccount.isSystem) {
      return NextResponse.json(
        { error: "Cannot delete system accounts" },
        { status: 400 }
      );
    }

    // Prevent deletion if account has transactions
    if (existingAccount._count.journalLines > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete account with transaction history. Deactivate instead.",
          hasTransactions: true,
        },
        { status: 400 }
      );
    }

    // Safe to delete
    await db.chartAccount.delete({
      where: { id: accountId },
    });

    return NextResponse.json({
      success: true,
      message: "Chart account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chart account:", error);
    return NextResponse.json(
      { error: "Failed to delete chart account" },
      { status: 500 }
    );
  }
}
