import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";

// POST /api/invoices/generate-number - Generate next invoice number for a project
export async function POST(req: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Get project to access prefix and last invoice number
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      select: {
        id: true,
        code: true,
        invoicePrefix: true,
        lastInvoiceNumber: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Generate next invoice number
    const nextNumber = (project.lastInvoiceNumber || 0) + 1;
    const prefix = project.invoicePrefix || project.code || "INV";
    const invoiceNumber = `${prefix}-${String(nextNumber).padStart(4, "0")}`;

    // Update project's last invoice number (optimistic update)
    await db.project.update({
      where: { id: projectId },
      data: { lastInvoiceNumber: nextNumber },
    });

    return NextResponse.json({
      invoiceNumber,
      nextNumber,
      prefix,
    });
  } catch (error) {
    console.error("Error generating invoice number:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice number" },
      { status: 500 }
    );
  }
}
