import { NextResponse } from "next/server";
import { appointmentStore, patientStore } from "@/lib/db/store";
import { syncReminders } from "@/lib/reminders/reminderEngine";

export async function GET() {
    const allAppointments = appointmentStore.getAll();
    const now = Date.now();

    // Show upcoming appointments + up to 24h past (to show same-day completions)
    const relevant = allAppointments
        .filter(a => a.status === "scheduled" || a.status === "rescheduled")
        .filter(a => new Date(a.date).getTime() > now - 24 * 60 * 60 * 1000)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const enriched = relevant.map(appt => {
        const patient = patientStore.getById(appt.patientId);
        const hoursUntil = (new Date(appt.date).getTime() - now) / (1000 * 60 * 60);
        return {
            id: appt.id,
            patientId: appt.patientId,
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
            hasPhone: !!(patient?.phone),
            date: appt.date,
            type: appt.type,
            provider: appt.provider,
            status: appt.status,
            confirmationStatus: appt.confirmationStatus ?? "unconfirmed",
            reminderStep: appt.reminderStep ?? 0,
            hoursUntil: Math.round(hoursUntil),
        };
    });

    const stats = {
        totalUpcoming: enriched.length,
        confirmed: enriched.filter(a => a.confirmationStatus === "confirmed").length,
        pendingConfirmation: enriched.filter(a => a.confirmationStatus === "unconfirmed").length,
        noWorkflowStarted: enriched.filter(a => (a.reminderStep ?? 0) === 0).length,
        noPhone: enriched.filter(a => !a.hasPhone).length,
    };

    return NextResponse.json({ appointments: enriched, stats });
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const { simulationHoursForward = 0 } = body;
    const processed = await syncReminders(simulationHoursForward);
    return NextResponse.json({ processed });
}
