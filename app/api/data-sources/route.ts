import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { comparatorId, authKey, type, sheetId, tabName, selectedColumns, selectedRows } = await req.json();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const newDataSource = await db.dataSource.create({
      data: {
        comparatorId,
        userId: session.user.id,
        authKey,
        type,
        sheetId,
        selectedColumns: {
          create: selectedColumns.map((column: string) => ({
            columnName: column,
            tabName,
          })),
        },
        selectedRows: {
          create: selectedRows.map((row: string) => ({
            rowName: row,
            tabName,
          })),
        },
      },
      include: {
        selectedColumns: true,
        selectedRows: true,
      },
    });

    return NextResponse.json(newDataSource);
  } catch (error) {
    console.error("Error creating data source:", error);
    return NextResponse.json({ error: "Failed to create data source" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comparatorId = parseInt(params.id, 10);

    if (isNaN(comparatorId)) {
      return NextResponse.json({ error: "Invalid comparator ID" }, { status: 400 });
    }

    const dataSources = await db.dataSource.findMany({
      where: { comparatorId },
      include: { selectedColumns: true, selectedRows: true },
    });

    if (!dataSources.length) {
      return NextResponse.json({ error: "No data sources found" }, { status: 404 });
    }

    return NextResponse.json(dataSources);
  } catch (error) {
    console.error("Error fetching data sources:", error);
    return NextResponse.json({ error: "Failed to fetch data sources" }, { status: 500 });
  }
}
