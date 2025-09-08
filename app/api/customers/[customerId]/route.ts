import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";
import { customerSchema } from "@/schemas";

// GET: Fetch specific customer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;

    const customer = await db.customer.findFirst({
      where: {
        id: customerId,
        organizationId: orgId,
      },
      include: {
        receivableAccount: {
          select: { id: true, number: true, name: true },
        },
        projects: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            projects: true,
            journalLines: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update customer
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;
    const body = await req.json();
    const validatedData = customerSchema.parse(body);

    // Check if customer exists and belongs to organization
    const existingCustomer = await db.customer.findFirst({
      where: {
        id: customerId,
        organizationId: orgId,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const updatedCustomer = await db.customer.update({
      where: { id: customerId },
      data: validatedData,
      include: {
        receivableAccount: {
          select: { id: true, number: true, name: true },
        },
        _count: {
          select: {
            projects: true,
            journalLines: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete customer
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const orgId = await getCurrentOrgId();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId } = await params;

    // Check if customer exists and belongs to organization
    const existingCustomer = await db.customer.findFirst({
      where: {
        id: customerId,
        organizationId: orgId,
      },
      include: {
        _count: {
          select: {
            projects: true,
            journalLines: true,
          },
        },
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Check if customer has associated transactions or projects
    if (existingCustomer._count.journalLines > 0 || existingCustomer._count.projects > 0) {
      return NextResponse.json(
        { error: "Cannot delete customer with existing transactions or projects" },
        { status: 400 }
      );
    }

    await db.customer.delete({
      where: { id: customerId },
    });

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
