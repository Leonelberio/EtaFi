import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * POST /api/organizations/switch
 * Switch user's current organization (stored in session/database)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { organizationId } = body;

    if (!organizationId || typeof organizationId !== 'string') {
      return NextResponse.json(
        { error: "Valid organization ID is required" },
        { status: 400 }
      );
    }

    console.log('Switching to organization:', organizationId, 'for user:', session.user.id);

    // Use a transaction to avoid connection pool issues
    const result = await db.$transaction(async (tx) => {
      // Verify user has access to this organization
      const membership = await tx.organizationMembership.findFirst({
        where: {
          userId: session.user.id,
          organizationId: organizationId,
          isActive: true,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!membership) {
        throw new Error("ACCESS_DENIED");
      }

      // Update user's current organization preference
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: { currentOrganizationId: organizationId },
      });

      return {
        membership,
        updatedUser,
      };
    });

    if (!result.membership) {
      console.log('No membership found for user:', session.user.id, 'org:', organizationId);
      return NextResponse.json(
        { error: "Access denied to this organization" },
        { status: 403 }
      );
    }

    console.log('Successfully updated user org preference:', result.updatedUser.currentOrganizationId);

    return NextResponse.json({
      success: true,
      organization: {
        id: result.membership.organization.id,
        name: result.membership.organization.name,
        role: result.membership.role,
      },
    });
  } catch (error) {
    console.error("Error switching organization:", error);
    
    // Check if it's an access denied error
    if (error instanceof Error && error.message === 'ACCESS_DENIED') {
      return NextResponse.json(
        { error: "Access denied to this organization" },
        { status: 403 }
      );
    }
    
    // Check if it's a Prisma timeout error
    if (error instanceof Error && error.message.includes('Timed out fetching')) {
      return NextResponse.json(
        { error: "Database timeout - please try again" },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to switch organization" },
      { status: 500 }
    );
  }
}
