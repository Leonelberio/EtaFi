import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth" // Assuming this is where your auth is set up



// GET all comparators for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth(); // Get the session with Auth.js v5

    // Ensure that a user session is available
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const ownerId = session.user.id;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "0", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const skip = page * limit;

    // Fetch comparators with pagination, filtered by ownerId
    const [comparators, totalComparators] = await Promise.all([
      db.comparator.findMany({
        where: { ownerId }, // Filter by the logged-in user's ID
        skip: skip,
        take: limit,
        orderBy: {
          createdAt: "desc", // Adjust the ordering as needed
        },
      }),
      db.comparator.count({
        where: { ownerId }, // Count only the comparators owned by the user
      }),
    ]);

    const hasMore = skip + comparators.length < totalComparators;

    return NextResponse.json({ comparators, hasMore });
  } catch (error) {
    console.error("Error fetching comparators:", error);
    return NextResponse.json({ error: "Failed to fetch comparators" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
      const { name, description, logo, color, toolType } = await req.json();
      const session = await auth(); // Get the session with Auth.js v5
  
      // Ensure that a user session is available
      if (!session?.user?.id) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
  
      const ownerId = session.user.id;
  
      // Create a new comparator
      const newComparator = await db.comparator.create({
        data: {
          name,
          description,
          logo,
          color,
          toolType,
          ownerId, // Set the ownerId to the current user's ID
        },
      });
  
      return NextResponse.json(newComparator);
    } catch (error) {
      console.error("Error creating comparator:", error);
      return NextResponse.json({ error: "Failed to create comparator" }, { status: 500 });
    }
  }



  // DELETE a comparator by ID
  export async function DELETE(req: NextRequest) {
    try {
      // Get the current user's session
      const session = await auth();
  
      // Ensure that a user session is available
      if (!session?.user?.id) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
  
      const userId = session.user.id;
      const url = new URL(req.url);
      const comparatorId = url.searchParams.get("comparatorId");
  
      // Ensure a comparator ID is provided
      if (!comparatorId) {
        return NextResponse.json({ error: "Comparator ID is required" }, { status: 400 });
      }
  
      // Ensure the comparator belongs to the current user
      const comparator = await db.comparator.findFirst({
        where: { id: Number(comparatorId), ownerId: userId },
      });
  
      // Check if the comparator exists and belongs to the user
      if (!comparator) {
        return NextResponse.json({ error: "Comparator not found or not authorized" }, { status: 404 });
      }
  
      // Delete the comparator
      await db.comparator.delete({
        where: { id: Number(comparatorId) },
      });
  
      // Return a success message
      return NextResponse.json({ message: "Comparator deleted successfully" });
    } catch (error) {
      console.error("Error deleting comparator:", error);
      return NextResponse.json({ error: "Failed to delete comparator" }, { status: 500 });
    }
  }
  