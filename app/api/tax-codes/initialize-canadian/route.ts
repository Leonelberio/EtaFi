import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentOrgId } from "@/lib/auth";

// Predefined Canadian tax codes
const CANADIAN_TAX_CODES = [
  {
    code: "GST",
    name: "GST 5%",
    rate: 0.05,
    province: null,
    isActive: true,
    isCompound: false,
    description:
      "Goods and Services Tax - Federal tax applicable across Canada",
  },
  {
    code: "QST",
    name: "QST 9.975%",
    rate: 0.09975,
    province: "QC",
    isActive: true,
    isCompound: true,
    description:
      "Quebec Sales Tax - Provincial tax for Quebec, calculated on amount + GST",
  },
  {
    code: "HST_ON",
    name: "HST 13%",
    rate: 0.13,
    province: "ON",
    isActive: true,
    isCompound: false,
    description: "Harmonized Sales Tax - Ontario (replaces GST + PST)",
  },
  {
    code: "HST_NB",
    name: "HST 15%",
    rate: 0.15,
    province: "NB",
    isActive: true,
    isCompound: false,
    description: "Harmonized Sales Tax - New Brunswick (replaces GST + PST)",
  },
  {
    code: "HST_NL",
    name: "HST 15%",
    rate: 0.15,
    province: "NL",
    isActive: true,
    isCompound: false,
    description:
      "Harmonized Sales Tax - Newfoundland and Labrador (replaces GST + PST)",
  },
  {
    code: "HST_NS",
    name: "HST 15%",
    rate: 0.15,
    province: "NS",
    isActive: true,
    isCompound: false,
    description: "Harmonized Sales Tax - Nova Scotia (replaces GST + PST)",
  },
  {
    code: "HST_PE",
    name: "HST 15%",
    rate: 0.15,
    province: "PE",
    isActive: true,
    isCompound: false,
    description:
      "Harmonized Sales Tax - Prince Edward Island (replaces GST + PST)",
  },
  {
    code: "PST_BC",
    name: "PST 7%",
    rate: 0.07,
    province: "BC",
    isActive: true,
    isCompound: false,
    description: "Provincial Sales Tax - British Columbia",
  },
  {
    code: "PST_SK",
    name: "PST 6%",
    rate: 0.06,
    province: "SK",
    isActive: true,
    isCompound: false,
    description: "Provincial Sales Tax - Saskatchewan",
  },
  {
    code: "PST_MB",
    name: "PST 7%",
    rate: 0.07,
    province: "MB",
    isActive: true,
    isCompound: false,
    description: "Provincial Sales Tax - Manitoba",
  },
  {
    code: "EXEMPT",
    name: "Tax Exempt",
    rate: 0.0,
    province: null,
    isActive: true,
    isCompound: false,
    description:
      "Tax exempt items (books, basic groceries, medical supplies, etc.)",
  },
  {
    code: "ZERO_RATED",
    name: "Zero-Rated GST",
    rate: 0.0,
    province: null,
    isActive: true,
    isCompound: false,
    description:
      "Zero-rated GST items (exports, basic groceries, prescription drugs)",
  },
];

export async function POST(req: NextRequest) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { overwrite = false } = await req.json();

    // Check if tax codes already exist
    const existingTaxCodes = await db.taxCode.findMany({
      where: { organizationId },
      select: { code: true },
    });

    const existingCodes = new Set(existingTaxCodes.map((tc) => tc.code));

    // Filter out existing codes unless overwrite is true
    const codesToCreate = CANADIAN_TAX_CODES.filter(
      (tc) => overwrite || !existingCodes.has(tc.code)
    );

    if (codesToCreate.length === 0) {
      return NextResponse.json({
        message: "No new tax codes to create",
        existing: existingTaxCodes.length,
        available: CANADIAN_TAX_CODES.length,
      });
    }

    // If overwriting, delete existing codes first
    if (overwrite && existingTaxCodes.length > 0) {
      await db.taxCode.deleteMany({
        where: {
          organizationId,
          code: { in: CANADIAN_TAX_CODES.map((tc) => tc.code) },
        },
      });
    }

    // Create new tax codes
    const createdTaxCodes = await db.taxCode.createMany({
      data: codesToCreate.map((tc) => ({
        ...tc,
        organizationId,
      })),
    });

    return NextResponse.json({
      message: "Canadian tax codes initialized successfully",
      created: createdTaxCodes.count,
      total: await db.taxCode.count({ where: { organizationId } }),
      codes: codesToCreate.map((tc) => tc.code),
    });
  } catch (error) {
    console.error("Error initializing Canadian tax codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
