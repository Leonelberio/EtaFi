import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// export async function POST(req: NextRequest, { params }: { params: { comparatorId: string } }) {
//   try {
//     const { comparatorId } = params;
//     const { authKey, type, sheetId, notionPageId, selectedColumns, selectedRows } = await req.json();
//     const session = await auth(); // Get the session with Auth.js v5

//     // Extracting the user ID from the session
//     const ownerId = session.user.id;

//     // Creating the new DataSource entry in the database
//     const newDataSource = await db.dataSource.create({
//       data: {
//         comparatorId: parseInt(comparatorId, 10),
//         userId: ownerId,
//         authKey,
//         type,
//         sheetId,
//         notionPageId,
//         selectedColumns: {
//           create: selectedColumns.map((column: { columnName: string; tabName?: string }) => ({
//             columnName: column.columnName,
//             tabName: column.tabName,
//           })),
//         },
//         selectedRows: {
//           create: selectedRows.map((row: { rowName: string; tabName?: string }) => ({
//             rowName: row.rowName,
//             tabName: row.tabName,
//           })),
//         },
//       },
//       include: {
//         selectedColumns: true,
//         selectedRows: true,
//       },
//     });

//     // Returning the newly created DataSource object as a JSON response
//     return NextResponse.json(newDataSource, { status: 201 });
//   } catch (error) {
//     console.error("Error creating data source:", error);
//     return NextResponse.json({ error: "Failed to create data source" }, { status: 500 });
//   }
// }




export async function POST(req: NextRequest, { params }: { params: { comparatorId: string } }) {
  try {
    const { comparatorId } = params;  // Assuming you're extracting this from URL params
    const { userId, authKey, type, sheetId, tabName, selectedColumns, selectedRows } = await req.json();
    const session = await auth();  // Get the session

    // Extract the user ID from the session
    const ownerId = session?.user?.id;

    // Check if a DataSource already exists for this comparatorId
    const existingDataSource = await db.dataSource.findUnique({
      where: { comparatorId: parseInt(comparatorId, 10) },
    });

    if (existingDataSource) {
      // If a DataSource exists, update it
      const updatedDataSource = await db.dataSource.update({
        where: { comparatorId: parseInt(comparatorId, 10) },
        data: {
          userId,
          authKey,
          type,
          sheetId,
          tabName,
          selectedColumns: {
            deleteMany: {}, // Clear existing columns
            create: selectedColumns.map((column: { columnName: string; tabName?: string }) => ({
              columnName: column.columnName,
              tabName: column.tabName,
            })),
          },
          selectedRows: {
            deleteMany: {}, // Clear existing rows
            create: selectedRows.map((row: { rowName: string; tabName?: string }) => ({
              rowName: row.rowName,
              tabName: row.tabName,
            })),
          },
        },
        include: {
          selectedColumns: true,
          selectedRows: true,
        },
      });

      return NextResponse.json(updatedDataSource, { status: 200 });
    } else {
      // If no DataSource exists, create a new one
      const newDataSource = await db.dataSource.create({
        data: {
          comparatorId: parseInt(comparatorId, 10),
          userId,
          authKey,
          type,
          sheetId,
          tabName,
          selectedColumns: {
            create: selectedColumns.map((column: { columnName: string; tabName?: string }) => ({
              columnName: column.columnName,
              tabName: column.tabName,
            })),
          },
          selectedRows: {
            create: selectedRows.map((row: { rowName: string; tabName?: string }) => ({
              rowName: row.rowName,
              tabName: row.tabName,
            })),
          },
        },
        include: {
          selectedColumns: true,
          selectedRows: true,
        },
      });

      return NextResponse.json(newDataSource, { status: 201 });
    }
  } catch (error) {
    console.error("Error saving or updating data source:", error);
    return NextResponse.json({ error: "Failed to save or update data source" }, { status: 500 });
  }
}


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
