import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";


// GET all comparators without any user restriction
export async function GET(req: NextRequest) {
    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get("page") || "0", 10);
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  
      const skip = page * limit;
  
      // Fetch all comparators with pagination
      const [comparators, totalComparators] = await Promise.all([
        db.comparator.findMany({
          skip: skip,
          take: limit,
          orderBy: {
            createdAt: "desc", // Adjust the ordering as needed
          },
        }),
        db.comparator.count(),
      ]);
  
      const hasMore = skip + comparators.length < totalComparators;
  
      return NextResponse.json({ comparators, hasMore });
    } catch (error) {
      console.error("Error fetching all comparators:", error);
      return NextResponse.json({ error: "Failed to fetch comparators" }, { status: 500 });
    }
  }