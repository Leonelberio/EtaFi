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
    const { companyId } = params;
    const body = await req.json();

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Check if the company exists before updating
    const existingCompany = await db.company.findUnique({
      where: { id: companyId },
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Update the company details
    const updatedCompany = await db.company.update({
      where: { id: companyId },
      data: {
        ...body, // This assumes the body contains the updated company fields
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}

// DELETE: Delete a company by its string ID
export async function DELETE(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const { companyId } = params;

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Check if the company exists before deleting
    const existingCompany = await db.company.findUnique({
      where: { id: companyId },
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Delete the company
    await db.company.delete({
      where: { id: companyId },
    });

    return NextResponse.json({ message: "Company deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
