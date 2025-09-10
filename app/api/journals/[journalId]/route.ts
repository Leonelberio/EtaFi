import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import { auth } from "@/auth";

// GET /api/journals/[journalId] - Get a specific journal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> }
) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { journalId } = await params;

    const journal = await db.journal.findFirst({
      where: {
        id: journalId,
        organizationId,
      },
      include: {
        lines: {
          include: {
            account: {
              select: { id: true, number: true, name: true, type: true },
            },
            project: {
              select: { id: true, code: true, name: true },
            },
            activity: {
              select: { id: true, code: true, name: true },
            },
            subActivity: {
              select: { id: true, code: true, name: true },
            },
            taxCode: {
              select: { id: true, code: true, name: true, rate: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        postedByUser: {
          select: { name: true, email: true },
        },
        reversedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    if (!journal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    return NextResponse.json(journal);
  } catch (error) {
    console.error("Error fetching journal:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal" },
      { status: 500 }
    );
  }
}

// PUT /api/journals/[journalId] - Update a journal (only if status is DRAFT)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> }
) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { journalId } = await params;

    // Check if journal exists and is in DRAFT status
    const existingJournal = await db.journal.findFirst({
      where: {
        id: journalId,
        organizationId,
      },
    });

    if (!existingJournal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    if (existingJournal.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft journals can be updated" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update journal
    const updatedJournal = await db.journal.update({
      where: { id: journalId },
      data: {
        journalType: body.journalType,
        entryDate: new Date(body.entryDate),
        reference: body.reference,
        description: body.description,
        totalAmount: body.totalAmount,
      },
      include: {
        lines: {
          include: {
            account: {
              select: { number: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedJournal);
  } catch (error) {
    console.error("Error updating journal:", error);
    return NextResponse.json(
      { error: "Failed to update journal" },
      { status: 500 }
    );
  }
}

// DELETE /api/journals/[journalId] - Delete a journal (only if status is DRAFT)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ journalId: string }> }
) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { journalId } = await params;

    // Check if journal exists and is in DRAFT status
    const existingJournal = await db.journal.findFirst({
      where: {
        id: journalId,
        organizationId,
      },
    });

    if (!existingJournal) {
      return NextResponse.json({ error: "Journal not found" }, { status: 404 });
    }

    if (existingJournal.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only draft journals can be deleted" },
        { status: 400 }
      );
    }

    // Delete journal (lines will be deleted automatically due to cascade)
    await db.journal.delete({
      where: { id: journalId },
    });

    return NextResponse.json({ message: "Journal deleted successfully" });
  } catch (error) {
    console.error("Error deleting journal:", error);
    return NextResponse.json(
      { error: "Failed to delete journal" },
      { status: 500 }
    );
  }
}
