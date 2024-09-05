import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  // Clear the googleSheetsAccessToken cookie
  cookies().set('googleSheetsAccessToken', '', {
    httpOnly: true,
    expires: new Date(0), // Expire the cookie immediately
    path: '/',
  });

  return NextResponse.json({ message: 'Disconnected from Google Sheets' });
}
