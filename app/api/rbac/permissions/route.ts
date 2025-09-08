import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getUserPermissions, getUserMembership } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/rbac/permissions
 * Get current user's permissions for the current organization
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

    // Get user permissions for the organization
    const permissions = await getUserPermissions(user.id, organizationId);

    if (!permissions.role) {
      return NextResponse.json(
        { error: "No access to this organization" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      permissions,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rbac/permissions
 * Grant custom permission to a user (requires ADMIN role)
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
    const { userId, organizationId, module, action, resource, expiresAt } =
      body;

    // Check if current user has admin permissions
    const currentUserMembership = await getUserMembership(
      user.id,
      organizationId
    );

    if (
      !currentUserMembership ||
      !["OWNER", "ADMINISTRATOR"].includes(currentUserMembership.role)
    ) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get target user's membership
    const targetMembership = await getUserMembership(userId, organizationId);

    if (!targetMembership) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 404 }
      );
    }

    // Create the permission
    const permission = await prisma.userPermission.create({
      data: {
        membershipId: targetMembership.id,
        module,
        action,
        resource,
        grantedBy: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        membership: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      permission,
      success: true,
    });
  } catch (error) {
    console.error("Error granting permission:", error);
    return NextResponse.json(
      { error: "Failed to grant permission" },
      { status: 500 }
    );
  }
}
