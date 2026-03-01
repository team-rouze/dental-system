import type { AuditLogEntry, ContactChannel, ConsentState, AuditEventType } from "@/types";
import { auditLogStore } from "@/lib/db/store";

const genId = () => Math.random().toString(36).slice(2, 10);

const createEntry = (
    patientId: string,
    patientName: string,
    eventType: AuditEventType,
    extras: Partial<AuditLogEntry> = {}
): AuditLogEntry => ({
    id: genId(),
    patientId,
    patientName,
    eventType,
    actor: "system",
    timestamp: new Date().toISOString(),
    ...extras,
});

export const logConsentChange = (
    patientId: string,
    patientName: string,
    channel: ContactChannel,
    oldState: ConsentState,
    newState: ConsentState,
    actor: string
): void => {
    auditLogStore.add(
        createEntry(patientId, patientName, "consent_changed", {
            channel,
            oldState,
            newState,
            actor,
        })
    );
};

export const logMessageBlocked = (
    patientId: string,
    patientName: string,
    channel: ContactChannel,
    reason: string,
    actor = "system"
): void => {
    auditLogStore.add(
        createEntry(patientId, patientName, "message_blocked", { channel, reason, actor })
    );
};

export const logMessageAllowed = (
    patientId: string,
    patientName: string,
    channel: ContactChannel,
    actor = "system"
): void => {
    auditLogStore.add(
        createEntry(patientId, patientName, "message_allowed", { channel, actor })
    );
};
