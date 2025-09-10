import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    // Get the latest invoice number for this organization
    const latestInvoice = await db.invoice.findFirst({
      where: { organizationId: membership.organizationId },
      orderBy: { createdAt: "desc" },
      select: { number: true },
    });

    let nextNumber = 1;
    if (latestInvoice?.number) {
      // Extract number from format like "INV-2025-001" or "INV-001"
      const match = latestInvoice.number.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // Generate new invoice number
    const year = new Date().getFullYear();
    const paddedNumber = nextNumber.toString().padStart(3, "0");
    const invoiceNumber = `INV-${year}-${paddedNumber}`;

    return NextResponse.json({ number: invoiceNumber });
  } catch (error) {
    console.error("Error generating invoice number:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice number" },
      { status: 500 }
    );
  }
}
