import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET all selected columns
export async function GET() {
  try {
    const selectedColumns = await db.selectedColumn.findMany();
    return NextResponse.json(selectedColumns);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch selected columns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
      const { dataSourceId, tabName, columnName } = await req.json();
  
      const newSelectedColumn = await db.selectedColumn.create({
        data: {
          dataSourceId,
          tabName,
          columnName,
        },
      });
  
      return NextResponse.json(newSelectedColumn);
    } catch (error) {
      console.error("Error creating selected column:", error);
      return NextResponse.json({ error: "Failed to create selected column" }, { status: 500 });
    }
  }