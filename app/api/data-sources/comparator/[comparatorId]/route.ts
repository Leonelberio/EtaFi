import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET all data sources related to a specific comparatorId
export async function GET(req: NextRequest, { params }: { params: { comparatorId: string } }) {
    try {
        // Parse comparatorId from params
        const comparatorId = parseInt(params.comparatorId, 10);

        // Validate comparatorId
        if (isNaN(comparatorId) || comparatorId <= 0) {
            return NextResponse.json({ error: "Invalid comparator ID" }, { status: 400 });
        }

        // Fetch data sources associated with the comparatorId
        const dataSources = await db.dataSource.findMany({
            where: { comparatorId },
            include: {
                selectedColumns: true,
                selectedRows: true,
            },
        });

        // Check if any data sources are found
        if (dataSources.length === 0) {
            return NextResponse.json({ message: "No data sources found for this comparator" }, { status: 404 });
        }

        // Return the data sources as JSON
        return NextResponse.json(dataSources);
    } catch (error) {
        console.error("Error fetching data sources:", error);
        return NextResponse.json({ error: "Failed to fetch data sources" }, { status: 500 });
    }
}
