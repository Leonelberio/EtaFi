// api/companies/[companyId]/exercice/[exerciceId]/documents/[documentId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";  // Adjust to the actual path of your db client
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(req: NextRequest, { params }: { params: { documentId: string } }) {
  const { documentId } = params;

  try {
    // Fetch the document to get the file URL
    const document = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete the document from the database
    await db.document.delete({
      where: { id: documentId },
    });

    // Delete the file from the server
    const filePath = join(process.cwd(), "public", document.fileUrl);  // Ensure fileUrl starts with /uploads/...
    await unlink(filePath);

    return NextResponse.json({ message: "Document deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
