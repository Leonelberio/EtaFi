import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET a specific selected column
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const selectedColumn = await db.selectedColumn.findUnique({
      where: { id: params.id },
    });

    if (!selectedColumn) {
      return NextResponse.json({ error: "Selected column not found" }, { status: 404 });
    }

    return NextResponse.json(selectedColumn);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch selected column" }, { status: 500 });
  }
}

// PUT update a specific selected column
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const selectedColumn = await db.selectedColumn.update({
      where: { id: params.id },
      data: {
        ...body,
      },
    });
    return NextResponse.json(selectedColumn);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update selected column" }, { status: 500 });
  }
}

// DELETE a specific selected column
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.selectedColumn.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete selected column" }, { status: 500 });
  }
}
