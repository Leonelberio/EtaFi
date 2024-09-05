// app/api/google/sheets/[spreadsheetId]/columns/route.ts

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: { spreadsheetId: string } }) {
  try {
    // Retrieve the tab name from the query parameters
    const tabName = req.nextUrl.searchParams.get("tab");

    if (!tabName) {
      return NextResponse.json({ error: "Tab name is required" }, { status: 400 });
    }

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

    // Use the Google Sheets API to get the columns (first row) of the specified tab (sheet)
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const spreadsheetId = params.spreadsheetId;

    // Fetch the data from the specified tab
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!1:1`, // Assuming the first row contains the column headers
    });

    const columns = response.data.values?.[0] || []; // Get the first row as columns
    return NextResponse.json({ columns });
  } catch (error) {
    console.error("Error fetching columns from Google Sheets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
