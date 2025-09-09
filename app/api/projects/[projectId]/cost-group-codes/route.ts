import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";
import {
  projectCostGroupCodeSchema,
  type ProjectCostGroupCodeInput,
} from "@/lib/validations";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId]/cost-group-codes - Get project cost group codes
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Verify project exists and belongs to organization
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get cost group codes for this project
    const costGroupCodes = await db.projectCostGroupCode.findMany({
      where: {
        projectId,
        isActive: true,
      },
      include: {
        glAccount: {
          select: {
            id: true,
            number: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: [{ costGroup: "asc" }, { isDefault: "desc" }],
    });

    // Group by cost group for easier frontend handling
    const groupedCodes = {
      M: costGroupCodes.filter((c) => c.costGroup === "M"),
      S: costGroupCodes.filter((c) => c.costGroup === "S"),
      D: costGroupCodes.filter((c) => c.costGroup === "D"),
      E: costGroupCodes.filter((c) => c.costGroup === "E"),
      MOD: costGroupCodes.filter((c) => c.costGroup === "MOD"),
    };

    return NextResponse.json({
      projectId,
      projectName: project.name,
      costGroupCodes,
      groupedCodes,
    });
  } catch (error) {
    console.error("Error fetching project cost group codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost group codes" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/cost-group-codes - Create project cost group code
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body: ProjectCostGroupCodeInput = projectCostGroupCodeSchema.parse(
      await req.json()
    );

    // Verify project exists and belongs to organization
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify GL account exists and belongs to organization
    const glAccount = await db.chartAccount.findFirst({
      where: {
        id: body.glAccountId,
        organizationId,
        isActive: true,
      },
    });

    if (!glAccount) {
      return NextResponse.json(
        { error: "Chart account not found" },
        { status: 404 }
      );
    }

    // Check if this combination already exists
    const existingCode = await db.projectCostGroupCode.findUnique({
      where: {
        projectId_costGroup_glAccountId: {
          projectId,
          costGroup: body.costGroup,
          glAccountId: body.glAccountId,
        },
      },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: "This cost group and GL account combination already exists" },
        { status: 400 }
      );
    }

    // If this should be the default, unset other defaults for this group
    if (body.isDefault) {
      await db.projectCostGroupCode.updateMany({
        where: {
          projectId,
          costGroup: body.costGroup,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create the cost group code
    const costGroupCode = await db.projectCostGroupCode.create({
      data: {
        projectId,
        costGroup: body.costGroup,
        glAccountId: body.glAccountId,
        description: body.description,
        isActive: body.isActive ?? true,
        isDefault: body.isDefault ?? false,
      },
      include: {
        glAccount: {
          select: {
            id: true,
            number: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(costGroupCode, { status: 201 });
  } catch (error) {
    console.error("Error creating project cost group code:", error);
    return NextResponse.json(
      { error: "Failed to create cost group code" },
      { status: 500 }
    );
  }
}
