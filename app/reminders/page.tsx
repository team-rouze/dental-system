"use client";

import { useState, useEffect } from "react";

type AppointmentRow = {
    id: string;
    patientName: string;
    hasPhone: boolean;
    date: string;
    type: string;
    provider: string;
    confirmationStatus: "confirmed" | "unconfirmed" | "cancelled" | "rescheduled";
    reminderStep: number;
    hoursUntil: number;
};

type Stats = {
    totalUpcoming: number;
    confirmed: number;
    pendingConfirmation: number;
    noWorkflowStarted: number;
    noPhone: number;
};

const TOUCH_LABELS = ["48h", "24h", "3-4h"];

function ReminderTimeline({ step }: { step: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {TOUCH_LABELS.map((label, idx) => {
                const touchNum = idx + 1;
                const done = step >= touchNum;
                return (
                    <div key={idx} style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                border: `2px solid ${done ? "var(--accent)" : "var(--border)"}`,
                                background: done ? "var(--accent)" : "var(--bg-body)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 700,
                                color: done ? "#fff" : "var(--text-muted)",
                            }}>
                                {done ? "✓" : touchNum}
                            </div>
                            <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
                        </div>
                        {idx < TOUCH_LABELS.length - 1 && (
                            <div style={{
                                width: 28,
                                height: 2,
                                background: step > touchNum ? "var(--accent)" : "var(--border)",
                                marginBottom: 14,
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function ConfirmationBadge({ status }: { status: string }) {
    if (status === "confirmed") return <span className="badge badge-success">✓ Confirmed</span>;
    if (status === "cancelled") return <span className="badge badge-error">Cancelled</span>;
    if (status === "rescheduled") return <span className="badge badge-warning">Rescheduled</span>;
    return <span className="badge badge-warning">Pending</span>;
}

function formatApptDate(dateStr: string, hoursUntil: number) {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    let urgency = "";
    if (hoursUntil <= 0) urgency = " · Past";
    else if (hoursUntil <= 4) urgency = ` · in ${Math.round(hoursUntil)}h`;
    else if (hoursUntil <= 24) urgency = " · Tomorrow";

    return { date, time, urgency };
}

export default function RemindersPage() {
    const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [simHours, setSimHours] = useState(0);
    const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "no_phone">("all");

    const fetchData = async () => {
        setLoading(true);
        const res = await fetch("/api/reminders");
        const data = await res.json();
        setAppointments(data.appointments ?? []);
        setStats(data.stats ?? null);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSync = async () => {
        setSyncing(true);
        await fetch("/api/reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ simulationHoursForward: simHours }),
        });
        await fetchData();
        setSyncing(false);
    };

    const filtered = appointments.filter(a => {
        if (filter === "confirmed") return a.confirmationStatus === "confirmed";
        if (filter === "pending") return a.confirmationStatus === "unconfirmed";
        if (filter === "no_phone") return !a.hasPhone;
        return true;
    });

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Appointment Confirmations</div>
                    <div className="topbar-breadcrumb">3-Touch Confirmation Workflow · Module 5.7</div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 10px", background: "var(--bg-card)", gap: 6 }}>
                        <span className="text-sm text-muted">Simulate</span>
                        <input
                            type="number"
                            value={simHours}
                            onChange={e => setSimHours(parseInt(e.target.value) || 0)}
                            style={{ width: 44, background: "transparent", border: "none", color: "var(--text)", outline: "none", textAlign: "center" }}
                        />
                        <span className="text-sm text-muted">hrs forward</span>
                    </div>
                    <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
                        {syncing ? "Syncing..." : "⟳ Sync Reminders"}
                    </button>
                </div>
            </div>

            <div className="page-content">

                {/* Stats Row */}
                {stats && (
                    <div className="grid grid-cols-4 mb-6" style={{ gap: 16 }}>
                        <div className="card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalUpcoming}</div>
                            <div className="text-sm text-muted">Upcoming Appts</div>
                        </div>
                        <div className="card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>{stats.confirmed}</div>
                            <div className="text-sm text-muted">Confirmed</div>
                        </div>
                        <div className="card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--warning)" }}>{stats.pendingConfirmation}</div>
                            <div className="text-sm text-muted">Awaiting Confirmation</div>
                        </div>
                        <div className="card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--error)" }}>{stats.noPhone}</div>
                            <div className="text-sm text-muted">No Phone (excluded)</div>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {(["all", "confirmed", "pending", "no_phone"] as const).map(f => (
                        <button
                            key={f}
                            className={`btn ${filter === f ? "btn-primary" : "btn-outline"}`}
                            style={{ fontSize: 13 }}
                            onClick={() => setFilter(f)}
                        >
                            {f === "all" ? "All" : f === "confirmed" ? "✓ Confirmed" : f === "pending" ? "Pending" : "No Phone"}
                        </button>
                    ))}
                </div>

                {/* Appointment Table */}
                {loading ? (
                    <div className="text-center py-20 text-muted">Loading appointments...</div>
                ) : filtered.length === 0 ? (
                    <div className="card text-center py-12">
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                        <div className="text-muted">No appointments found.</div>
                        <div className="text-sm text-muted mt-2">Import patient data from PMS to populate appointments.</div>
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-body)" }}>
                                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Patient</th>
                                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Appointment</th>
                                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reminder Progress</th>
                                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((appt, idx) => {
                                    const { date, time, urgency } = formatApptDate(appt.date, appt.hoursUntil);
                                    return (
                                        <tr key={appt.id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ fontWeight: 600 }}>{appt.patientName}</div>
                                                {!appt.hasPhone && (
                                                    <div style={{ fontSize: 11, color: "var(--error)", marginTop: 2 }}>No phone · excluded from workflow</div>
                                                )}
                                            </td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ fontWeight: 500 }}>{date} · {time}</div>
                                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                                                    {appt.type} · {appt.provider}
                                                    {urgency && <span style={{ color: appt.hoursUntil <= 4 ? "var(--warning)" : "var(--text-muted)" }}>{urgency}</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: "14px 16px" }}>
                                                {appt.hasPhone
                                                    ? <ReminderTimeline step={appt.reminderStep} />
                                                    : <span className="text-sm text-muted">—</span>
                                                }
                                            </td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <ConfirmationBadge status={appt.confirmationStatus} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="text-sm text-muted mt-4">
                    Reminders are sent automatically at 48h, 24h, and 3–4h before each appointment. Workflow stops immediately when patient replies YES or CONFIRM.
                </div>
            </div>
        </>
    );
}
