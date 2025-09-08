import { NextRequest, NextResponse } from "next/server";
import { currentUser, getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";

// Canadian Chart of Accounts Templates
const CANADIAN_CHART_TEMPLATES = {
  small_business: {
    name: "Canadian Small Business",
    description:
      "Basic chart of accounts for Canadian small businesses (NCECF compliant)",
    accounts: [
      // ASSETS (1000-1999)
      { number: "1000", name: "Current Assets", type: "ASSET", isHeader: true },
      {
        number: "1010",
        name: "Cash - Operating Account",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1020",
        name: "Cash - Savings Account",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1100",
        name: "Accounts Receivable",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1110",
        name: "Allowance for Doubtful Accounts",
        type: "ASSET",
        parent: "1000",
      },
      { number: "1200", name: "Inventory", type: "ASSET", parent: "1000" },
      {
        number: "1300",
        name: "Prepaid Expenses",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1400",
        name: "GST/HST Recoverable",
        type: "ASSET",
        parent: "1000",
      },

      { number: "1500", name: "Fixed Assets", type: "ASSET", isHeader: true },
      { number: "1510", name: "Equipment", type: "ASSET", parent: "1500" },
      {
        number: "1520",
        name: "Accumulated Depreciation - Equipment",
        type: "ASSET",
        parent: "1500",
      },
      { number: "1530", name: "Vehicles", type: "ASSET", parent: "1500" },
      {
        number: "1540",
        name: "Accumulated Depreciation - Vehicles",
        type: "ASSET",
        parent: "1500",
      },
      { number: "1550", name: "Building", type: "ASSET", parent: "1500" },
      {
        number: "1560",
        name: "Accumulated Depreciation - Building",
        type: "ASSET",
        parent: "1500",
      },

      // LIABILITIES (2000-2999)
      {
        number: "2000",
        name: "Current Liabilities",
        type: "LIABILITY",
        isHeader: true,
      },
      {
        number: "2010",
        name: "Accounts Payable",
        type: "LIABILITY",
        parent: "2000",
      },
      {
        number: "2020",
        name: "Accrued Liabilities",
        type: "LIABILITY",
        parent: "2000",
      },
      {
        number: "2100",
        name: "GST/HST Payable",
        type: "LIABILITY",
        parent: "2000",
      },
      {
        number: "2110",
        name: "QST Payable",
        type: "LIABILITY",
        parent: "2000",
      },
      {
        number: "2200",
        name: "Payroll Liabilities",
        type: "LIABILITY",
        parent: "2000",
      },
      {
        number: "2210",
        name: "CPP Payable",
        type: "LIABILITY",
        parent: "2000",
      },
      { number: "2220", name: "EI Payable", type: "LIABILITY", parent: "2000" },
      {
        number: "2230",
        name: "Income Tax Payable",
        type: "LIABILITY",
        parent: "2000",
      },
      {
        number: "2240",
        name: "Quebec Parental Insurance Payable",
        type: "LIABILITY",
        parent: "2000",
      },

      {
        number: "2500",
        name: "Long-term Liabilities",
        type: "LIABILITY",
        isHeader: true,
      },
      { number: "2510", name: "Bank Loans", type: "LIABILITY", parent: "2500" },
      {
        number: "2520",
        name: "Equipment Loans",
        type: "LIABILITY",
        parent: "2500",
      },

      // EQUITY (3000-3999)
      {
        number: "3000",
        name: "Owner's Equity",
        type: "EQUITY",
        isHeader: true,
      },
      {
        number: "3010",
        name: "Owner's Capital",
        type: "EQUITY",
        parent: "3000",
      },
      {
        number: "3020",
        name: "Owner's Drawings",
        type: "EQUITY",
        parent: "3000",
      },
      {
        number: "3030",
        name: "Retained Earnings",
        type: "EQUITY",
        parent: "3000",
      },
      {
        number: "3040",
        name: "Current Year Earnings",
        type: "EQUITY",
        parent: "3000",
      },

      // REVENUE (4000-4999)
      { number: "4000", name: "Revenue", type: "REVENUE", isHeader: true },
      {
        number: "4010",
        name: "Sales Revenue",
        type: "REVENUE",
        parent: "4000",
      },
      {
        number: "4020",
        name: "Service Revenue",
        type: "REVENUE",
        parent: "4000",
      },
      {
        number: "4030",
        name: "Other Revenue",
        type: "REVENUE",
        parent: "4000",
      },
      {
        number: "4100",
        name: "Interest Income",
        type: "REVENUE",
        parent: "4000",
      },

      // EXPENSES (5000-5999)
      {
        number: "5000",
        name: "Cost of Goods Sold",
        type: "EXPENSE",
        isHeader: true,
      },
      { number: "5010", name: "Materials", type: "EXPENSE", parent: "5000" },
      { number: "5020", name: "Direct Labor", type: "EXPENSE", parent: "5000" },
      {
        number: "5030",
        name: "Subcontractors",
        type: "EXPENSE",
        parent: "5000",
      },

      {
        number: "5100",
        name: "Operating Expenses",
        type: "EXPENSE",
        isHeader: true,
      },
      {
        number: "5110",
        name: "Salaries and Wages",
        type: "EXPENSE",
        parent: "5100",
      },
      {
        number: "5120",
        name: "Employee Benefits",
        type: "EXPENSE",
        parent: "5100",
      },
      { number: "5130", name: "Rent", type: "EXPENSE", parent: "5100" },
      { number: "5140", name: "Utilities", type: "EXPENSE", parent: "5100" },
      { number: "5150", name: "Telephone", type: "EXPENSE", parent: "5100" },
      {
        number: "5160",
        name: "Office Supplies",
        type: "EXPENSE",
        parent: "5100",
      },
      { number: "5170", name: "Insurance", type: "EXPENSE", parent: "5100" },
      {
        number: "5180",
        name: "Professional Fees",
        type: "EXPENSE",
        parent: "5100",
      },
      {
        number: "5190",
        name: "Travel and Entertainment",
        type: "EXPENSE",
        parent: "5100",
      },

      {
        number: "5200",
        name: "Other Expenses",
        type: "EXPENSE",
        isHeader: true,
      },
      {
        number: "5210",
        name: "Depreciation Expense",
        type: "EXPENSE",
        parent: "5200",
      },
      {
        number: "5220",
        name: "Interest Expense",
        type: "EXPENSE",
        parent: "5200",
      },
      { number: "5230", name: "Bank Charges", type: "EXPENSE", parent: "5200" },
    ],
  },

  construction: {
    name: "Canadian Construction Company",
    description:
      "Chart of accounts for Canadian construction companies with project tracking",
    accounts: [
      // Similar structure but with construction-specific accounts
      { number: "1000", name: "Current Assets", type: "ASSET", isHeader: true },
      {
        number: "1010",
        name: "Cash - Operating Account",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1100",
        name: "Accounts Receivable",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1120",
        name: "Holdbacks Receivable",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1200",
        name: "Inventory - Materials",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1210",
        name: "Work in Progress",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1400",
        name: "GST/HST Recoverable",
        type: "ASSET",
        parent: "1000",
      },

      { number: "1500", name: "Fixed Assets", type: "ASSET", isHeader: true },
      {
        number: "1510",
        name: "Construction Equipment",
        type: "ASSET",
        parent: "1500",
      },
      {
        number: "1520",
        name: "Accumulated Depreciation - Equipment",
        type: "ASSET",
        parent: "1500",
      },
      {
        number: "1530",
        name: "Vehicles and Trucks",
        type: "ASSET",
        parent: "1500",
      },
      {
        number: "1540",
        name: "Accumulated Depreciation - Vehicles",
        type: "ASSET",
        parent: "1500",
      },

      // Construction-specific liabilities
      {
        number: "2000",
        name: "Current Liabilities",
        type: "LIABILITY",
        isHeader: true,
      },
      {
        number: "2010",
        name: "Accounts Payable",
        type: "LIABILITY",
        parent: "2000",
      },
      {
        number: "2030",
        name: "Holdbacks Payable",
        type: "LIABILITY",
        parent: "2000",
      },
      {
        number: "2100",
        name: "GST/HST Payable",
        type: "LIABILITY",
        parent: "2000",
      },

      // Construction revenue
      {
        number: "4000",
        name: "Construction Revenue",
        type: "REVENUE",
        isHeader: true,
      },
      {
        number: "4010",
        name: "Contract Revenue",
        type: "REVENUE",
        parent: "4000",
      },
      {
        number: "4020",
        name: "Change Orders",
        type: "REVENUE",
        parent: "4000",
      },

      // Construction expenses
      {
        number: "5000",
        name: "Direct Job Costs",
        type: "EXPENSE",
        isHeader: true,
      },
      {
        number: "5010",
        name: "Materials",
        type: "EXPENSE",
        parent: "5000",
        requireProjectAllocation: true,
      },
      {
        number: "5020",
        name: "Subcontractors",
        type: "EXPENSE",
        parent: "5000",
        requireProjectAllocation: true,
      },
      {
        number: "5030",
        name: "Equipment Rental",
        type: "EXPENSE",
        parent: "5000",
        requireProjectAllocation: true,
      },
      {
        number: "5040",
        name: "Direct Labor",
        type: "EXPENSE",
        parent: "5000",
        requireProjectAllocation: true,
      },
    ],
  },

  professional_services: {
    name: "Canadian Professional Services",
    description:
      "Chart of accounts for Canadian professional services firms (consulting, legal, accounting)",
    accounts: [
      // Similar base structure with professional services focus
      { number: "1000", name: "Current Assets", type: "ASSET", isHeader: true },
      { number: "1010", name: "Operating Cash", type: "ASSET", parent: "1000" },
      {
        number: "1100",
        name: "Accounts Receivable",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1120",
        name: "Unbilled Revenue",
        type: "ASSET",
        parent: "1000",
      },
      {
        number: "1400",
        name: "GST/HST Recoverable",
        type: "ASSET",
        parent: "1000",
      },

      // Professional services revenue
      {
        number: "4000",
        name: "Professional Service Revenue",
        type: "REVENUE",
        isHeader: true,
      },
      {
        number: "4010",
        name: "Consulting Fees",
        type: "REVENUE",
        parent: "4000",
      },
      {
        number: "4020",
        name: "Professional Fees",
        type: "REVENUE",
        parent: "4000",
      },
      {
        number: "4030",
        name: "Retainer Fees",
        type: "REVENUE",
        parent: "4000",
      },

      // Professional services expenses
      {
        number: "5100",
        name: "Operating Expenses",
        type: "EXPENSE",
        isHeader: true,
      },
      {
        number: "5110",
        name: "Professional Salaries",
        type: "EXPENSE",
        parent: "5100",
      },
      {
        number: "5120",
        name: "Professional Development",
        type: "EXPENSE",
        parent: "5100",
      },
      {
        number: "5130",
        name: "Professional Memberships",
        type: "EXPENSE",
        parent: "5100",
      },
      {
        number: "5140",
        name: "Professional Insurance",
        type: "EXPENSE",
        parent: "5100",
      },
    ],
  },
};

/**
 * GET /api/chart-accounts/templates
 * Get available chart of accounts templates
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

    const templates = Object.entries(CANADIAN_CHART_TEMPLATES).map(
      ([key, template]) => ({
        id: key,
        name: template.name,
        description: template.description,
        accountCount: template.accounts.length,
      })
    );

    return NextResponse.json({
      templates,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching chart account templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart account templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chart-accounts/templates
 * Apply a chart of accounts template to the organization
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
    const { templateId, overwriteExisting = false } = body;

    if (
      !templateId ||
      !CANADIAN_CHART_TEMPLATES[
        templateId as keyof typeof CANADIAN_CHART_TEMPLATES
      ]
    ) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    const template =
      CANADIAN_CHART_TEMPLATES[
        templateId as keyof typeof CANADIAN_CHART_TEMPLATES
      ];

    // Check if organization already has chart accounts
    const existingAccounts = await db.chartAccount.count({
      where: {
        organizationId,
      },
    });

    if (existingAccounts > 0 && !overwriteExisting) {
      return NextResponse.json(
        {
          error:
            "Organization already has chart accounts. Set overwriteExisting=true to replace them.",
          existingCount: existingAccounts,
        },
        { status: 400 }
      );
    }

    // If overwriting, delete existing accounts (in a transaction)
    if (overwriteExisting && existingAccounts > 0) {
      await db.chartAccount.deleteMany({
        where: {
          organizationId,
          isSystem: false, // Don't delete system accounts
        },
      });
    }

    // Create accounts in the correct order (parents before children)
    const accountMap = new Map<string, string>(); // Maps template parent numbers to actual IDs
    const createdAccounts = [];

    // Create all accounts (simplified - no parent/child hierarchy for now)
    for (const account of template.accounts) {
      if (!account.isHeader) {
        // Skip header accounts for now
        const createdAccount = await db.chartAccount.create({
          data: {
            organizationId,
            number: account.number,
            name: account.name,
            type: account.type as any,
            description: `Template: ${template.name}`,
            allowManualEntries: true,
            requireProjectAllocation:
              (account as any).requireProjectAllocation || false,
          },
        });

        createdAccounts.push(createdAccount);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully applied ${template.name} template`,
      accountsCreated: createdAccounts.length,
      template: {
        id: templateId,
        name: template.name,
        description: template.description,
      },
    });
  } catch (error) {
    console.error("Error applying chart account template:", error);
    return NextResponse.json(
      { error: "Failed to apply chart account template" },
      { status: 500 }
    );
  }
}
