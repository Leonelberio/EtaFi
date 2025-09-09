import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// POST: Create a new organization
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const {
    name,
    description,
    address,
    city,
    postalCode,
    country,
    phone,
    email,
    website,
    taxNumber,
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
    // Check if user already has an organization with this name
    const existingOrg = await db.organization.findFirst({
      where: {
        ownerId: session.user.id,
        name: name,
      },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "You already have an organization with this name" },
        { status: 400 }
      );
    }

    const newOrganization = await db.organization.create({
      data: {
        name,
        description,
        address,
        city,
        postalCode,
        country,
        phone,
        email,
        website,
        taxNumber,
        gstNumber,
        qstNumber,
        fiscalYearEnd,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER", // Creator becomes the OWNER
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
    return NextResponse.json(newOrganization);
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}

// GET: Fetch organizations the user is part of
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Get user's current organization preference
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { currentOrganizationId: true },
    });

    const organizations = await db.organization.findMany({
      where: {
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
        projects: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ 
      organizations,
      currentOrganizationId: user?.currentOrganizationId || null
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}
