import { appointmentStore, messageStore, patientStore, practiceStore } from "@/lib/db/store";
import { processMessageQueue } from "@/lib/messaging/cadenceEngine";

export const syncReminders = async (simulationHoursForward: number = 0) => {
    const allAppointments = appointmentStore.getAll();
    const now = Date.now() + (simulationHoursForward * 60 * 60 * 1000);

    // Read configurable timing from practice settings
    const { reminderTouch1Hours: t1, reminderTouch2Hours: t2, reminderTouch3Hours: t3 } = practiceStore.get();

    let itemsProcessed = 0;

    for (const appt of allAppointments) {
        // Skip non-scheduled, already confirmed, or cancelled/rescheduled
        if (appt.status !== "scheduled") continue;
        if (appt.confirmationStatus === "confirmed") continue;

        const apptTime = new Date(appt.date).getTime();

        // Skip if appointment is already in the past
        if (apptTime <= now) continue;

        // Skip patients with no phone number (FR: missing phone → exclude from workflow)
        const patient = patientStore.getById(appt.patientId);
        if (!patient?.phone) continue;

        const hoursUntil = (apptTime - now) / (1000 * 60 * 60);

        // Touch 1: configurable hours out (default 48h) — awareness reminder
        if (hoursUntil <= t1 && hoursUntil > t2 && (appt.reminderStep || 0) < 1) {
            queueReminder(appt.id, appt.patientId, 1, appt.date);
            appt.reminderStep = 1;
            appt.confirmationStatus = "unconfirmed";
            appointmentStore.upsert([appt]);
            itemsProcessed++;
        }

        // Touch 2: configurable hours out (default 24h) — confirmation request
        else if (hoursUntil <= t2 && hoursUntil > t3 && (appt.reminderStep || 0) < 2) {
            queueReminder(appt.id, appt.patientId, 2, appt.date);
            appt.reminderStep = 2;
            appointmentStore.upsert([appt]);
            itemsProcessed++;
        }

        // Touch 3: configurable hours out (default 4h) — final commitment reinforcement
        else if (hoursUntil <= t3 && hoursUntil > 0 && (appt.reminderStep || 0) < 3) {
            queueReminder(appt.id, appt.patientId, 3, appt.date);
            appt.reminderStep = 3;
            appointmentStore.upsert([appt]);
            itemsProcessed++;
        }
    }

    if (itemsProcessed > 0) {
        processMessageQueue().catch(console.error);
    }

    return itemsProcessed;
};

const queueReminder = (appointmentId: string, patientId: string, step: number, dateStr: string) => {
    const patient = patientStore.getById(patientId);
    if (!patient) return;

    const dateObj = new Date(dateStr);
    const timeString = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const dateString = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    let content = "";
    if (step === 1) {
        content = `Hi {{first_name}}, this is a friendly reminder from {{practice_name}} about your upcoming dental appointment on ${dateString} at ${timeString}. Reply YES to confirm.`;
    } else if (step === 2) {
        content = `Hi {{first_name}}, your dental appointment at {{practice_name}} is TOMORROW at ${timeString}. Please reply YES to confirm, or call us if you need to reschedule.`;
    } else if (step === 3) {
        content = `Hi {{first_name}}, just a final reminder — your dental appointment is TODAY at ${timeString}. We look forward to seeing you! Reply YES to confirm.`;
    }

    messageStore.upsert({
        id: `msg_rem_${appointmentId}_s${step}`,
        patientId: patientId,
        campaignId: "system_reminder",
        content: content,
        status: "scheduled",
        direction: "outbound",
        scheduledFor: new Date().toISOString(),
        sentAt: null,
        twilioSid: null,
        error: null,
    });
};
