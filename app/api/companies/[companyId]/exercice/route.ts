import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// POST - Create a new exercise for a company
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  try {
    const { name, startDate, endDate } = await req.json();

    const newExercice = await db.exercice.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        companyId,
      },
    });

    return NextResponse.json(newExercice, { status: 201 });
  } catch (error) {
    console.error("Error creating exercice:", error);
    return NextResponse.json(
      { error: "Failed to create exercice" },
      { status: 500 }
    );
  }
}

// GET - Get all exercises for a company
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  try {
    const session = await auth(); // Check if the user is authenticated

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Check if the user has access to the company either through the organization or as the company creator
    const company = await db.company.findFirst({
      where: {
        id: companyId,
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
      return NextResponse.json(
        { error: "Not authorized to access this company's exercises" },
        { status: 403 }
      );
    }

    // Fetch all exercises related to the company
    const exercices = await db.exercice.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(exercices);
  } catch (error) {
    console.error("Error fetching exercices:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercices" },
      { status: 500 }
    );
  }
}
