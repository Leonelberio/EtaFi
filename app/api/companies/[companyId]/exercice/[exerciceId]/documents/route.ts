//@ts-nocheck


import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { exerciceId: string } }) {
    const { exerciceId } = params;
  
    try {
      // Fetch all documents related to a specific exercise
      const documents = await db.document.findMany({
        where: { exerciceId },
      });
  
      return NextResponse.json(documents);
    } catch (error) {
      console.error("Error fetching exercise documents:", error);
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
  }

// POST: Upload a document for an exercise
export async function POST(req: NextRequest, { params }: { params: { companyId: string, exerciceId: string } }) {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
  
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
  
    const buffer = Buffer.from(await file.arrayBuffer());
    const originalFileName = file.name || 'unknown-file';
    const fileExtension = originalFileName.split('.').pop(); // Extract file extension
    const filename = `${nanoid()}.${fileExtension}`; // Unique filename using nanoid
    const filePath = join(process.cwd(), `public/uploads/companies/${params.companyId}/${params.exerciceId}`, filename);
  
    try {
      // Ensure the directory exists and save the file
      await fs.mkdir(join(process.cwd(), `public/uploads/companies/${params.companyId}/${params.exerciceId}`), { recursive: true });
      await fs.writeFile(filePath, buffer);
  
      // Generate the URL to access the file
      const fileUrl = `/uploads/companies/${params.companyId}/${params.exerciceId}/${filename}`;
  
      // Store document details in the database
      const newDocument = await db.document.create({
        data: {
          fileUrl,
          fileName: originalFileName,
          type: fileExtension || 'unknown',
          companyId: params.companyId,
          exerciceId: params.exerciceId,
        },
      });
  
      return NextResponse.json(newDocument);
    } catch (error) {
      console.error('File upload error:', error);
      return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }
  }
  