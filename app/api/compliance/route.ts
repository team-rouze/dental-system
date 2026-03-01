import { NextResponse } from "next/server";
import { patientStore } from "@/lib/db/store";
import { getConsentSummary, getSuppressionList } from "@/lib/compliance/consentEngine";
import { auditLogStore } from "@/lib/db/store";

export async function GET() {
    const consentSummary = getConsentSummary();
    const suppressed = getSuppressionList();
    const auditCount = auditLogStore.count();
    const totalPatients = patientStore.count();

    return NextResponse.json({
        totalPatients,
        consentSummary,
        suppressedCount: suppressed.length,
        auditEventCount: auditCount,
    });
}
