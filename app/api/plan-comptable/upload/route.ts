import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Your Prisma DB instance
import { parse } from 'csv-parse/sync'; // CSV parser

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob; // Get the uploaded file

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const csvText = await file.text(); // Convert file blob to text
    const parsedCsv = parse(csvText, {
      columns: ["numero_compte", "libelle_compte"], // Define CSV columns
      skip_empty_lines: true,
      trim: true
    });

    // Save the parsed data to the database
    await db.accountPlan.createMany({
      data: parsedCsv,
      skipDuplicates: true, // Avoid duplicates
    });

    return NextResponse.json({ message: "Plan comptable uploaded successfully!" });
  } catch (error) {
    console.error("Error uploading plan comptable:", error);
    return NextResponse.json({ error: "Failed to upload plan comptable" }, { status: 500 });
  }
}
