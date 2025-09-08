import { currentRole } from "@/lib/auth";
// UserRole enum values
const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
import { NextResponse } from "next/server";

export async function GET() {
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return new NextResponse(null, { status: 200 });
  }

  return new NextResponse(null, { status: 403 });
}
