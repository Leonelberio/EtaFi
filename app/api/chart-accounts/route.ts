import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";
import { z } from "zod";

// Validation schema for chart account
const chartAccountSchema = z.object({
  number: z.string().min(1, "Account number is required"),
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE", "TAX"]),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  allowManualEntries: z.boolean().optional().default(true),
  requireProjectAllocation: z.boolean().optional().default(false),
  defaultTaxCodeId: z.string().optional(),
});

// GET /api/chart-accounts - Get chart of accounts for organization
export async function GET(req: NextRequest) {
  try {
    console.log("Chart accounts API called");
    const organizationId = await getCurrentOrgId();
    console.log("Organization ID:", organizationId);
    if (!organizationId) {
      console.log("No organization ID found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // Filter by account type
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    // Build where clause
    const whereClause: any = {
      organizationId,
    };

    if (type) {
      whereClause.type = type;
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }

    if (search) {
      whereClause.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const accounts = await db.chartAccount.findMany({
      where: whereClause,
      select: {
        id: true,
        number: true,
        name: true,
        type: true,
        description: true,
        isActive: true,
        isSystem: true,
        allowManualEntries: true,
        requireProjectAllocation: true,
        defaultTaxCodeId: true,
        defaultTaxCode: {
          select: {
            id: true,
            code: true,
            name: true,
            rate: true,
          },
        },
      },
      orderBy: [{ number: "asc" }],
    });

    // Group accounts by type for easier consumption
    const groupedAccounts = {
      ASSET: accounts.filter((a) => a.type === "ASSET"),
      LIABILITY: accounts.filter((a) => a.type === "LIABILITY"),
      EQUITY: accounts.filter((a) => a.type === "EQUITY"),
      REVENUE: accounts.filter((a) => a.type === "REVENUE"),
      EXPENSE: accounts.filter((a) => a.type === "EXPENSE"),
      TAX: accounts.filter((a) => a.type === "TAX"),
    };

    // Count by type
    const summary = {
      total: accounts.length,
      active: accounts.filter((a) => a.isActive).length,
      byType: {
        ASSET: groupedAccounts.ASSET.length,
        LIABILITY: groupedAccounts.LIABILITY.length,
        EQUITY: groupedAccounts.EQUITY.length,
        REVENUE: groupedAccounts.REVENUE.length,
        EXPENSE: groupedAccounts.EXPENSE.length,
        TAX: groupedAccounts.TAX.length,
      },
    };

    return NextResponse.json({
      accounts,
      groupedAccounts,
      summary,
      filters: {
        type,
        isActive,
        search,
      },
    });
  } catch (error) {
    console.error("Error fetching chart accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart accounts" },
      { status: 500 }
    );
  }
}

// POST /api/chart-accounts - Create a new chart account
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = chartAccountSchema.parse(body);

    // Check if account number already exists for this organization
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

    // Create the chart account
    const account = await db.chartAccount.create({
      data: {
        organizationId,
        number: validatedData.number,
        name: validatedData.name,
        type: validatedData.type,
        description: validatedData.description,
        isActive: validatedData.isActive ?? true,
        isSystem: false, // User-created accounts are not system accounts
        allowManualEntries: validatedData.allowManualEntries ?? true,
        requireProjectAllocation:
          validatedData.requireProjectAllocation ?? false,
        defaultTaxCodeId: validatedData.defaultTaxCodeId,
      },
      include: {
        defaultTaxCode: {
          select: {
            id: true,
            code: true,
            name: true,
            rate: true,
          },
        },
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
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
