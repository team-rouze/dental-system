import { segmentStore } from "@/lib/db/store";
import { HYGIENE_VISIT_VALUE, INACTIVE_ESTIMATED_VALUE } from "@/lib/segmentation/segmentationEngine";
import type { RevenueAuditSummary, RevenueAuditResult, SegmentId } from "@/types";

const REACTIVATION_RATE = 0.15; // 15% estimated reactivation success rate

export const generateAuditReport = (): RevenueAuditSummary => {
    const allSegments = segmentStore.getAll();
    const lastEntry = allSegments[0];
    const lastCalculatedAt = lastEntry ? lastEntry.calculatedAt : null;

    // Helper to get total revenue and patient count for specific segments
    const calcForSegments = (segments: SegmentId[]) => {
        const matched = allSegments.filter(s => s.segments.some(seg => segments.includes(seg)));
        const revenue = matched.reduce((sum, s) => sum + s.revenueOpportunity, 0);
        return { count: matched.length, revenue };
    };

    // 1. Hygiene Recovery
    const hygiene = calcForSegments(["overdue_hygiene"]);
    // The segmentation engine calculates hygiene opportunity as count * HYGIENE_VISIT_VALUE.
    // We can just use the count * value directly for clarity in the audit, or rely on the engine's sum.
    // We'll rely on the count * value to perfectly match the logic.
    const hygieneRevenue = hygiene.count * HYGIENE_VISIT_VALUE;

    const hygieneResult: RevenueAuditResult = {
        category: "hygiene",
        patientCount: hygiene.count,
        estimatedRevenue: hygieneRevenue,
        confidenceScore: "medium", // industry average, not specific treatment fee
    };

    // 2. Treatment Recovery
    // We must isolate the treatment revenue. The total revenue opportunity on a patient segment
    // includes hygiene/inactive values if they hold those segments too.
    // Easiest is to sum `estimatedFee` directly, or recalculate based on segments.
    // We filter patients with unscheduled/high_value treatment and sum *only* their treatment revenue.
    // Since `revenueOpportunity` is an aggregate, let's recalculate treatment specifically.
    // To avoid circular logic and re-fetching raw treatments, we know:
    // Treatment Rev = Total Rev - (Hygiene Rev if applicable) - (Inactive Rev if applicable)
    let treatmentRevenue = 0;
    let treatmentCount = 0;

    allSegments.forEach(s => {
        const hasTreatment = s.segments.includes("unscheduled_treatment") || s.segments.includes("high_value_treatment");
        if (hasTreatment) {
            treatmentCount++;
            let txValue = s.revenueOpportunity;
            if (s.segments.includes("overdue_hygiene")) txValue -= HYGIENE_VISIT_VALUE;
            if (s.segments.includes("inactive_patient")) txValue -= INACTIVE_ESTIMATED_VALUE;
            treatmentRevenue += Math.max(0, txValue);
        }
    });

    const treatmentResult: RevenueAuditResult = {
        category: "treatment",
        patientCount: treatmentCount,
        estimatedRevenue: treatmentRevenue,
        confidenceScore: "high", // exact values from PMS treatment plans
    };

    // 3. Inactive Reactivation
    const inactive = calcForSegments(["inactive_patient"]);
    // Audit logic: count * estimated LTV * expected reactivation rate
    const inactiveRevenue = Math.round(inactive.count * INACTIVE_ESTIMATED_VALUE * REACTIVATION_RATE);

    const reactivationResult: RevenueAuditResult = {
        category: "reactivation",
        patientCount: inactive.count,
        estimatedRevenue: inactiveRevenue,
        confidenceScore: "low", // probabilistic estimation
    };

    const totalRecoverableRevenue = hygieneRevenue + treatmentRevenue + inactiveRevenue;

    return {
        totalRecoverableRevenue,
        results: [hygieneResult, treatmentResult, reactivationResult],
        lastCalculatedAt,
    };
};
