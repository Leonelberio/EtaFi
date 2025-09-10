const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testChartAPI() {
  try {
    // Get the organization ID for "New Test User's Organization"
    const org = await prisma.organization.findFirst({
      where: {
        name: "New Test User's Organization"
      }
    });

    if (!org) {
      console.log("Organization not found");
      return;
    }

    console.log("Organization ID:", org.id);

    // Simulate the exact API query
    const accounts = await prisma.chartAccount.findMany({
      where: {
        organizationId: org.id
      },
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

    const response = {
      accounts,
      groupedAccounts,
      summary,
      filters: {
        type: null,
        isActive: null,
        search: null,
      },
    };

    console.log("API Response structure:");
    console.log("- accounts.length:", response.accounts.length);
    console.log("- summary.total:", response.summary.total);
    console.log("- summary.active:", response.summary.active);
    console.log("- summary.byType:", response.summary.byType);

    console.log("\nFirst 3 accounts:");
    response.accounts.slice(0, 3).forEach(acc => {
      console.log(`- ${acc.number}: ${acc.name} (${acc.type})`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testChartAPI();
