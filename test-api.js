const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPI() {
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

    // Test the chart accounts query that the API uses
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

    console.log("Found accounts:", accounts.length);
    console.log("First 5 accounts:");
    accounts.slice(0, 5).forEach(acc => {
      console.log(`- ${acc.number}: ${acc.name} (${acc.type})`);
    });

    // Test the API response format
    const groupedAccounts = {
      ASSET: accounts.filter(a => a.type === "ASSET"),
      LIABILITY: accounts.filter(a => a.type === "LIABILITY"),
      EQUITY: accounts.filter(a => a.type === "EQUITY"),
      REVENUE: accounts.filter(a => a.type === "REVENUE"),
      EXPENSE: accounts.filter(a => a.type === "EXPENSE"),
      TAX: accounts.filter(a => a.type === "TAX"),
    };

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

    console.log("\nSummary:", summary);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
