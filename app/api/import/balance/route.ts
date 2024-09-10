//@ts-nocheck

import { auth } from "@/auth"; // Import your authentication logic
import { db } from "@/lib/db"; // Prisma client instance
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth(); // Retrieve the session and user info
    if (!session?.user?.id) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Retrieve the file (CSV) and parse the data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const csvData = await file.text(); // Read CSV content as text
    const accounts = parseCSV(csvData); // Parse CSV into objects

    // Save the accounts data to the database using Prisma
    const importedAccounts = await Promise.all(
      accounts.map((account: any) =>
        db.financialAccount.upsert({
          where: { accountCode: account.accountCode },
          update: {
            accountName: account.accountName,
            balance: account.balance,
            type: account.type,
          },
          create: {
            accountCode: account.accountCode,
            accountName: account.accountName,
            balance: account.balance,
            type: account.type,
            userId: session.user.id, // Use the authenticated user's ID
          },
        })
      )
    );

    return NextResponse.json({ message: "Import successful", data: importedAccounts }, { status: 200 });
  } catch (error) {
    console.error("Error importing balance:", error);
    return NextResponse.json({ error: "Failed to import balance" }, { status: 500 });
  }
}

// CSV Parsing Function
function parseCSV(data: string) {
  const lines = data.split("\n");
  const result = [];

  // Assume the first line is the header
  const headers = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentLine = lines[i].split(",");

    headers.forEach((header, index) => {
      obj[header.trim()] = currentLine[index]?.trim();
    });

    // Convert balance to number
    obj.balance = parseFloat(obj.balance);

    result.push(obj);
  }

  return result;
}
