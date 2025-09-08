import { NextRequest, NextResponse } from "next/server";
import { currentUser, getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Chart Account validation schema
const chartAccountSchema = z.object({
  number: z
    .string()
    .min(4, "Account number must be at least 4 digits")
    .max(10, "Account number must be at most 10 digits"),
  name: z.string().min(2, "Account name is required").max(100),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE", "TAX"]),
  parentId: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isSystem: z.boolean().default(false),
  allowManualEntries: z.boolean().default(true),
  requireProjectAllocation: z.boolean().default(false),
  defaultTaxCodeId: z.string().optional(),
});

/**
 * GET /api/chart-accounts
 * Get all chart accounts for the organization
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const whereClause: any = {
      organizationId,
    };

    // Filter by account type if specified
    if (
      type &&
      ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE", "TAX"].includes(
        type
      )
    ) {
      whereClause.type = type;
    }

    // Filter by active status
    if (!includeInactive) {
      whereClause.isActive = true;
    } else if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }

    const chartAccounts = await db.chartAccount.findMany({
      where: whereClause,
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
      orderBy: [{ number: "asc" }, { name: "asc" }],
    });

    // Group accounts by type for better organization
    const groupedAccounts = {
      ASSET: chartAccounts.filter((acc) => acc.type === "ASSET"),
      LIABILITY: chartAccounts.filter((acc) => acc.type === "LIABILITY"),
      EQUITY: chartAccounts.filter((acc) => acc.type === "EQUITY"),
      REVENUE: chartAccounts.filter((acc) => acc.type === "REVENUE"),
      EXPENSE: chartAccounts.filter((acc) => acc.type === "EXPENSE"),
      TAX: chartAccounts.filter((acc) => acc.type === "TAX"),
    };

    return NextResponse.json({
      chartAccounts,
      groupedAccounts,
      totalCount: chartAccounts.length,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching chart accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart accounts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chart-accounts
 * Create a new chart account
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = chartAccountSchema.parse(body);

    // Check if account number already exists
    const existingAccount = await db.chartAccount.findFirst({
      where: {
        organizationId,
        number: validatedData.number,
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "Account number already exists" },
        { status: 400 }
      );
    }

    // Validate parent account if specified
    if (validatedData.parentId) {
      const parentAccount = await db.chartAccount.findFirst({
        where: {
          id: validatedData.parentId,
          organizationId,
        },
      });

      if (!parentAccount) {
        return NextResponse.json(
          { error: "Parent account not found" },
          { status: 400 }
        );
      }

      // Ensure parent and child have compatible types
      if (parentAccount.type !== validatedData.type) {
        return NextResponse.json(
          { error: "Child account type must match parent account type" },
          { status: 400 }
        );
      }
    }

    // Create the chart account
    const chartAccount = await db.chartAccount.create({
      data: {
        ...validatedData,
        organizationId,
      },
      include: {
        parent: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
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
      chartAccount,
      success: true,
      message: "Chart account created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating chart account:", error);
    return NextResponse.json(
      { error: "Failed to create chart account" },
      { status: 500 }
    );
  }
}
