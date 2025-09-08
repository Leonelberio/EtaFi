import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { requireRole } from "@/lib/rbac-middleware";

// GET /api/project-templates/[templateId] - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await params;

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    const template = await db.projectTemplate.findFirst({
      where: {
        id: templateId,
        OR: [{ organizationId: membership.organizationId }, { isPublic: true }],
      },
      include: {
        templateActivities: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            templateSubActivities: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            templateActivities: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching project template:", error);
    return NextResponse.json(
      { error: "Failed to fetch project template" },
      { status: 500 }
    );
  }
}

// PUT /api/project-templates/[templateId] - Update a template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require ADMIN role for updating templates
    await requireRole("ADMIN")(request);

    const { templateId } = await params;
    const body = await request.json();
    const {
      name,
      description,
      category,
      industry,
      totalBudget,
      currency,
      isPublic,
      isActive,
    } = body;

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    // Check if template exists and user has access
    const existingTemplate = await db.projectTemplate.findFirst({
      where: {
        id: templateId,
        organizationId: membership.organizationId,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Update template
    const updatedTemplate = await db.projectTemplate.update({
      where: { id: templateId },
      data: {
        name,
        description,
        category,
        industry,
        totalBudget: totalBudget ? parseFloat(totalBudget) : null,
        currency,
        isPublic,
        isActive,
      },
      include: {
        templateActivities: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            templateSubActivities: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            templateActivities: true,
          },
        },
      },
    });

    return NextResponse.json({
      template: updatedTemplate,
      success: true,
    });
  } catch (error) {
    console.error("Error updating project template:", error);
    return NextResponse.json(
      { error: "Failed to update project template" },
      { status: 500 }
    );
  }
}

// DELETE /api/project-templates/[templateId] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require ADMIN role for deleting templates
    await requireRole("ADMIN")(request);

    const { templateId } = await params;

    // Get user's organization
    const membership = await db.organizationMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    // Check if template exists and user has access
    const existingTemplate = await db.projectTemplate.findFirst({
      where: {
        id: templateId,
        organizationId: membership.organizationId,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Delete template (cascade will handle related records)
    await db.projectTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project template:", error);
    return NextResponse.json(
      { error: "Failed to delete project template" },
      { status: 500 }
    );
  }
}
