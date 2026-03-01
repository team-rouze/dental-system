import type {
    Patient,
    Appointment,
    TreatmentPlanItem,
    PatientSegment,
    SegmentId,
    SegmentSummary,
    SegmentCount,
    SegmentMeta,
} from "@/types";
import {
    patientStore,
    appointmentStore,
    treatmentPlanStore,
    segmentStore,
} from "@/lib/db/store";

// ─── Segment Metadata Catalogue ───────────────────────────────────────────────

export const SEGMENT_META: SegmentMeta[] = [
    // Revenue Recovery
    {
        id: "overdue_hygiene",
        label: "Overdue Hygiene",
        group: "revenue_recovery",
        icon: "🦷",
        description: "Patients past their hygiene recall date",
        priorityWeight: 80,
        color: "var(--danger)",
    },
    {
        id: "unscheduled_treatment",
        label: "Unscheduled Treatment",
        group: "revenue_recovery",
        icon: "📋",
        description: "Patients with approved treatment not yet booked",
        priorityWeight: 90,
        color: "var(--warning)",
    },
    {
        id: "inactive_patient",
        label: "Inactive Patients",
        group: "revenue_recovery",
        icon: "💤",
        description: "No visit in the last 18 months",
        priorityWeight: 70,
        color: "var(--purple)",
    },
    {
        id: "high_value_treatment",
        label: "High-Value Treatment",
        group: "revenue_recovery",
        icon: "💰",
        description: "Unscheduled treatment with fee over $800",
        priorityWeight: 100,
        color: "var(--accent)",
    },
    // Operational
    {
        id: "upcoming_appointment",
        label: "Upcoming Appointment",
        group: "operational",
        icon: "📅",
        description: "Scheduled appointment within the next 14 days",
        priorityWeight: 40,
        color: "var(--success)",
    },
    {
        id: "recently_cancelled",
        label: "Recently Cancelled",
        group: "operational",
        icon: "❌",
        description: "Cancelled appointment in the last 7 days",
        priorityWeight: 85,
        color: "var(--danger)",
    },
    // Exclusion
    {
        id: "do_not_contact",
        label: "Do Not Contact",
        group: "exclusion",
        icon: "🛑",
        description: "Globally suppressed — no outreach allowed",
        priorityWeight: 0,
        color: "var(--danger)",
    },
    {
        id: "missing_contact",
        label: "Missing Contact Info",
        group: "exclusion",
        icon: "📵",
        description: "No phone or email on file",
        priorityWeight: 0,
        color: "var(--text-secondary)",
    },
    {
        id: "consent_restricted",
        label: "Consent Restricted",
        group: "exclusion",
        icon: "⛔",
        description: "All communication channels are opted-out or restricted",
        priorityWeight: 0,
        color: "var(--warning)",
    },
];

const metaById = Object.fromEntries(SEGMENT_META.map((m) => [m.id, m])) as Record<SegmentId, SegmentMeta>;

// ─── Revenue Estimation ────────────────────────────────────────────────────────

export const HYGIENE_VISIT_VALUE = 180;     // average hygiene appointment revenue
export const INACTIVE_ESTIMATED_VALUE = 250; // conservative estimate for reactivated patient

const estimateRevenue = (patient: Patient, segments: SegmentId[], treatments: TreatmentPlanItem[]): number => {
    let total = 0;

    if (segments.includes("overdue_hygiene")) total += HYGIENE_VISIT_VALUE;
    if (segments.includes("inactive_patient")) total += INACTIVE_ESTIMATED_VALUE;

    const unscheduledFees = treatments
        .filter((t) => t.patientId === patient.id && (t.status === "recommended" || t.status === "accepted"))
        .reduce((sum, t) => sum + t.estimatedFee, 0);

    if (segments.includes("unscheduled_treatment") || segments.includes("high_value_treatment")) {
        total += unscheduledFees;
    }

    return Math.round(total);
};

// ─── Rule Evaluation ──────────────────────────────────────────────────────────

const daysBetween = (dateStr: string, now: Date): number => {
    const d = new Date(dateStr);
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
};

