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
    const exercises = await db.exercice.findMany({
      where: { companyId: params.companyId },
    });
    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}
