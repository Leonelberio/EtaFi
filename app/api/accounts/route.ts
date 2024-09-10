//@ts-nocheck

import { auth } from "@/auth"; // Import your authentication logic
import { db } from "@/lib/db"; // Prisma client instance
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth(); // Authenticate the user
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Fetch all accounts related to this user
    const accounts = await db.financialAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { accountCode: 'asc' }, // Example: order by accountCode
    });

    if (!accounts.length) {
      return NextResponse.json({ error: "No accounts found" }, { status: 404 });
    }

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}
