import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getUserMembership, hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ROLES, Role } from "@/lib/rbac";

/**
 * GET /api/rbac/members
 * Get organization members with their roles and permissions
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID required" },
        { status: 400 }
      );
    }

    // Check if user has permission to view members
    const canViewMembers = await hasPermission(
      user.id,
      organizationId,
      "USERS",
      "READ"
    );

    if (!canViewMembers) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get organization members
    const members = await prisma.organizationMembership.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        permissions: {
          select: {
            id: true,
            module: true,
            action: true,
            resource: true,
            expiresAt: true,
            grantedAt: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    });

    return NextResponse.json({
      members,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rbac/members
 * Add a new member to the organization
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      email,
      organizationId,
      role = "LECTURE",
      department,
      costCenter,
      projectAccess = [],
      maxApprovalAmount,
    } = body;

    // Check if current user has permission to add members
    const canAddMembers = await hasPermission(
      user.id,
      organizationId,
      "USERS",
      "CREATE"
    );

    if (!canAddMembers) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUser.id,
          organizationId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Create the membership
    const membership = await prisma.organizationMembership.create({
      data: {
        userId: targetUser.id,
        organizationId,
        role: role as Role,
        department,
        costCenter,
        projectAccess,
        maxApprovalAmount: maxApprovalAmount
          ? parseFloat(maxApprovalAmount)
          : null,
        activatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      membership,
      success: true,
    });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}
