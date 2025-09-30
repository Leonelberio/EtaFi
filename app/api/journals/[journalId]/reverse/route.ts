import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";
import { journalReversalSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ journalId: string }>;
}

// POST - Reverse a posted journal entry
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { journalId } = await params;
    const body = await req.json();

    // Validate the reversal data
    const validatedData = journalReversalSchema.parse(body);

    // Get the original journal entry
    const originalJournal = await db.journal.findFirst({
      where: {
        id: journalId,
        organizationId,
        status: "POSTED", // Only posted journals can be reversed
      },
      include: {
        lines: {
          include: {
            account: true,
            project: true,
            activity: true,
            subActivity: true,
          },
        },
      },
    });

    if (!originalJournal) {
      return NextResponse.json(
        { error: "Journal not found or not posted" },
        { status: 404 }
      );
    }

    // Create the reversal journal entry
    const reversalJournal = await db.$transaction(async (tx) => {
      // Create the reversal journal
      const reversal = await tx.journal.create({
        data: {
          organizationId,
          journalType: originalJournal.journalType,
          entryDate: new Date(validatedData.reversalDate),
          reference: `REV-${originalJournal.reference || originalJournal.id.slice(0, 8)}`,
          description: `Reversal of ${originalJournal.reference || originalJournal.id.slice(0, 8)} - ${validatedData.reversalReason}`,
          totalAmount: originalJournal.totalAmount,
          status: "POSTED", // Reversal entries are automatically posted
          postedAt: new Date(),
          postedBy: session.user.id,
          reversalReason: validatedData.reversalReason,
          reversalDate: new Date(validatedData.reversalDate),
        },
      });

      // Create reversal lines with opposite amounts
      const reversalLines = originalJournal.lines.map((line) => ({
        journalId: reversal.id,
        organizationId,
        accountId: line.accountId,
        projectId: line.projectId,
        activityId: line.activityId,
        subActivityId: line.subActivityId,
        costGroup: line.costGroup,
        costGroups: line.costGroups as any, // Type assertion for JsonValue
        description: `Reversal: ${line.description}`,
        debitAmount: line.creditAmount, // Swap debit and credit
        creditAmount: line.debitAmount,
        taxCodeId: line.taxCodeId,
        reference: line.reference,
        transferType: line.transferType,
        transferSourceId: line.transferSourceId,
        transferTargetId: line.transferTargetId,
        transferReference: line.transferReference,
        costType: line.costType,
        costCategory: line.costCategory,
        entryDate: new Date(validatedData.reversalDate),
      }));

      await tx.journalLine.createMany({
        data: reversalLines,
      });

      // Mark the original journal as reversed
      await tx.journal.update({
        where: { id: journalId },
        data: {
          status: "REVERSED",
          reversedAt: new Date(),
          reversedBy: session.user.id,
          reversalReason: validatedData.reversalReason,
          reversalDate: new Date(validatedData.reversalDate),
        },
      });

      return reversal;
    });

    return NextResponse.json({
      success: true,
      reversalJournal: {
        id: reversalJournal.id,
        reference: reversalJournal.reference,
        description: reversalJournal.description,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }

    console.error("Error reversing journal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
