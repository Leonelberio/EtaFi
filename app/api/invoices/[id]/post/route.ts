import { NextRequest, NextResponse } from "next/server";
import { getCurrentOrgId } from "@/lib/auth";
import { postInvoice } from "@/lib/posting";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getCurrentOrgId();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await postInvoice(organizationId, params.id);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error posting invoice:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 400 }
    );
  }
}
