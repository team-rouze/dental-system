import { NextRequest, NextResponse } from "next/server";
import { getPatientsBySegment } from "@/lib/segmentation/segmentationEngine";
import type { SegmentId } from "@/types";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ segmentId: string }> }
) {
    const segmentId = (await params).segmentId as SegmentId;
    const patients = getPatientsBySegment(segmentId);
    return NextResponse.json({ segmentId, patients });
}
