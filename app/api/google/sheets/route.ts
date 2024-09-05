import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    // Retrieve the Google Sheets access token from cookies
    const accessTokenCookie = cookies().get("googleSheetsAccessToken");

    if (!accessTokenCookie) {
      return NextResponse.json({ error: "Not authenticated with Google" }, { status: 401 });
    }

    const accessToken = accessTokenCookie.value;

    // Create an OAuth2 client and set the access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    // Use the Google Drive API to list the user's Google Sheets
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "files(id, name)",
    });

    const sheets = response.data.files || [];
    return NextResponse.json({ sheets });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
