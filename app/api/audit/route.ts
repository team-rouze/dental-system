import { NextResponse } from "next/server";
import { generateAuditReport } from "@/lib/audit/revenueAuditEngine";
import { segmentStore } from "@/lib/db/store";

export async function GET() {
    const allSegments = segmentStore.getAll();

    // If we haven't segmented yet, we can't run an audit.
    if (allSegments.length === 0) {
        return NextResponse.json({
            totalRecoverableRevenue: 0,
            results: [],
            lastCalculatedAt: null
        });
    }

    const audit = generateAuditReport();
    return NextResponse.json(audit);
}
