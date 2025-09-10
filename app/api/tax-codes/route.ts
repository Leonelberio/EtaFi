import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";

// GET /api/tax-codes - Get all tax codes for the organization
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taxCodes = await db.taxCode.findMany({
      where: { organizationId, isActive: true },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ taxCodes });
  } catch (error) {
    console.error("Error fetching tax codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch tax codes" },
      { status: 500 }
    );
  }
}
