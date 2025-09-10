import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { journalSchema } from "@/lib/validations";
import { auth } from "@/auth";
import { z } from "zod";

// GET /api/journals - Get all journals for the organization
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const journalType = searchParams.get("journalType");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    // Build where clause
    const whereClause: any = {
      organizationId,
    };

    if (journalType) {
      whereClause.journalType = journalType;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [journals, totalCount] = await Promise.all([
      db.journal.findMany({
        where: whereClause,
        include: {
          lines: {
            include: {
              account: {
                select: { number: true, name: true },
              },
              project: {
                select: { code: true, name: true },
              },
              activity: {
                select: { code: true, name: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          postedByUser: {
            select: { name: true, email: true },
          },
        },
        orderBy: { entryDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.journal.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      journals,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching journals:", error);
    return NextResponse.json(
      { error: "Failed to fetch journals" },
      { status: 500 }
    );
  }
}

// POST /api/journals - Create a new journal entry
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = journalSchema.parse(body);

    // Calculate total amount
    const totalAmount = validatedData.lines.reduce(
      (sum, line) => sum + (line.debitAmount || 0),
      0
    );

    // Create journal with lines in a transaction
    const journal = await db.$transaction(async (tx) => {
      // Create the journal header
      const newJournal = await tx.journal.create({
        data: {
          organizationId,
          journalType: validatedData.journalType,
          entryDate: new Date(validatedData.entryDate),
          reference: validatedData.reference,
          description: validatedData.description,
          totalAmount,
          status: "DRAFT",
        },
      });

      // Create the journal lines
      const journalLines = await Promise.all(
        validatedData.lines.map((line) =>
          tx.journalLine.create({
            data: {
              journalId: newJournal.id,
              organizationId,
              accountId: line.accountId,
              description: line.description,
              debitAmount: line.debitAmount || null,
              creditAmount: line.creditAmount || null,
              projectId: line.projectId || null,
              activityId: line.activityId || null,
              subActivityId: line.subActivityId || null,
              costGroup: line.costGroup || null,
              taxCodeId: line.taxCodeId || null,
              reference: line.reference || null,
              entryDate: new Date(validatedData.entryDate),
            },
          })
        )
      );

      return { ...newJournal, lines: journalLines };
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating journal:", error);
    return NextResponse.json(
      { error: "Failed to create journal" },
      { status: 500 }
    );
  }
}
