//@ts-nocheck

// POST: Add a member to an organization
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// POST: Add a member to an organization
export async function POST(req: NextRequest, { params }) {
  const session = await auth();
  const { organizationId } = params;
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const { userEmail, role } = await req.json();  // Inviting by userEmail (email is unique)

  // Ensure user adding a member is an ADMIN or OWNER of the organization
  const membership = await db.organizationMembership.findFirst({
    where: {
      userId: session.user.id,
      organizationId: organizationId,
      role: { in: ['ADMIN', 'OWNER'] },  // Only ADMIN/OWNER can add members
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Lookup the user by email
  const userToAdd = await db.user.findUnique({ where: { email: userEmail } });
  
  // If user is not found, return an error
  if (!userToAdd) {
    return NextResponse.json({ error: `User with email ${userEmail} not found` }, { status: 404 });
  }

  try {
    const newMember = await db.organizationMembership.create({
      data: {
        userId: userToAdd.id,
        organizationId: organizationId,
        role: role || 'MEMBER',  // Default to MEMBER if no role is provided
      },
    });
    return NextResponse.json(newMember);
  } catch (error) {
    console.error("Error adding member to organization:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}


// GET: Fetch all members of an organization
export async function GET(req: NextRequest, { params }) {
    const session = await auth();
    const { organizationId } = params;
  
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
  
    // Ensure the current user is a member of the organization
    const membership = await db.organizationMembership.findFirst({
      where: {
        userId: session.user.id,
        organizationId: organizationId,
      },
    });
  
    if (!membership) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
  
    try {
      const members = await db.organizationMembership.findMany({
        where: { organizationId: organizationId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return NextResponse.json({ members });
    } catch (error) {
      console.error("Error fetching organization members:", error);
      return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
    }
  }