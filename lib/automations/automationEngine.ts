import { campaignStore, enrollmentStore } from "@/lib/db/store";
import { getPatientsBySegment } from "@/lib/segmentation/segmentationEngine";
import type { CampaignMessage } from "@/types";

// Helper to determine if a step is due
const isStepDue = (enrolledAtStr: string, lastMsgAtStr: string | null, dayOffset: number, simulationDaysForward: number = 0): boolean => {
    const baseTime = new Date(enrolledAtStr).getTime();
    const targetTime = baseTime + (dayOffset * 24 * 60 * 60 * 1000);

    // Apply our simulation offset (if requested via dashboard trigger)
    const simulatedNow = Date.now() + (simulationDaysForward * 24 * 60 * 60 * 1000);

    // If we've passed the target time, it's due
    if (simulatedNow >= targetTime) {
        // Ensure we don't double-fire if it was ALREADY sent today
        if (lastMsgAtStr) {
            const lastMsgTime = new Date(lastMsgAtStr).getTime();
            // Only fire if the target time is *after* the last message time (with a tiny buffer to avoid precision bugs)
            if (targetTime <= lastMsgTime + 1000) {
                return false;
            }
        }
        return true;
    }
    return false;
};

export const syncAutomations = (simulationDaysForward: number = 0) => {
    const activeCampaigns = campaignStore.getAll().filter(c => c.status === "active");

    for (const campaign of activeCampaigns) {
        // 1. Find all patients who match the campaign's target segment
        const eligiblePatients = getPatientsBySegment(campaign.targetSegment);

        // 2. Fetch existing enrollments for this campaign
        const existingEnrollments = enrollmentStore.getByCampaign(campaign.id);
        const enrolledPatientIds = new Set(existingEnrollments.map(e => e.patientId));

        // 3. Enroll missing patients
        for (const p of eligiblePatients) {
            if (!enrolledPatientIds.has(p.patient.id)) {
                enrollmentStore.upsert({
                    id: `enr_${Math.random().toString(36).substring(2, 9)}`,
                    campaignId: campaign.id,
                    patientId: p.patient.id,
                    status: "in_progress",
                    currentStep: 0,
                    enrolledAt: new Date().toISOString(),
                    lastMessageSentAt: null
                });
            }
        }
    }

    // 4. Process all active cadence steps
    processCampaignSteps(simulationDaysForward);
};

export const processCampaignSteps = (simulationDaysForward: number = 0) => {
    const activeEnrollments = enrollmentStore.getInProgress();

    for (const enrollment of activeEnrollments) {
        const campaign = campaignStore.getById(enrollment.campaignId);

        // Safety check: is campaign still active?
        if (!campaign || campaign.status !== "active") continue;

        // Check if there are more steps
        if (enrollment.currentStep >= campaign.steps.length) {
            enrollment.status = "completed";
            enrollmentStore.upsert(enrollment);
            continue;
        }

        const currentStepDef = campaign.steps[enrollment.currentStep];

        // Check if the time offset has elapsed
        if (isStepDue(enrollment.enrolledAt, enrollment.lastMessageSentAt, currentStepDef.dayOffset, simulationDaysForward)) {

            // Dispatch via API to the Messaging Engine (or direct store insert)
            // For simplicity in a local backend call, we can directly trigger the `/api/messaging/send` via fetch, 
            // or insert into the messageStore directly. Directly to store is safer server-side.

            const { messageStore } = require("@/lib/db/store");
            const { processMessageQueue } = require("@/lib/messaging/cadenceEngine");

            messageStore.upsert({
                id: `msg_out_${Math.random().toString(36).substring(2, 10)}`,
                patientId: enrollment.patientId,
                campaignId: campaign.id,
                content: currentStepDef.content,
                status: "scheduled",
                direction: "outbound",
                scheduledFor: new Date().toISOString(), // Immediate (simulated) dispatch
                sentAt: null,
                twilioSid: null,
                error: null,
            });

            // Update enrollment state
            enrollment.lastMessageSentAt = new Date().toISOString();
            enrollment.currentStep += 1;

            if (enrollment.currentStep >= campaign.steps.length) {
                enrollment.status = "completed";
            }

            enrollmentStore.upsert(enrollment);

            // Async trigger the outbox queue processor
            processMessageQueue().catch(console.error);
        }
    }
};
