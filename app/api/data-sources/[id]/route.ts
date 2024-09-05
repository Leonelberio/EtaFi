import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET a data source by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const dataSourceId = params.id;

        if (!dataSourceId) {
            return NextResponse.json({ error: "Data source ID is required" }, { status: 400 });
        }

        const dataSource = await db.dataSource.findUnique({
            where: { id: dataSourceId },
            include: {
                selectedColumns: true,
                selectedRows: true
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

// PUT (Update) a data source by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const dataSourceId = params.id;
        const body = await req.json();

        if (!dataSourceId) {
            return NextResponse.json({ error: "Data source ID is required" }, { status: 400 });
        }

        const existingDataSource = await db.dataSource.findUnique({
            where: { id: dataSourceId },
        });

        if (!existingDataSource) {
            return NextResponse.json({ error: "Data source not found" }, { status: 404 });
        }

        const updatedDataSource = await db.dataSource.update({
            where: { id: dataSourceId },
            data: {
                ...body,
            },
        });

        return NextResponse.json(updatedDataSource);
    } catch (error) {
        console.error("Error updating data source:", error);
        return NextResponse.json({ error: "Failed to update data source" }, { status: 500 });
    }
}

// DELETE a data source by ID
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const userId = session.user.id;
        const url = new URL(req.url);
        const dataSourceId = url.searchParams.get("id");

        if (!dataSourceId) {
            return NextResponse.json({ error: "Data source ID is required" }, { status: 400 });
        }

        const dataSource = await db.dataSource.findFirst({
            where: { id: dataSourceId, userId: userId },
        });

        if (!dataSource) {
            return NextResponse.json({ error: "Data source not found or not authorized" }, { status: 404 });
        }

        await db.dataSource.delete({
            where: { id: dataSourceId },
        });

        return NextResponse.json({ message: "Data source deleted successfully" });
    } catch (error) {
        console.error("Error deleting data source:", error);
        return NextResponse.json({ error: "Failed to delete data source" }, { status: 500 });
    }
}
