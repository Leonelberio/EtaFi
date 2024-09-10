import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
  
    const { name, address, nif, contact, logo } = await req.json();
  
    // Debug: Check if `db` is defined and accessible
    if (!db || !db.company) {
      console.error("Prisma client `db` or `db.company` is not defined.");
      return NextResponse.json({ error: "Database not initialized correctly." }, { status: 500 });
    }
  
    try {
      const newCompany = await db.company.create({
        data: {
          name,
          address,
          nif,
          contact,
          logo, // Store the logo URL
          userId: session.user.id, // Associate the company with the authenticated user
        },
      });
      return NextResponse.json(newCompany);
    } catch (error) {
      console.error("Error creating company:", error);
      return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
    }
  }
// GET all companies for the current user with related exercises and pagination
export async function GET(req: NextRequest) {
    try {
      const session = await auth(); // Get the session (ensure the user is authenticated)
  
      // Ensure that a user session is available
      if (!session?.user?.id) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
  
      const ownerId = session.user.id;
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get("page") || "0", 10);
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  
      const skip = page * limit;
  
      // Fetch companies with related exercices (financial exercises), filtered by userId
      const [companies, totalCompanies] = await Promise.all([
        db.company.findMany({
          where: { userId: ownerId }, // Filter by the logged-in user's ID
          skip: skip,
          take: limit,
          orderBy: {
            createdAt: "desc", // Order by the creation date (newest first)
          },
          include: {
            exercices: { // Include related exercises for each company
              orderBy: {
                startDate: "desc", // Order exercises by their start date
              },
            },
          },
        }),
        db.company.count({
          where: { userId: ownerId }, // Count only the companies owned by the user
        }),
      ]);
  
      const hasMore = skip + companies.length < totalCompanies;
  
      return NextResponse.json({ companies, hasMore });
    } catch (error) {
      console.error("Error fetching companies and exercises:", error);
      return NextResponse.json({ error: "Failed to fetch companies and exercises" }, { status: 500 });
    }
  }