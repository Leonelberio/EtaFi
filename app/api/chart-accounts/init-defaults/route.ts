import { NextRequest, NextResponse } from "next/server";
import { currentUser, getCurrentOrgId } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/chart-accounts/init-defaults
 * Initialize default chart accounts from templates if none exist
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get organization ID
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization context required" },
        { status: 400 }
      );
    }

    // Check if organization already has chart accounts
    const existingAccounts = await db.chartAccount.count({
      where: {
        organizationId,
      },
    });

    if (existingAccounts > 0) {
      return NextResponse.json(
        {
          message: "Organization already has chart accounts",
          accountCount: existingAccounts,
        },
        { status: 200 }
      );
    }

    // Apply the small business template by default
    const templateResponse = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/chart-accounts/templates`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Forward cookies for authentication
          "Cookie": request.headers.get("Cookie") || "",
        },
        body: JSON.stringify({
          templateId: "small_business",
          overwriteExisting: false,
        }),
      }
    );

    if (!templateResponse.ok) {
      const error = await templateResponse.json();
      throw new Error(error.error || "Failed to apply template");
    }

    const templateResult = await templateResponse.json();

    return NextResponse.json({
      success: true,
      message: "Default chart accounts initialized successfully",
      template: "small_business",
      accountsCreated: templateResult.accountsCreated,
    });
  } catch (error) {
    console.error("Error initializing default chart accounts:", error);
    return NextResponse.json(
      { error: "Failed to initialize chart accounts" },
      { status: 500 }
    );
  }
}
