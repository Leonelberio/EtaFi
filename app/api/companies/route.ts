//@ts-nocheck

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const { name, address, nif, contact, logo, organizationId } = await req.json();

  try {
    let companyData = {
      name,
      address,
      nif,
      contact,
      logo,
      userId: session.user.id, // Always associate with the authenticated user
      organizationId,
    };

    // If organizationId is provided, check if the user belongs to that organization
    if (organizationId) {
      const membership = await db.organizationMembership.findFirst({
        where: {
          userId: session.user.id,
          organizationId: organizationId,
        },
      });

      if (!membership) {
        return NextResponse.json({ error: "User is not authorized to add a company to this organization" }, { status: 403 });
      }

      // If authorized, add organization to the company data
      companyData.organizationId = organizationId;
    }

    // Create a new company linked to the user and optionally the organization
    const newCompany = await db.company.create({
      data: companyData,
    });

    return NextResponse.json(newCompany);
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}



export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "0", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const skip = page * limit;

    // Fetch the user's memberships in organizations
    const memberships = await db.organizationMembership.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    const organizationIds = memberships.map((membership) => membership.organizationId);

    // Fetch companies that belong to the organizations where the user is a member or created by the user directly
    const [companies, totalCompanies] = await Promise.all([
      db.company.findMany({
        where: {
          OR: [
            { organizationId: { in: organizationIds } }, // Companies within organizations the user is a part of
            { userId: session.user.id }, // Companies created directly by the user
          ],
        },
        skip: skip,
        take: limit,
        orderBy: {
          createdAt: "desc", // Order by the creation date (newest first)
        },
        include: {
          exercices: { // Include related exercises for each company
            orderBy: {
              startDate: "desc", // Order exercises by their start date
            },
          },
        },
      }),
      db.company.count({
        where: {
          OR: [
            { organizationId: { in: organizationIds } }, // Companies within organizations the user is a part of
            { userId: session.user.id }, // Companies created directly by the user
          ],
        },
      }),
    ]);

    const hasMore = skip + companies.length < totalCompanies;

    return NextResponse.json({ companies, hasMore });
  } catch (error) {
    console.error("Error fetching companies and exercises:", error);
    return NextResponse.json({ error: "Failed to fetch companies and exercises" }, { status: 500 });
  }
}



export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    console.log("Session:", session); // Log the session details for debugging
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

        console.log("CompanyId:", companyId); // Log to ensure the companyId is received

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Check if the company exists before deleting
    const existingCompany = await db.company.findUnique({
      where: { id: companyId },
      include: {
        organization: {
          include: {
            members: true, // Include organization members to check roles
          },
        },
      },
    });
    console.log("Existing Company:", existingCompany); // Log to check if the company is found

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Authorization: Check if the user can delete the company
    const isOwner = existingCompany.userId === session.user.id;
    const isorganizationAdmin = existingCompany.organization?.members.some(
      (member) =>
        member.userId === session.user.id && (member.role === "OWNER" || member.role === "ADMIN")
    );

    if (!isOwner && !isorganizationAdmin) {
      return NextResponse.json({ error: "Not authorized to delete this company" }, { status: 403 });
    }

    // Delete the company
    await db.company.delete({
      where: { id: companyId },
    });

    return NextResponse.json({ message: "Company deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting company:", error.message, error.stack); // Log the error stack
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
