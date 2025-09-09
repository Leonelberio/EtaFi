import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrgId } from "@/lib/auth";

// GET - Récupérer les écritures du grand livre
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const projectId = searchParams.get("projectId");
    const activityId = searchParams.get("activityId");
    const groupCode = searchParams.get("groupCode");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const journal = searchParams.get("journal");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const where: any = {
      organizationId,
      entry: {
        organizationId,
      },
    };

    if (accountId) where.accountId = accountId;
    if (projectId) where.projectId = projectId;
    if (activityId) where.activityId = activityId;
    if (groupCode) where.groupCode = groupCode;
    if (journal) where.entry = { ...where.entry, journal };
    if (dateFrom || dateTo) {
      where.entry = {
        ...where.entry,
        date: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      };
    }

    const [journalLines, total] = await Promise.all([
      prisma.journalLine.findMany({
        where,
        include: {
          account: { select: { number: true, name: true } },
          project: { select: { name: true } },
          activity: { select: { code: true, name: true } },
        },
        orderBy: { entryDate: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.journalLine.count({ where }),
    ]);

    // Calculer les soldes
    const balances = await prisma.journalLine.groupBy({
      by: ["accountId"],
      where: { organizationId },
      _sum: {
        debitAmount: true,
        creditAmount: true,
      },
    });

    const accountBalances = balances.map((b) => ({
      accountId: b.accountId,
      balance:
        Number(b._sum.debitAmount || 0) - Number(b._sum.creditAmount || 0),
    }));

    return NextResponse.json({
      journalLines,
      accountBalances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching ledger:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
