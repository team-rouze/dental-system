import { NextResponse } from "next/server";
import { getSuppressionList } from "@/lib/compliance/consentEngine";

export async function GET() {
    const suppressed = getSuppressionList();
    return NextResponse.json({ patients: suppressed, count: suppressed.length });
}
