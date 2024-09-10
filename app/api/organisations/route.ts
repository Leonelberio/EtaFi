import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// POST: Create a new organization
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const { name, description } = await req.json();

  try {
    const newOrganisation = await db.organization.create({
      data: {
        name,
        description,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',  // Creator becomes the OWNER
          },
        },
      },
    });
    return NextResponse.json(newOrganisation);
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }
}

// GET: Fetch organizations the user is part of
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const organisations = await db.organization.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: true,
        companies: true,  // Optionally include companies linked to the organization
      },
    });
    return NextResponse.json({ organisations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}
