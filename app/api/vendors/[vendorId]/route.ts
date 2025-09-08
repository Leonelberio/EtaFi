import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { vendorSchema } from "@/schemas";

// GET /api/vendors/[vendorId] - Get a specific vendor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await params;

    const vendor = await db.vendor.findFirst({
      where: {
        id: vendorId,
        organizationId: orgId,
      },
      include: {
        payableAccount: {
          select: { id: true, number: true, name: true },
        },
        _count: {
          select: {
            journalLines: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}

// PUT /api/vendors/[vendorId] - Update a vendor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await params;
    const body = await request.json();
    const validatedData = vendorSchema.parse(body);

    // Check if vendor exists and user has access
    const existingVendor = await db.vendor.findFirst({
      where: {
        id: vendorId,
        organizationId: orgId,
      },
    });

    if (!existingVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Update vendor
    const vendor = await db.vendor.update({
      where: { id: vendorId },
      data: validatedData,
      include: {
        payableAccount: {
          select: { id: true, number: true, name: true },
        },
        _count: {
          select: {
            journalLines: true,
          },
        },
      },
    });

    return NextResponse.json({
      vendor,
      success: true,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update vendor" },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/[vendorId] - Delete a vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await params;

    // Check if vendor exists and user has access
    const existingVendor = await db.vendor.findFirst({
      where: {
        id: vendorId,
        organizationId: orgId,
      },
      include: {
        _count: {
          select: {
            journalLines: true,
          },
        },
      },
    });

    if (!existingVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Check if vendor has associated transactions
    if (existingVendor._count.journalLines > 0) {
      return NextResponse.json(
        { error: "Cannot delete vendor with existing transactions" },
        { status: 400 }
      );
    }

    // Delete vendor
    await db.vendor.delete({
      where: { id: vendorId },
    });

    return NextResponse.json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json(
      { error: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}
