//@ts-nocheck

import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import { join } from "path"
import { nanoid } from "nanoid"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as Blob | null

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${nanoid()}-${file.name}`
  const filePath = join(process.cwd(), "public/uploads", filename)

  await fs.writeFile(filePath, buffer)

  return NextResponse.json({ url: `/uploads/${filename}` })
}
