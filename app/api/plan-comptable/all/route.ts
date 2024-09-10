import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Your Prisma DB instance

export async function GET() {
  try {
    const planComptable = await db.accountPlan.findMany({
      orderBy: { numero_compte: "asc" }, // Sort by account number
    });
    return NextResponse.json(planComptable);
  } catch (error) {
    console.error("Error fetching Plan Comptable:", error);
    return NextResponse.json({ error: "Failed to fetch Plan Comptable" }, { status: 500 });
  }
}
