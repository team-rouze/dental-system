import { appointmentStore, enrollmentStore, campaignStore, patientStore } from "@/lib/db/store";
import { canContact } from "@/lib/compliance/consentEngine";
import { processCampaignSteps } from "@/lib/automations/automationEngine";

const RESCHEDULE_CAMPAIGN_ID = "camp_reschedule_001";
const RECOVERY_WINDOW_DAYS = 7; // Only attempt recovery within 7 days of cancellation

export type RecoveryStatus = "no_outreach" | "outreach_active" | "replied" | "sequence_complete";

export interface RescheduleRow {
    appointmentId: string;
    patientId: string;
    patientName: string;
    cancelledDate: string;
    type: string;
    provider: string;
    daysSince: number;
    recoveryStatus: RecoveryStatus;
    outreachStep: number; // how many messages sent so far
}

// Scans for recently cancelled appointments and auto-enrolls eligible patients
// into the Reschedule Recovery campaign. Returns counts.
export const syncRescheduleRecovery = () => {
    const campaign = campaignStore.getById(RESCHEDULE_CAMPAIGN_ID);
    if (!campaign || campaign.status !== "active") {
        return { enrolled: 0, skipped: 0, reason: "Campaign is not active" };
    }

    const now = new Date();
    const cancelledAppts = appointmentStore.getAll().filter(a => {
        if (a.status !== "cancelled" && a.status !== "no_show") return false;
        const daysSince = (now.getTime() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince >= 0 && daysSince <= RECOVERY_WINDOW_DAYS;
    });

    const existingEnrollments = enrollmentStore.getByCampaign(RESCHEDULE_CAMPAIGN_ID);
    const enrolledPatientIds = new Set(existingEnrollments.map(e => e.patientId));

    let enrolled = 0;
    let skipped = 0;

    for (const appt of cancelledAppts) {
        // Skip if this patient is already in the recovery sequence
        if (enrolledPatientIds.has(appt.patientId)) { skipped++; continue; }

        // Skip if consent gatekeeper blocks outreach
        if (!canContact(appt.patientId, "sms")) { skipped++; continue; }

        enrollmentStore.upsert({
            id: `enr_rr_${appt.id}`,
            campaignId: RESCHEDULE_CAMPAIGN_ID,
            patientId: appt.patientId,
            status: "in_progress",
            currentStep: 0,
            enrolledAt: new Date().toISOString(),
            lastMessageSentAt: null,
        });

        enrolledPatientIds.add(appt.patientId);
        enrolled++;
    }

    // Immediately process campaign steps so Touch 1 fires without waiting for manual tick
    if (enrolled > 0) {
        processCampaignSteps(0);
    }

    return { enrolled, skipped, reason: null };
};

// Returns enriched stats for the UI — all cancelled appointments and their recovery state
export const getRescheduleStats = () => {
    const now = new Date();

    const cancelledAppts = appointmentStore.getAll().filter(a =>
        a.status === "cancelled" || a.status === "no_show"
    );

    const enrollments = enrollmentStore.getByCampaign(RESCHEDULE_CAMPAIGN_ID);

    const rows: RescheduleRow[] = cancelledAppts.map(appt => {
        const patient = patientStore.getById(appt.patientId);
        const enrollment = enrollments.find(e => e.patientId === appt.patientId);
        const daysSince = Math.max(0, Math.floor(
            (now.getTime() - new Date(appt.date).getTime()) / (1000 * 60 * 60 * 24)
        ));

        let recoveryStatus: RecoveryStatus = "no_outreach";
        if (enrollment) {
            if (enrollment.status === "paused_reply") recoveryStatus = "replied";
            else if (enrollment.status === "completed") recoveryStatus = "sequence_complete";
            else recoveryStatus = "outreach_active";
        }

        return {
            appointmentId: appt.id,
            patientId: appt.patientId,
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
            cancelledDate: appt.date,
            type: appt.type,
            provider: appt.provider,
            daysSince,
            recoveryStatus,
            outreachStep: enrollment?.currentStep ?? 0,
        };
    }).sort((a, b) => a.daysSince - b.daysSince); // Most recent cancellations first

    const stats = {
        totalCancelled: rows.length,
        outreachActive: rows.filter(r => r.recoveryStatus === "outreach_active").length,
        replied: rows.filter(r => r.recoveryStatus === "replied").length,
        sequenceComplete: rows.filter(r => r.recoveryStatus === "sequence_complete").length,
        noOutreach: rows.filter(r => r.recoveryStatus === "no_outreach").length,
    };

    const campaign = campaignStore.getById(RESCHEDULE_CAMPAIGN_ID);

    return { rows, stats, campaignActive: campaign?.status === "active" };
};
