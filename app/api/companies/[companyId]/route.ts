import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch a company by its string ID, including related exercises
export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const { companyId } = params;

    // Validate companyId
    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Fetch the company details, including related exercises
    const company = await db.company.findUnique({
      where: { id: companyId },
      include: { exercices: true }, // Include exercises in the response
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

// PUT: Update a company's details
export async function PUT(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { companyId } = params;
    const body = await req.json();

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Check if the company exists before updating
    const existingCompany = await db.company.findUnique({
      where: { id: companyId },
      include: {
        organization: {
          include: {
            members: true, // Include organisation members to check roles
          },
        },
      },
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Authorization: Check if the user can update the company
    const isOwner = existingCompany.userId === session.user.id;
    const isOrganisationAdmin = existingCompany.organization?.members.some(
      (member) =>
        member.userId === session.user.id && (member.role === "OWNER" || member.role === "ADMIN")
    );

    if (!isOwner && !isOrganisationAdmin) {
      return NextResponse.json({ error: "Not authorized to update this company" }, { status: 403 });
    }

    // Update the company details
    const updatedCompany = await db.company.update({
      where: { id: companyId },
      data: {
        ...body, // Assuming body contains the updated fields
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}


