import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// DELETE - Delete a specific exercise
export async function DELETE(req: NextRequest, { params }: { params: { companyId: string, exerciceId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    await db.exercice.delete({
      where: {
        id: params.exerciceId,
        companyId: params.companyId,
      },
    });
    return NextResponse.json({ message: "Exercice deleted" });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
  }
}

// GET - Get the details of a specific exercice by its ID, including financial accounts and transactions
export async function GET(req: NextRequest, { params }: { params: { companyId: string, exerciceId: string } }) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
  
    try {
      const exercice = await db.exercice.findUnique({
        where: {
          id: params.exerciceId,
        },
        include: {
          financialAccounts: true,  // Include financial accounts associated with this exercise
          transactions: true,       // Include transactions associated with this exercise
        },
      });
  
      if (!exercice) {
        return NextResponse.json({ error: "Exercice not found" }, { status: 404 });
      }
  
      // Ensure the exercise belongs to the correct company
      if (exercice.companyId !== params.companyId) {
        return NextResponse.json({ error: "Unauthorized access to this exercice" }, { status: 403 });
      }
  
      return NextResponse.json(exercice);
    } catch (error) {
      console.error("Error fetching exercice details:", error);
      return NextResponse.json({ error: "Failed to fetch exercice details" }, { status: 500 });
    }
  }