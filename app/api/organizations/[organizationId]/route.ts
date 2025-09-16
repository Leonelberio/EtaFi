import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch specific organization details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const { organizationId } = await params;

  try {
    const organization = await db.organization.findFirst({
      where: {
        id: organizationId,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        owner: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

// PUT: Update organization details
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const { organizationId } = await params;
  const {
    name,
    description,
    businessDomain,
    address,
    city,
    postalCode,
    country,
    phone,
    email,
    website,
    taxNumber,
    nasNumber,
    gstNumber,
    qstNumber,
    fiscalYearEnd,
  } = await req.json();

  if (!name) {
    return NextResponse.json(
      { error: "Organization name is required" },
      { status: 400 }
    );
  }

  try {
    // Check if user has permission to update (must be OWNER or ADMIN)
    const membershipCheck = await db.organizationMembership.findFirst({
      where: {
        organizationId: organizationId,
        userId: session.user.id,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    });

    if (!membershipCheck) {
      return NextResponse.json(
        { error: "Insufficient permissions to update this organization" },
        { status: 403 }
      );
    }

    // Check if another organization with this name exists for the same owner
    const existingOrg = await db.organization.findFirst({
      where: {
        ownerId: session.user.id,
        name: name,
        id: {
          not: organizationId,
        },
      },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "You already have an organization with this name" },
        { status: 400 }
      );
    }

    const updatedOrganization = await db.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        name,
        description,
        businessDomain,
        address,
        city,
        postalCode,
        country,
        phone,
        email,
        website,
        taxNumber,
        nasNumber,
        gstNumber,
        qstNumber,
        fiscalYearEnd,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        owner: true,
      },
    });

    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE: Delete organization
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const { organizationId } = await params;

  try {
    // Check if user is the owner of the organization
    const organization = await db.organization.findFirst({
      where: {
        id: organizationId,
        ownerId: session.user.id,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found or insufficient permissions" },
        { status: 404 }
      );
    }

    // Delete the organization (this will cascade delete members and related data)
    await db.organization.delete({
      where: {
        id: organizationId,
      },
    });

    return NextResponse.json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
