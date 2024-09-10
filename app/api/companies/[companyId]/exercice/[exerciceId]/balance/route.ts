import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

import { parse } from 'csv-parse/sync'; // CSV parser

export async function POST(req: Request, { params }: { params: { companyId: string, exerciceId: string } }) {
  try {
    const formData = await req.formData();
    const balanceData = formData.get("balanceData") as string;

    if (!balanceData) {
      return NextResponse.json({ error: "No balance data provided" }, { status: 400 });
    }

    const data = JSON.parse(balanceData);

    // Check if a balance sheet already exists for the given exerciceId
    const existingBalance = await db.balance.findUnique({
      where: { exerciceId: params.exerciceId },
    });

    if (existingBalance) {
      // If it exists, update the existing balance sheet
      await db.balance.update({
        where: { exerciceId: params.exerciceId },
        data: { data }, // Update balance data
      });
      return NextResponse.json({ message: "Balance updated successfully" });
    } else {
      // If no balance exists, create a new one
      await db.balance.create({
        data: {
          exerciceId: params.exerciceId,
          data, // Save balance data
        },
      });
      return NextResponse.json({ message: "Balance created successfully" });
    }
  } catch (error) {
    console.error("Error saving balance:", error);
    return NextResponse.json({ error: "Failed to save balance" }, { status: 500 });
  }
}



// GET to retrieve the balance for a specific exercice
export async function GET(req: NextRequest, { params }: { params: { companyId: string, exerciceId: string } }) {
  try {
    // Fetch the balance for the exercice
    const balance = await db.balance.findUnique({
      where: { exerciceId: params.exerciceId },
    });

    if (!balance) {
      return NextResponse.json({ error: 'Balance not found' }, { status: 404 });
    }

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}
