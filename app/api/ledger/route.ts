import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";

// GET /api/ledger - Get general ledger data
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("reportType") || "ledger"; // ledger, trial_balance, income_statement, balance_sheet

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    if (reportType === "ledger") {
      // Get specific account ledger
      if (!accountId) {
        return NextResponse.json(
          { error: "Account ID required for ledger view" },
          { status: 400 }
        );
      }

      const account = await db.chartAccount.findFirst({
        where: { id: accountId, organizationId },
      });

      if (!account) {
        return NextResponse.json(
          { error: "Account not found" },
          { status: 404 }
        );
      }

      // Get journal lines for this account
      const journalLines = await db.journalLine.findMany({
        where: {
          accountId,
          organizationId,
          ...(Object.keys(dateFilter).length > 0 && { entryDate: dateFilter }),
        },
        include: {
          journal: {
            select: {
              id: true,
              journalType: true,
              entryDate: true,
              reference: true,
              description: true,
              status: true,
            },
          },
          project: {
            select: { code: true, name: true },
          },
          activity: {
            select: { code: true, name: true },
          },
        },
        orderBy: { entryDate: "desc" },
      });

      // Calculate running balance
      let runningBalance = 0;
      const linesWithBalance = journalLines.map((line) => {
        const debitAmount = Number(line.debitAmount || 0);
        const creditAmount = Number(line.creditAmount || 0);

        // For asset and expense accounts, debits increase balance
        // For liability, equity, and revenue accounts, credits increase balance
        const isDebitAccount = ["ASSET", "EXPENSE"].includes(account.type);

        if (isDebitAccount) {
          runningBalance += debitAmount - creditAmount;
        } else {
          runningBalance += creditAmount - debitAmount;
        }

        return {
          ...line,
          runningBalance,
        };
      });

      return NextResponse.json({
        account,
        lines: linesWithBalance,
        totalDebits: journalLines.reduce(
          (sum, line) => sum + Number(line.debitAmount || 0),
          0
        ),
        totalCredits: journalLines.reduce(
          (sum, line) => sum + Number(line.creditAmount || 0),
          0
        ),
        endingBalance: runningBalance,
      });
    }

    if (reportType === "trial_balance") {
      // Get trial balance for all accounts
      const accounts = await db.chartAccount.findMany({
        where: { organizationId, isActive: true },
        orderBy: { number: "asc" },
      });

      const trialBalance = await Promise.all(
        accounts.map(async (account) => {
          const journalLines = await db.journalLine.findMany({
            where: {
              accountId: account.id,
              organizationId,
              ...(Object.keys(dateFilter).length > 0 && {
                entryDate: dateFilter,
              }),
              journal: { status: "POSTED" }, // Only posted entries
            },
          });

          const totalDebits = journalLines.reduce(
            (sum, line) => sum + Number(line.debitAmount || 0),
            0
          );
          const totalCredits = journalLines.reduce(
            (sum, line) => sum + Number(line.creditAmount || 0),
            0
          );

          // Calculate balance based on account type
          const isDebitAccount = ["ASSET", "EXPENSE"].includes(account.type);
          const balance = isDebitAccount
            ? totalDebits - totalCredits
            : totalCredits - totalDebits;

          return {
            account,
            totalDebits,
            totalCredits,
            balance,
          };
        })
      );

      // Filter out accounts with zero balance if requested
      const activeAccounts = trialBalance.filter((item) => item.balance !== 0);

      const totalDebits = activeAccounts.reduce(
        (sum, item) => sum + item.totalDebits,
        0
      );
      const totalCredits = activeAccounts.reduce(
        (sum, item) => sum + item.totalCredits,
        0
      );

      return NextResponse.json({
        accounts: activeAccounts,
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      });
    }

    if (reportType === "income_statement") {
      // Get income statement (revenue and expense accounts)
      const revenueAccounts = await db.chartAccount.findMany({
        where: {
          organizationId,
          isActive: true,
          type: "REVENUE",
        },
        orderBy: { number: "asc" },
      });

      const expenseAccounts = await db.chartAccount.findMany({
        where: {
          organizationId,
          isActive: true,
          type: "EXPENSE",
        },
        orderBy: { number: "asc" },
      });

      const getAccountBalance = async (accountId: string) => {
        const journalLines = await db.journalLine.findMany({
          where: {
            accountId,
            organizationId,
            ...(Object.keys(dateFilter).length > 0 && {
              entryDate: dateFilter,
            }),
            journal: { status: "POSTED" },
          },
        });

        const totalDebits = journalLines.reduce(
          (sum, line) => sum + Number(line.debitAmount || 0),
          0
        );
        const totalCredits = journalLines.reduce(
          (sum, line) => sum + Number(line.creditAmount || 0),
          0
        );

        // For revenue accounts, credits increase balance
        // For expense accounts, debits increase balance
        return totalCredits - totalDebits; // Revenue: credits - debits, Expense: debits - credits
      };

      const revenueBalances = await Promise.all(
        revenueAccounts.map(async (account) => ({
          account,
          balance: await getAccountBalance(account.id),
        }))
      );

      const expenseBalances = await Promise.all(
        expenseAccounts.map(async (account) => ({
          account,
          balance: await getAccountBalance(account.id),
        }))
      );

      const totalRevenue = revenueBalances.reduce(
        (sum, item) => sum + item.balance,
        0
      );
      const totalExpenses = expenseBalances.reduce(
        (sum, item) => sum + item.balance,
        0
      );
      const netIncome = totalRevenue - totalExpenses;

      return NextResponse.json({
        revenue: revenueBalances.filter((item) => item.balance !== 0),
        expenses: expenseBalances.filter((item) => item.balance !== 0),
        totalRevenue,
        totalExpenses,
        netIncome,
        period: {
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
      });
    }

    if (reportType === "balance_sheet") {
      // Get balance sheet (asset, liability, equity accounts)
      const assetAccounts = await db.chartAccount.findMany({
        where: {
          organizationId,
          isActive: true,
          type: "ASSET",
        },
        orderBy: { number: "asc" },
      });

      const liabilityAccounts = await db.chartAccount.findMany({
        where: {
          organizationId,
          isActive: true,
          type: "LIABILITY",
        },
        orderBy: { number: "asc" },
      });

      const equityAccounts = await db.chartAccount.findMany({
        where: {
          organizationId,
          isActive: true,
          type: "EQUITY",
        },
        orderBy: { number: "asc" },
      });

      const getAccountBalance = async (
        accountId: string,
        accountType: string
      ) => {
        const journalLines = await db.journalLine.findMany({
          where: {
            accountId,
            organizationId,
            ...(Object.keys(dateFilter).length > 0 && {
              entryDate: dateFilter,
            }),
            journal: { status: "POSTED" },
          },
        });

        const totalDebits = journalLines.reduce(
          (sum, line) => sum + Number(line.debitAmount || 0),
          0
        );
        const totalCredits = journalLines.reduce(
          (sum, line) => sum + Number(line.creditAmount || 0),
          0
        );

        // For asset accounts, debits increase balance
        // For liability and equity accounts, credits increase balance
        const isDebitAccount = accountType === "ASSET";
        return isDebitAccount
          ? totalDebits - totalCredits
          : totalCredits - totalDebits;
      };

      const assetBalances = await Promise.all(
        assetAccounts.map(async (account) => ({
          account,
          balance: await getAccountBalance(account.id, account.type),
        }))
      );

      const liabilityBalances = await Promise.all(
        liabilityAccounts.map(async (account) => ({
          account,
          balance: await getAccountBalance(account.id, account.type),
        }))
      );

      const equityBalances = await Promise.all(
        equityAccounts.map(async (account) => ({
          account,
          balance: await getAccountBalance(account.id, account.type),
        }))
      );

      const totalAssets = assetBalances.reduce(
        (sum, item) => sum + item.balance,
        0
      );
      const totalLiabilities = liabilityBalances.reduce(
        (sum, item) => sum + item.balance,
        0
      );
      const totalEquity = equityBalances.reduce(
        (sum, item) => sum + item.balance,
        0
      );

      return NextResponse.json({
        assets: assetBalances.filter((item) => item.balance !== 0),
        liabilities: liabilityBalances.filter((item) => item.balance !== 0),
        equity: equityBalances.filter((item) => item.balance !== 0),
        totalAssets,
        totalLiabilities,
        totalEquity,
        isBalanced:
          Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
        period: {
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
      });
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching ledger data:", error);
    return NextResponse.json(
      { error: "Failed to fetch ledger data" },
      { status: 500 }
    );
  }
}
