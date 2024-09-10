//@ts-nocheck

// import { NextRequest, NextResponse } from "next/server"
// import { promises as fs } from "fs"
// import { join } from "path"
// import { nanoid } from "nanoid"

// export async function POST(req: NextRequest) {
//   const formData = await req.formData()
//   const file = formData.get("file") as Blob | null

//   if (!file) {
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
//   }

//   const buffer = Buffer.from(await file.arrayBuffer())
//   const filename = `${nanoid()}-${file.name}`
//   const filePath = join(process.cwd(), "public/uploads", filename)

//   await fs.writeFile(filePath, buffer)

//   return NextResponse.json({ url: `/uploads/${filename}` })
// }



import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import { nanoid } from "nanoid";

// Configure Cloudinary with your credentials
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert the file to a base64-encoded string
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload the file to Cloudinary
    const result = await cloudinary.v2.uploader.upload(base64, {
      folder: "uploads", // Optional folder to organize your uploads in Cloudinary
      public_id: nanoid(), // Unique identifier for the file
    });

    // Return the secure URL of the uploaded file
    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
