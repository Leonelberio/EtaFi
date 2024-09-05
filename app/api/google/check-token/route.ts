import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const accessToken = cookies().get("googleSheetsAccessToken");

    if (accessToken) {
      return NextResponse.json({ hasToken: true });
    } else {
      return NextResponse.json({ hasToken: false });
    }
  } catch (error) {
    console.error("Error checking Google Sheets access token:", error);
    return NextResponse.json({ hasToken: false, error: "Error checking token" }, { status: 500 });
  }
}
