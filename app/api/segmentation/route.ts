import { NextResponse } from "next/server";
import { runSegmentation, getSegmentSummary } from "@/lib/segmentation/segmentationEngine";

export async function GET() {
    const summary = getSegmentSummary();
    // Auto-run if no segments exist yet but patients exist
    if (summary.totalPatients > 0 && summary.segmented === 0) {
        runSegmentation();
        return NextResponse.json(getSegmentSummary());
    }
    return NextResponse.json(summary);
}

export async function POST() {
    try {
        runSegmentation();
        return NextResponse.json({ success: true, summary: getSegmentSummary() });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
