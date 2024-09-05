import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { comparatorId: string } }) {
    try {
      const comparatorId = parseInt(params.comparatorId, 10);
  
      if (isNaN(comparatorId)) {
        return NextResponse.json({ error: "Invalid comparator ID" }, { status: 400 });
      }
  
      const comparator = await db.comparator.findUnique({
        where: { id: comparatorId },
        include: { dataSource: true },
      });
  
      if (!comparator) {
        return NextResponse.json({ error: "Comparator not found" }, { status: 404 });
      }
  
      return NextResponse.json(comparator);
    } catch (error) {
      console.error("Error fetching comparator:", error);
      return NextResponse.json({ error: "Failed to fetch comparator" }, { status: 500 });
    }
  }


  export async function PUT(req: NextRequest, { params }: { params: { comparatorId: string } }) {
    try {
      const { comparatorId } = params;
      const body = await req.json();
  
      if (!comparatorId) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
      }
  
      const parsedId = parseInt(comparatorId, 10);
  
      if (isNaN(parsedId)) {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
      }
  
      // Check if the comparator exists before updating
      const existingComparator = await db.comparator.findUnique({
        where: { id: parsedId },
      });
  
      if (!existingComparator) {
        return NextResponse.json({ error: "Comparator not found" }, { status: 404 });
      }
  
      const updatedComparator = await db.comparator.update({
        where: { id: parsedId },
        data: {
          ...body,
        },
      });
  
      return NextResponse.json(updatedComparator);
    } catch (error) {
      console.error("Error updating comparator:", error);
      return NextResponse.json({ error: "Failed to update comparator" }, { status: 500 });
    }
  }

  