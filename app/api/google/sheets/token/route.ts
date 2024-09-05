import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get the access token from cookies
    const accessToken = req.cookies.get('googleSheetsAccessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return NextResponse.json({ error: 'Failed to retrieve access token' }, { status: 500 });
  }
}
