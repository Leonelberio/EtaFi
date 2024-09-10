//@ts-nocheck


import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import { nanoid } from "nanoid";
import { db } from "@/lib/db"; // Assuming you have a database module

// Fetch all documents related to a specific company (excluding exercise-specific documents)
export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
    const { companyId } = params;
  
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
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
  }
  
  


// POST: Upload a document for a company
export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
  const formData = await req.formData();
  const file = formData.get('file') as Blob | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const originalFileName = file.name || 'unknown-file';
  const fileExtension = originalFileName.split('.').pop(); // Extract file extension
  const filename = `${nanoid()}.${fileExtension}`; // Unique filename using nanoid
  const filePath = join(process.cwd(), `public/uploads/companies/${params.companyId}`, filename);

  try {
    // Ensure the directory exists and save the file
    await fs.mkdir(join(process.cwd(), 'public/uploads/companies', params.companyId), { recursive: true });
    await fs.writeFile(filePath, buffer);

    // Generate the URL to access the file
    const fileUrl = `/uploads/companies/${params.companyId}/${filename}`;

    // Store document details in the database
    const newDocument = await db.document.create({
      data: {
        fileUrl,
        fileName: originalFileName,
        type: fileExtension || 'unknown',
        companyId: params.companyId,
      },
    });

    return NextResponse.json(newDocument);
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
