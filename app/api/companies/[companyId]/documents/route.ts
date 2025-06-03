import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { db } from "@/lib/db"; // Assuming you're using Prisma or similar ORM

// Fetch all documents related to a specific company (excluding exercise-specific documents)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  try {
    // Fetch documents related only to the company, where exerciceId is null
    const documents = await db.document.findMany({
      where: {
        companyId,
        exerciceId: null, // Ensures that documents related to exercises are excluded
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching company documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// Configure Cloudinary with environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generate a unique ID
function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// POST: Upload a document for a company
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const originalFileName = file.name || "unknown-file";
  const fileExtension = originalFileName.split(".").pop(); // Extract file extension
  const filename = `${generateId()}.${fileExtension}`; // Unique filename

  try {
    // Convert the file to base64
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload the file to Cloudinary
    const result = await cloudinary.v2.uploader.upload(base64, {
      folder: `companies/${companyId}`, // Folder to organize uploads by company
      public_id: filename, // Set the unique filename
      type: "upload",
      resource_type: "raw",
    });

    // Store document details in the database
    const newDocument = await db.document.create({
      data: {
        fileUrl: result.secure_url, // URL of the file on Cloudinary
        fileName: originalFileName,
        type: fileExtension || "unknown",
        companyId: companyId,
      },
    });

    return NextResponse.json(newDocument);
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
