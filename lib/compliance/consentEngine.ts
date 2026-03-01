import type { ConsentState, ContactChannel, Patient, AuditLogEntry } from "@/types";
import { patientStore, consentRecordStore, auditLogStore } from "@/lib/db/store";
import { logConsentChange, logMessageBlocked, logMessageAllowed } from "@/lib/compliance/auditLogger";

// ─── Consent Gatekeeper ────────────────────────────────────────────────────────

/**
 * The primary outreach gate. Returns true ONLY if the patient has opted_in
 * for the given channel. All other states (unknown, restricted, opted_out, DNC)
 * result in a block — conservative default for HIPAA-conscious messaging.
 */
export const canContact = (patientId: string, channel: ContactChannel): boolean => {
    const record = consentRecordStore.get(patientId, channel);
    if (!record) return false; // no record = block

    const allowed = record.state === "opted_in";

    const patient = patientStore.getById(patientId);
    const name = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";

    if (allowed) {
        logMessageAllowed(patientId, name, channel);
    } else {
        logMessageBlocked(patientId, name, channel, `Consent state: ${record.state}`);
    }

    return allowed;
};

/**
 * Returns the current consent state without triggering an audit log.
 * Use for display purposes only.
 */
export const getPatientConsent = (patientId: string, channel: ContactChannel): ConsentState => {
    const record = consentRecordStore.get(patientId, channel);
    return record?.state ?? "unknown";
};

/**
 * Updates consent state immediately. Triggers an audit log entry.
 */
export const updateConsent = (
    patientId: string,
    channel: ContactChannel,
    newState: ConsentState,
    actor: string
): void => {
    const existing = consentRecordStore.get(patientId, channel);
    const oldState = existing?.state ?? "unknown";

    consentRecordStore.upsert({
        patientId,
        channel,
        state: newState,
        updatedAt: new Date().toISOString(),
        updatedBy: actor,
    });

    // Also keep patient model in sync
    const patient = patientStore.getById(patientId);
    if (patient) {
        if (channel === "sms") patient.consentSms = newState;
        if (channel === "email") patient.consentEmail = newState;
        patientStore.upsert([patient]);
    }

    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";
    logConsentChange(patientId, patientName, channel, oldState, newState, actor);
};

/**
 * Processes an incoming STOP reply — immediately opts the patient out of that channel.
 */
export const processOptOut = (patientId: string, channel: ContactChannel): void => {
    updateConsent(patientId, channel, "opted_out", "patient_reply");

    const patient = patientStore.getById(patientId);
    const name = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";

    const entry: AuditLogEntry = {
        id: Math.random().toString(36).slice(2, 10),
        patientId,
        patientName: name,
        eventType: "opt_out_received",
        channel,
        oldState: "opted_in",
        newState: "opted_out",
        reason: "Patient replied STOP",
        actor: "patient_reply",
        timestamp: new Date().toISOString(),
    };
    auditLogStore.add(entry);
};

/**
 * Parses inbound replies from Twilio to detect opt-out keywords.
 */
export const processOptOutFromReply = (fromPhone: string, body: string): void => {
    const text = body.trim().toLowerCase();
    const optOutKeywords = ["stop", "unsubscribe", "cancel", "quit", "end"];

    if (optOutKeywords.includes(text)) {
        const patient = patientStore.getAll().find(p => p.phone === fromPhone);
        if (patient) {
            processOptOut(patient.id, "sms");
        }
    }
};

/**
 * Seeds initial consent records from synced patient data.
 * Called after each PMS import. Does NOT overwrite existing records.
 */
export const initializeConsentForPatients = (patients: Patient[]): void => {
    patients.forEach((p) => {
        const channels: ContactChannel[] = ["sms", "email"];
        channels.forEach((ch) => {
            const existing = consentRecordStore.get(p.id, ch);
            if (!existing) {
                const state = ch === "sms" ? p.consentSms : p.consentEmail;
                consentRecordStore.upsert({
                    patientId: p.id,
                    channel: ch,
                    state,
                    updatedAt: new Date().toISOString(),
                    updatedBy: "pms_sync",
                });
            }
        });
    });
};

// ─── Aggregate Consent Metrics ─────────────────────────────────────────────────

export const getConsentSummary = () => {
    const all = consentRecordStore.getAll();
    const total = all.length;

    const counts: Record<ConsentState, number> = {
        opted_in: 0,
        opted_out: 0,
        unknown: 0,
        restricted: 0,
        do_not_contact: 0,
    };

    all.forEach((r) => { counts[r.state]++; });

    return { total, counts };
};

export const getSuppressionList = (): Patient[] => {
    const suppressedIds = consentRecordStore
        .getAll()
        .filter((r) => r.state === "opted_out" || r.state === "do_not_contact")
        .map((r) => r.patientId);
    const uniqueIds = [...new Set(suppressedIds)];
    return uniqueIds.map((id) => patientStore.getById(id)).filter(Boolean) as Patient[];
};
