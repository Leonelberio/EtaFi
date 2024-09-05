// app/api/google/sheets/[spreadsheetId]/tabs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: { spreadsheetId: string } }) {
  try {
    // Retrieve the Google Sheets access token from cookies
    const accessToken = cookies().get("googleSheetsAccessToken");

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated with Google" }, { status: 401 });
    }

    // Create an OAuth2 client and set the access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken.value,
    });

    // Use the Google Sheets API to get the tabs (sheets) within the specified spreadsheet
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const spreadsheetId = params.spreadsheetId;

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const tabs = response.data.sheets?.map(sheet => sheet.properties?.title) || [];
    return NextResponse.json({ tabs });
  } catch (error) {
    console.error("Error fetching tabs from Google Sheets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
