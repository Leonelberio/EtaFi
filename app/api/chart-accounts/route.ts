import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";

// GET /api/chart-accounts - Get chart of accounts for organization
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
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
      orderBy: [
        { number: "asc" },
      ],
    });

    // Group accounts by type for easier consumption
    const groupedAccounts = {
      ASSET: accounts.filter(a => a.type === "ASSET"),
      LIABILITY: accounts.filter(a => a.type === "LIABILITY"),
      EQUITY: accounts.filter(a => a.type === "EQUITY"),
      REVENUE: accounts.filter(a => a.type === "REVENUE"),
      EXPENSE: accounts.filter(a => a.type === "EXPENSE"),
      TAX: accounts.filter(a => a.type === "TAX"),
    };

    // Count by type
    const summary = {
      total: accounts.length,
      active: accounts.filter(a => a.isActive).length,
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