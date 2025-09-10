import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";

// POST /api/journals/[journalId]/post - Post (finalize) a journal entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> }
) {
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

    const { journalId } = await params;

    // Validate that journal exists and is in DRAFT status
    const existingJournal = await db.journal.findFirst({
      where: {
        id: journalId,
        organizationId,
      },
      include: {
        lines: true,
      },
    });

    if (!existingJournal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    if (existingJournal.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft journals can be posted" },
        { status: 400 }
      );
    }

    // Validate that debits equal credits
    const totalDebits = existingJournal.lines.reduce(
      (sum, line) => sum + Number(line.debitAmount || 0),
      0
    );
    const totalCredits = existingJournal.lines.reduce(
      (sum, line) => sum + Number(line.creditAmount || 0),
      0
    );

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json(
        { error: "Total debits must equal total credits" },
        { status: 400 }
      );
    }

    // Post the journal
    const postedJournal = await db.journal.update({
      where: { id: journalId },
      data: {
        status: "POSTED",
        postedAt: new Date(),
        postedBy: session.user.id,
        totalAmount: totalDebits, // Use the calculated total
      },
      include: {
        lines: {
          include: {
            account: {
              select: { number: true, name: true },
            },
          },
        },
        postedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(postedJournal);
  } catch (error) {
    console.error("Error posting journal:", error);
    return NextResponse.json(
      { error: "Failed to post journal" },
      { status: 500 }
    );
  }
}

// DELETE /api/journals/[journalId]/post - Reverse a posted journal entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> }
) {
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

    const { journalId } = await params;

    // Validate that journal exists and is POSTED
    const existingJournal = await db.journal.findFirst({
      where: {
        id: journalId,
        organizationId,
      },
      include: {
        lines: true,
      },
    });

    if (!existingJournal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    if (existingJournal.status !== "POSTED") {
      return NextResponse.json(
        { error: "Only posted journals can be reversed" },
        { status: 400 }
      );
    }

    // Create a reversing journal entry
    const reversingJournal = await db.$transaction(async (tx) => {
      // Create the reversing journal header
      const newJournal = await tx.journal.create({
        data: {
          organizationId,
          journalType: existingJournal.journalType,
          entryDate: new Date(),
          reference: `REV-${existingJournal.reference || existingJournal.id}`,
          description: `REVERSAL: ${existingJournal.description}`,
          totalAmount: existingJournal.totalAmount,
          status: "POSTED",
          postedAt: new Date(),
          postedBy: session.user.id,
        },
      });

      // Create reversing journal lines (swap debits and credits)
      const reversingLines = await Promise.all(
        existingJournal.lines.map((line) =>
          tx.journalLine.create({
            data: {
              journalId: newJournal.id,
              organizationId,
              accountId: line.accountId,
              description: `REVERSAL: ${line.description}`,
              // Swap debits and credits
              debitAmount: line.creditAmount,
              creditAmount: line.debitAmount,
              projectId: line.projectId,
              activityId: line.activityId,
              subActivityId: line.subActivityId,
              costGroup: line.costGroup,
              taxCodeId: line.taxCodeId,
              reference: line.reference,
              entryDate: new Date(),
            },
          })
        )
      );

      // Mark the original journal as reversed
      await tx.journal.update({
        where: { id: journalId },
        data: {
          status: "REVERSED",
          reversedAt: new Date(),
          reversedBy: session.user.id,
        },
      });

      return { ...newJournal, lines: reversingLines };
    });

    return NextResponse.json(reversingJournal);
  } catch (error) {
    console.error("Error reversing journal:", error);
    return NextResponse.json(
      { error: "Failed to reverse journal" },
      { status: 500 }
    );
  }
}