const daysFuture = (dateStr: string, now: Date): number => {
    const d = new Date(dateStr);
    return Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const evaluatePatient = (
    patient: Patient,
    appointments: Appointment[],
    treatments: TreatmentPlanItem[],
    now: Date
): SegmentId[] => {
    const segments: SegmentId[] = [];

    const patientApts = appointments.filter((a) => a.patientId === patient.id);
    const patientTreatments = treatments.filter((t) => t.patientId === patient.id);

    // ── Exclusion checks first ────────────────────────────────────────────────

    if (patient.consentSms === "do_not_contact" || patient.consentEmail === "do_not_contact") {
        segments.push("do_not_contact");
    }

    const noPhone = !patient.phone || patient.phone.trim() === "";
    const noEmail = !patient.email || patient.email.trim() === "";
    if (noPhone && noEmail) {
        segments.push("missing_contact");
    }

    const smsBlocked = ["opted_out", "restricted", "do_not_contact", "unknown"].includes(patient.consentSms);
    const emailBlocked = ["opted_out", "restricted", "do_not_contact", "unknown"].includes(patient.consentEmail);
    if (smsBlocked && emailBlocked && !segments.includes("do_not_contact")) {
        segments.push("consent_restricted");
    }

    // If any exclusion applies, skip revenue / operational rules
    const exclusions: SegmentId[] = ["do_not_contact", "missing_contact", "consent_restricted"];
    const hasExclusion = segments.some((s) => exclusions.includes(s));
    if (hasExclusion) return segments;

    // ── Revenue Recovery ──────────────────────────────────────────────────────

    if (patient.hygieneRecallStatus === "overdue") {
        segments.push("overdue_hygiene");
    }

    const unscheduledTx = patientTreatments.filter(
        (t) => t.status === "recommended" || t.status === "accepted"
    );
    if (unscheduledTx.length > 0) {
        segments.push("unscheduled_treatment");

        const highValueTx = unscheduledTx.filter((t) => t.estimatedFee >= 800);
        if (highValueTx.length > 0) {
            segments.push("high_value_treatment");
        }
    }

    const isInactive =
        patient.lastVisitDate === null ||
        daysBetween(patient.lastVisitDate, now) > 548; // 18 months ≈ 548 days

    if (isInactive && patient.isActive) {
        segments.push("inactive_patient");
    }

    // ── Operational ───────────────────────────────────────────────────────────

    const hasUpcoming = patientApts.some(
        (a) => a.status === "scheduled" && daysFuture(a.date, now) >= 0 && daysFuture(a.date, now) <= 14
    );
    if (hasUpcoming) segments.push("upcoming_appointment");

    const hasRecentCancel = patientApts.some(
        (a) => a.status === "cancelled" && daysBetween(a.date, now) <= 7 && daysBetween(a.date, now) >= 0
    );
    if (hasRecentCancel) segments.push("recently_cancelled");

    return segments;
};

// ─── Priority Score ────────────────────────────────────────────────────────────

const computePriorityScore = (segments: SegmentId[]): number => {
    if (segments.length === 0) return 0;
    const maxWeight = Math.max(...segments.map((s) => metaById[s]?.priorityWeight ?? 0));
    // Additional bonus for multi-segment patients
    const bonus = Math.min((segments.length - 1) * 5, 15);
    return Math.min(maxWeight + bonus, 100);
};

const getPrimarySegment = (segments: SegmentId[]): SegmentId | null => {
    if (segments.length === 0) return null;
    return segments.reduce((best, s) =>
        (metaById[s]?.priorityWeight ?? 0) > (metaById[best]?.priorityWeight ?? 0) ? s : best
    );
};

// ─── Main Engine ──────────────────────────────────────────────────────────────

export const runSegmentation = (): void => {
    const patients = patientStore.getAll();
    const appointments = appointmentStore.getAll();
    const treatments = treatmentPlanStore.getAll();
    const now = new Date();

    const exclusions: SegmentId[] = ["do_not_contact", "missing_contact", "consent_restricted"];

    patients.forEach((patient) => {
        const segments = evaluatePatient(patient, appointments, treatments, now);
        const primarySegment = getPrimarySegment(segments);
        const priorityScore = computePriorityScore(segments);
        const revenueOpportunity = estimateRevenue(patient, segments, treatments);
        const isOutreachEligible = !segments.some((s) => exclusions.includes(s));

        const result: PatientSegment = {
            patientId: patient.id,
            segments,
            primarySegment,
            priorityScore,
            revenueOpportunity,
            isOutreachEligible,
            calculatedAt: now.toISOString(),
        };

        segmentStore.upsert(result);
    });
};

// ─── Query Helpers ────────────────────────────────────────────────────────────

export const getSegmentsForPatient = (patientId: string): PatientSegment | undefined =>
    segmentStore.getByPatientId(patientId);

export const getPatientsBySegment = (segmentId: SegmentId): Array<PatientSegment & { patient: Patient }> => {
    const all = segmentStore.getAll();
    return all
        .filter((s) => s.segments.includes(segmentId))
        .map((s) => ({ ...s, patient: patientStore.getById(s.patientId)! }))
        .filter((s) => s.patient !== undefined)
        .sort((a, b) => b.priorityScore - a.priorityScore);
};

export const getSegmentSummary = (): SegmentSummary => {
    const all = segmentStore.getAll();
    const totalPatients = patientStore.count();
    const segmented = all.filter((s) => s.segments.length > 0).length;
    const excluded = all.filter((s) => !s.isOutreachEligible).length;
    const outreachEligible = all.filter((s) => s.isOutreachEligible).length;
    const totalRevenueOpportunity = all.reduce((sum, s) => sum + s.revenueOpportunity, 0);

    const counts: SegmentCount[] = SEGMENT_META.map((meta) => {
        const matching = all.filter((s) => s.segments.includes(meta.id));
        return {
            segmentId: meta.id,
            count: matching.length,
            totalRevenueOpportunity: matching.reduce((sum, s) => sum + s.revenueOpportunity, 0),
        };
    });

    const lastEntry = all[0];
    return {
        totalPatients,
        segmented,
        outreachEligible,
        excluded,
        totalRevenueOpportunity,
        counts,
        lastCalculatedAt: lastEntry?.calculatedAt ?? null,
    };
};
