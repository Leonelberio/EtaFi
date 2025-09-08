import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { hasPermission, getUserMembership } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ROLES, Role } from "@/lib/rbac";

interface RouteParams {
  params: {
    memberId: string;
  };
}

/**
 * GET /api/rbac/members/[memberId]
 * Get specific member details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Check permissions
    const canViewMembers = await hasPermission(
      user.id,
      organizationId,
      "USERS",
      "READ"
    );

    if (!canViewMembers) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get member details
    const member = await prisma.organizationMembership.findUnique({
      where: {
        id: params.memberId,
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
            grantedBy: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({
      member,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/rbac/members/[memberId]
 * Update member role and permissions
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
      organizationId,
      role,
      department,
      costCenter,
      projectAccess,
      maxApprovalAmount,
      isActive,
    } = body;

    // Check permissions
    const canUpdateMembers = await hasPermission(
      user.id,
      organizationId,
      "USERS",
      "UPDATE"
    );

    if (!canUpdateMembers) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get current member to check if it exists
    const currentMember = await prisma.organizationMembership.findUnique({
      where: {
        id: params.memberId,
        organizationId,
      },
    });

    if (!currentMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent self-demotion from OWNER role
    if (
      currentMember.userId === user.id &&
      currentMember.role === "OWNER" &&
      role !== "OWNER"
    ) {
      return NextResponse.json(
        { error: "Cannot demote yourself from owner role" },
        { status: 400 }
      );
    }

    // Update member
    const updatedMember = await prisma.organizationMembership.update({
      where: {
        id: params.memberId,
      },
      data: {
        role: role as Role,
        department,
        costCenter,
        projectAccess: projectAccess || [],
        maxApprovalAmount: maxApprovalAmount
          ? parseFloat(maxApprovalAmount)
          : null,
        isActive,
        deactivatedAt: isActive === false ? new Date() : null,
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
      member: updatedMember,
      success: true,
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rbac/members/[memberId]
 * Remove member from organization
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check permissions
    const canDeleteMembers = await hasPermission(
      user.id,
      organizationId,
      "USERS",
      "DELETE"
    );

    if (!canDeleteMembers) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get member to check if it exists and prevent self-deletion
    const member = await prisma.organizationMembership.findUnique({
      where: {
        id: params.memberId,
        organizationId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (member.userId === user.id) {
      return NextResponse.json(
        { error: "Cannot remove yourself from organization" },
        { status: 400 }
      );
    }

    // Delete member (this will cascade delete permissions)
    await prisma.organizationMembership.delete({
      where: {
        id: params.memberId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
