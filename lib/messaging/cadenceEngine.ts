import { messageStore, patientStore, practiceStore } from "@/lib/db/store";
import { canContact } from "@/lib/compliance/consentEngine";
import { sendSms } from "@/lib/messaging/twilioAdapter";
import type { CampaignMessage, Patient } from "@/types";

// Helper to replace all supported tokens in messages
const personalizeMessage = (content: string, patient: Patient): string => {
    const settings = practiceStore.get();
    let personalized = content;
    personalized = personalized.replace(/{{first_name}}/g, patient.firstName);
    personalized = personalized.replace(/{{last_name}}/g, patient.lastName);
    personalized = personalized.replace(/{{practice_name}}/g, settings.practiceName);
    if (settings.messageFooter) {
        personalized = `${personalized}\n${settings.messageFooter}`;
    }
    return personalized;
};

// Process the outbox queue
export const processMessageQueue = async () => {
    const pending = messageStore.getPending();

    for (const msg of pending) {
        // 1. Validate Consent Gatekeeper
        const patient = patientStore.getById(msg.patientId);
        if (!patient) {
            markFailed(msg, "Patient not found");
            continue;
        }

        if (!canContact(patient.id, "sms")) {
            markFailed(msg, "Consent blocked by gatekeeper");
            // Audit logging is automatically handled inside canContact!
            continue;
        }

        // 2. Personalize
        const body = personalizeMessage(msg.content, patient);

        // 3. Mark as Sending (prevent dupe processing)
        msg.status = "sent";
        messageStore.upsert(msg);

        // 4. Dispatch via Twilio
        // For test patients without valid numbers, we depend on Sandbox Mode to simulate success
        const toPhone = patient.phone || "+15550000000";

        const result = await sendSms(toPhone, body);

        if (result.success) {
            msg.sentAt = new Date().toISOString();
            msg.twilioSid = result.twilioSid ?? null;
            messageStore.upsert(msg);
            // canContact already logs the send, but we can leave this block clean
        } else {
            markFailed(msg, result.error || "Twilio delivery error");
        }
    }
};

const markFailed = (msg: CampaignMessage, reason: string) => {
    msg.status = "failed";
    msg.error = reason;
    messageStore.upsert(msg);
};

// Handles a Twilio status callback (queued, failed, sent, delivered, undelivered)
export const handleDeliveryWebhook = (twilioSid: string, status: string) => {
    const msg = messageStore.getByTwilioSid(twilioSid);
    if (!msg) return;

    if (status === "delivered") {
        msg.status = "delivered";
    } else if (status === "failed" || status === "undelivered") {
        msg.status = "failed";
        msg.error = "Delivery failed upstream";
    }

    messageStore.upsert(msg);
};

const CONFIRMATION_KEYWORDS = ["YES", "CONFIRM", "Y"];

// Handles inbound SMS replies
export const handleInboundReply = (fromNumber: string, body: string) => {
    const allPatients = patientStore.getAll();
    const patient = allPatients.find(p => p.phone === fromNumber);
    if (!patient) return;

    // Store the inbound message record
    const inboundMsg: CampaignMessage = {
        id: `msg_in_${Date.now()}`,
        patientId: patient.id,
        campaignId: null,
        content: body,
        status: "replied",
        direction: "inbound",
        scheduledFor: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        twilioSid: null,
        error: null,
    };
    messageStore.upsert(inboundMsg);

    const normalized = body.trim().toUpperCase();
    const isConfirmation = CONFIRMATION_KEYWORDS.includes(normalized);

    if (isConfirmation) {
        // Mark the patient's next upcoming unconfirmed appointment as confirmed
        const { appointmentStore } = require("@/lib/db/store");
        const upcoming = appointmentStore
            .getByPatientId(patient.id)
            .filter((a: any) => a.status === "scheduled" && a.confirmationStatus !== "confirmed")
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (upcoming.length > 0) {
            const appt = upcoming[0];
            appt.confirmationStatus = "confirmed";
            appointmentStore.upsert([appt]);
        }

        // Cancel all pending reminder messages for this patient
        const patientMessages = messageStore.getByPatient(patient.id);
        patientMessages.forEach(msg => {
            if (msg.status === "scheduled" && msg.campaignId === "system_reminder") {
                msg.status = "paused";
                messageStore.upsert(msg);
            }
        });
    } else {
        // Non-confirmation reply: pause marketing campaign messages and enrollments
        // so staff can handle the conversation — but don't touch reminder messages
        const patientMessages = messageStore.getByPatient(patient.id);
        patientMessages.forEach(msg => {
            if (msg.status === "scheduled" && msg.campaignId !== "system_reminder") {
                msg.status = "paused";
                messageStore.upsert(msg);
            }
        });

        const { enrollmentStore } = require("@/lib/db/store");
        const activeEnrollments = enrollmentStore
            .getByPatient(patient.id)
            .filter((e: any) => e.status === "enrolled" || e.status === "in_progress");
        activeEnrollments.forEach((e: any) => {
            e.status = "paused_reply";
            enrollmentStore.upsert(e);
        });
    }
};
