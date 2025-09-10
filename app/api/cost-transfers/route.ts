import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";
import { costTransferSchema, type CostTransferInput } from "@/lib/validations";

// GET /api/cost-transfers - Get cost transfers for organization
export async function GET(req: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const whereClause: any = {
      organizationId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (projectId) {
      whereClause.OR = [
        { sourceProjectId: projectId },
        { targetProjectId: projectId },
      ];
    }

    const transfers = await db.costTransfer.findMany({
      where: whereClause,
      include: {
        sourceProject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        targetProject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        sourceActivity: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        targetActivity: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await db.costTransfer.count({
      where: whereClause,
    });

    return NextResponse.json({
      transfers,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching cost transfers:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost transfers" },
      { status: 500 }
    );
  }
}

// POST /api/cost-transfers - Create new cost transfer
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const organizationId = await getCurrentOrgId();

    if (!organizationId || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CostTransferInput = costTransferSchema.parse(await req.json());

    // Verify source and target exist and belong to organization
    await validateTransferEntities(organizationId, body);

    // Check if source has sufficient funds for transfer
    await validateSufficientFunds(body);

    // Generate reference number if not provided
    const reference = body.reference || generateTransferReference();

    // Determine if approval is required based on amount
    const approvalRequired = body.approvalRequired || body.amount > 10000; // $10k threshold

    // Create the cost transfer
    const transfer = await db.costTransfer.create({
      data: {
        organizationId,
        sourceType: body.sourceType,
        sourceProjectId: body.sourceProjectId,
        sourceActivityId: body.sourceActivityId,
        sourceSubActivityId: body.sourceSubActivityId,
        targetType: body.targetType,
        targetProjectId: body.targetProjectId,
        targetActivityId: body.targetActivityId,
        targetSubActivityId: body.targetSubActivityId,
        amount: body.amount,
        costGroups: body.costGroups,
        description: body.description,
        reference,
        approvalRequired,
        status: approvalRequired ? "PENDING" : "APPROVED",
        createdBy: session.user.id,
      },
      include: {
        sourceProject: {
          select: { id: true, code: true, name: true },
        },
        targetProject: {
          select: { id: true, code: true, name: true },
        },
        sourceActivity: {
          select: { id: true, code: true, name: true },
        },
        targetActivity: {
          select: { id: true, code: true, name: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // If no approval required, immediately post the transfer
    if (!approvalRequired) {
      await postCostTransfer(transfer.id);
    }

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error("Error creating cost transfer:", error);
    return NextResponse.json(
      { error: "Failed to create cost transfer" },
      { status: 500 }
    );
  }
}

// Helper function to validate transfer entities
async function validateTransferEntities(
  organizationId: string,
  transfer: CostTransferInput
) {
  // Validate source
  if (transfer.sourceType === "PROJECT" && transfer.sourceProjectId) {
    const project = await db.project.findFirst({
      where: { id: transfer.sourceProjectId, organizationId },
    });
    if (!project) throw new Error("Source project not found");
  }

  if (transfer.sourceType === "ACTIVITY" && transfer.sourceActivityId) {
    const activity = await db.activity.findFirst({
      where: { id: transfer.sourceActivityId, organizationId },
    });
    if (!activity) throw new Error("Source activity not found");
  }

  // Validate target
  if (transfer.targetType === "PROJECT" && transfer.targetProjectId) {
    const project = await db.project.findFirst({
      where: { id: transfer.targetProjectId, organizationId },
    });
    if (!project) throw new Error("Target project not found");
  }

  if (transfer.targetType === "ACTIVITY" && transfer.targetActivityId) {
    const activity = await db.activity.findFirst({
      where: { id: transfer.targetActivityId, organizationId },
    });
    if (!activity) throw new Error("Target activity not found");
  }
}

// Helper function to validate sufficient funds
async function validateSufficientFunds(transfer: CostTransferInput) {
  // This is a simplified validation - in production, you'd check actual costs
  // For now, we'll just ensure the amounts are positive
  if (transfer.amount <= 0) {
    throw new Error("Transfer amount must be positive");
  }

  for (const group of transfer.costGroups) {
    if (group.amount <= 0) {
      throw new Error("All cost group amounts must be positive");
    }
  }
}

// Helper function to generate transfer reference
function generateTransferReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TRF-${timestamp}-${random}`.toUpperCase();
}

// Helper function to post cost transfer (create journal entries)
async function postCostTransfer(transferId: string) {
  const transfer = await db.costTransfer.findUnique({
    where: { id: transferId },
    include: {
      sourceProject: true,
      targetProject: true,
      sourceActivity: true,
      targetActivity: true,
    },
  });

  if (!transfer) throw new Error("Transfer not found");

  // Create journal entries for the transfer
  // This is a simplified implementation - in production, you'd create proper GL entries

  const journalReference = `TRANSFER-${transfer.reference}`;

  // Create a journal entry first
  const journal = await db.journal.create({
    data: {
      organizationId: transfer.organizationId,
      journalType: "GENERAL",
      reference: journalReference,
      description: `Cost Transfer: ${transfer.description}`,
      status: "POSTED",
      entryDate: new Date(),
      totalAmount: 0, // Will be calculated from lines
    },
  });

  // For each cost group, create debit and credit entries
  for (const group of transfer.costGroups as any[]) {
    // Credit source (reduce cost)
    await db.journalLine.create({
      data: {
        organizationId: transfer.organizationId,
        journalId: journal.id,
        accountId: "default-account-id", // This should be determined by project/activity GL mapping
        projectId: transfer.sourceProjectId,
        activityId: transfer.sourceActivityId,
        subActivityId: transfer.sourceSubActivityId,
        costGroup: group.group,
        description: `Transfer OUT: ${transfer.description}`,
        creditAmount: group.amount,
        reference: journalReference,
        transferType: transfer.sourceType,
        transferSourceId: getSourceId(transfer),
        transferTargetId: getTargetId(transfer),
        transferReference: transfer.reference,
        entryDate: new Date(),
      },
    });

    // Debit target (increase cost)
    await db.journalLine.create({
      data: {
        organizationId: transfer.organizationId,
        journalId: journal.id,
        accountId: "default-account-id", // This should be determined by project/activity GL mapping
        projectId: transfer.targetProjectId,
        activityId: transfer.targetActivityId,
        subActivityId: transfer.targetSubActivityId,
        costGroup: group.group,
        description: `Transfer IN: ${transfer.description}`,
        debitAmount: group.amount,
        reference: journalReference,
        transferType: transfer.targetType,
        transferSourceId: getSourceId(transfer),
        transferTargetId: getTargetId(transfer),
        transferReference: transfer.reference,
        entryDate: new Date(),
      },
    });
  }

  // Update transfer status
  await db.costTransfer.update({
    where: { id: transferId },
    data: {
      status: "POSTED",
      journalReference,
      postedAt: new Date(),
    },
  });
}

function getSourceId(transfer: any): string {
  return (
    transfer.sourceActivityId ||
    transfer.sourceSubActivityId ||
    transfer.sourceProjectId ||
    ""
  );
}

function getTargetId(transfer: any): string {
  return (
    transfer.targetActivityId ||
    transfer.targetSubActivityId ||
    transfer.targetProjectId ||
    ""
  );
}
