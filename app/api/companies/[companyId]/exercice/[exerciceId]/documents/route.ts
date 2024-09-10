// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { nanoid } from "nanoid";
import { db } from "@/lib/db"; // Assuming you're using Prisma or similar ORM

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

// // POST: Upload a document for an exercise
// export async function POST(req: NextRequest, { params }: { params: { companyId: string, exerciceId: string } }) {
//     const formData = await req.formData();
//     const file = formData.get('file') as Blob | null;
  
//     if (!file) {
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }
  
//     const buffer = Buffer.from(await file.arrayBuffer());
//     const originalFileName = file.name || 'unknown-file';
//     const fileExtension = originalFileName.split('.').pop(); // Extract file extension
//     const filename = `${nanoid()}.${fileExtension}`; // Unique filename using nanoid
//     const filePath = join(process.cwd(), `public/uploads/companies/${params.companyId}/${params.exerciceId}`, filename);
  
//     try {
//       // Ensure the directory exists and save the file
//       await fs.mkdir(join(process.cwd(), `public/uploads/companies/${params.companyId}/${params.exerciceId}`), { recursive: true });
//       await fs.writeFile(filePath, buffer);
  
//       // Generate the URL to access the file
//       const fileUrl = `/uploads/companies/${params.companyId}/${params.exerciceId}/${filename}`;
  
//       // Store document details in the database
//       const newDocument = await db.document.create({
//         data: {
//           fileUrl,
//           fileName: originalFileName,
//           type: fileExtension || 'unknown',
//           companyId: params.companyId,
//           exerciceId: params.exerciceId,
//         },
//       });
  
//       return NextResponse.json(newDocument);
//     } catch (error) {
//       console.error('File upload error:', error);
//       return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
//     }
//   }
  




// Configure Cloudinary with environment variables
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

  try {
    // Convert the file to base64 for Cloudinary
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload the file to Cloudinary
    const result = await cloudinary.v2.uploader.upload(base64, {
      folder: `companies/${params.companyId}/${params.exerciceId}`, // Folder to organize uploads by company and exercise
      public_id: filename, // Set the unique filename
      type: "upload",
      resource_type: "raw"
    });

    // Store document details in the database
    const newDocument = await db.document.create({
      data: {
        fileUrl: result.secure_url, // URL of the file on Cloudinary
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
