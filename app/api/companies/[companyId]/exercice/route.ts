import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// POST - Create a new exercise for a company
export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const { name, startDate, endDate } = await req.json();

  try {
    const exercise = await db.exercice.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        companyId: params.companyId,
      },
    });
    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json({ error: "Failed to create exercise" }, { status: 500 });
  }
}

// GET - Get all exercises for a company
export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const session = await auth(); // Check if the user is authenticated

    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Check if the user has access to the company either through the organization or as the company creator
    const company = await db.company.findFirst({
      where: {
        id: params.companyId,
        OR: [
          {
            userId: session.user.id, // If the user directly owns the company
          },
          {
            organization: {
              members: {
                some: {
                  userId: session.user.id, // If the user is part of the organization that owns the company
                },
              },
            },
          },
        ],
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Not authorized to access this company's exercises" }, { status: 403 });
    }

    // Fetch all exercises related to the company
    const exercises = await db.exercice.findMany({
      where: { companyId: params.companyId },
      orderBy: { startDate: "asc" }, // Optional: Order by the start date
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}