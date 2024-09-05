// app/api/google/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`
  );

  const { tokens } = await oauth2Client.getToken(code);

  if (tokens.access_token) {
    cookies().set("googleSheetsAccessToken", tokens.access_token, { httpOnly: true });
  }

  // Send a message to the parent window and close the popup
  const script = `
    <script>
      window.opener.postMessage({ success: true }, "${process.env.NEXT_PUBLIC_APP_URL}");
      window.close();
    </script>
  `;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
