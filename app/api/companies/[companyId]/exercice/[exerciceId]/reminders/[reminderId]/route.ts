import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Delete a specific reminder
export async function DELETE(req: NextRequest, { params }: { params: { companyId: string, exerciceId: string, reminderId: string } }) {
  const { reminderId } = params;

  try {
    await db.reminder.delete({
      where: { id: reminderId },
    });

    return NextResponse.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}

// Update a specific reminder
export async function PATCH(req: NextRequest, { params }: { params: { companyId: string, exerciceId: string, reminderId: string } }) {
  const { reminderId } = params;
  const body = await req.json();

  try {
    const updatedReminder = await db.reminder.update({
      where: { id: reminderId },
      data: body, // Assume the updated data is in the request body
    });

    return NextResponse.json(updatedReminder);
  } catch (error) {
    console.error("Error updating reminder:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}
