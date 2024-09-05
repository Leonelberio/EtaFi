import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET a specific data source by ID
export async function GET(req: NextRequest, { params }: { params: { dataSourceId: string } }) {
  try {
    const { dataSourceId } = params;

    const dataSource = await db.dataSource.findUnique({
      where: { id: dataSourceId },
      include: {
        selectedColumns: true,
        selectedRows: true,
      },
    });

    if (!dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 });
    }

    return NextResponse.json(dataSource);
  } catch (error) {
    console.error("Error fetching data source:", error);
    return NextResponse.json({ error: "Failed to fetch data source" }, { status: 500 });
  }
}

// PUT (update) a specific data source by ID
export async function PUT(req: NextRequest, { params }: { params: { dataSourceId: string } }) {
  try {
    const { dataSourceId } = params;
    const body = await req.json();

    const updatedDataSource = await db.dataSource.update({
      where: { id: dataSourceId },
      data: body,
    });

    return NextResponse.json(updatedDataSource);
  } catch (error) {
    console.error("Error updating data source:", error);
    return NextResponse.json({ error: "Failed to update data source" }, { status: 500 });
  }
}

// DELETE a specific data source by ID
export async function DELETE(req: NextRequest, { params }: { params: { dataSourceId: string } }) {
  try {
    await db.dataSource.delete({
      where: { id: params.dataSourceId },
    });

    return NextResponse.json({ message: "Data source deleted successfully" });
  } catch (error) {
    console.error("Error deleting data source:", error);
    return NextResponse.json({ error: "Failed to delete data source" }, { status: 500 });
  }
}
