

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

// Fetch all reminders for a specific exercise
export async function GET(req: NextRequest, { params }: { params: { companyId: string, exerciceId: string } }) {
    const { exerciceId } = params;
  
    try {
      // Check if exerciceId is valid
      if (!exerciceId) {
        return NextResponse.json({ error: "exerciceId is missing" }, { status: 400 });
      }
  
      // Fetch the reminders for the specific exercice
      const reminders = await db.reminder.findMany({
        where: { exerciceId },
      });
  
      // If no reminders found, return a message
      if (!reminders || reminders.length === 0) {
        return NextResponse.json({ message: "No reminders found for this exercice" }, { status: 200 });
      }
  
      // Return the reminders
      return NextResponse.json(reminders);
    } catch (error:any) {
      console.error("Error fetching reminders:", error);
      return NextResponse.json({ error: "Failed to fetch reminders", details: error.message }, { status: 500 });
    }
}


// Create a new reminder for a specific exercise
export async function POST(req: NextRequest, { params }: { params: { companyId: string, exerciceId: string } }) {
  const { exerciceId } = params;
  const body = await req.json();

  // Add validation for required fields
  if (!body.alerts || !Array.isArray(body.alerts)) {
    return NextResponse.json({ error: "Invalid request body: Alerts should be an array" }, { status: 400 });
  }

  try {
    const newReminder = await db.reminder.create({
      data: {
        type: body.type,
        exerciceId,
        userId: body.userId, // Ensure this is passed correctly
        alerts: body.alerts, // Storing alerts as JSON
      },
    });

    return NextResponse.json(newReminder);
  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
