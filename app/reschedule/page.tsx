"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { RecoveryStatus, RescheduleRow } from "@/lib/automations/rescheduleEngine";

type Stats = {
    totalCancelled: number;
    outreachActive: number;
    replied: number;
    sequenceComplete: number;
    noOutreach: number;
};

type ApiResponse = {
    rows: RescheduleRow[];
    stats: Stats;
    campaignActive: boolean;
    syncResult?: { enrolled: number; skipped: number; reason: string | null };
};

const STATUS_CONFIG: Record<RecoveryStatus, { label: string; className: string }> = {
    no_outreach:      { label: "No Outreach",       className: "badge" },
    outreach_active:  { label: "Outreach Active",   className: "badge badge-warning" },
    replied:          { label: "Replied",            className: "badge badge-success" },
    sequence_complete:{ label: "Seq. Complete",      className: "badge" },
};

function RecoveryBadge({ status }: { status: RecoveryStatus }) {
    const cfg = STATUS_CONFIG[status];
    return <span className={cfg.className}>{cfg.label}</span>;
}

function OutreachSteps({ step, total = 3 }: { step: number; total?: number }) {
    return (
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: i < step ? "var(--accent)" : "var(--border)",
                    }}
                    title={`Touch ${i + 1}`}
                />
            ))}
            <span className="text-sm text-muted" style={{ marginLeft: 4 }}>{step}/{total}</span>
        </div>
    );
}

export default function ReschedulePage() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState<string | null>(null);
    const [filter, setFilter] = useState<RecoveryStatus | "all">("all");

    const fetchData = async () => {
        setLoading(true);
        const res = await fetch("/api/reschedule");
        setData(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSync = async () => {
        setSyncing(true);
        setSyncMsg(null);
        const res = await fetch("/api/reschedule", { method: "POST" });
        const result: ApiResponse = await res.json();
        setData(result);
        if (result.syncResult) {
            const { enrolled, skipped, reason } = result.syncResult;
            if (reason) setSyncMsg(reason);
            else setSyncMsg(`Enrolled ${enrolled} new patient(s) into recovery. ${skipped} skipped.`);
        }
        setSyncing(false);
    };

    const filtered = (data?.rows ?? []).filter(r =>
        filter === "all" ? true : r.recoveryStatus === filter
    );

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Reschedule Recovery</div>
                    <div className="topbar-breadcrumb">Module 5.8 · Cancelled Appointment Recovery</div>
                </div>
                <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
                    {syncing ? "Syncing..." : "⟳ Sync Recovery"}
                </button>
            </div>

            <div className="page-content">

                {/* Campaign inactive warning */}
                {data && !data.campaignActive && (
                    <div className="alert alert-warning mb-6" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>
                            The <strong>Reschedule Recovery</strong> campaign is currently <strong>paused</strong>. Activate it to begin automatic outreach.
                        </span>
                        <Link href="/automations" className="btn btn-primary" style={{ fontSize: 13 }}>
                            Go to Automations →
                        </Link>
                    </div>
                )}

                {/* Sync feedback */}
                {syncMsg && (
                    <div className="alert alert-info mb-4">{syncMsg}</div>
                )}

                {/* Stats Row */}
                {data?.stats && (
                    <div className="grid grid-cols-4 mb-6" style={{ gap: 16 }}>
                        <div className="card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 700 }}>{data.stats.totalCancelled}</div>
                            <div className="text-sm text-muted">Total Cancelled</div>
                        </div>
                        <div className="card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--warning)" }}>{data.stats.outreachActive}</div>
                            <div className="text-sm text-muted">Outreach Active</div>
                        </div>
                        <div className="card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>{data.stats.replied}</div>
                            <div className="text-sm text-muted">Replied (Potential Reschedule)</div>
                        </div>
                        <div className="card" style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--error)" }}>{data.stats.noOutreach}</div>
                            <div className="text-sm text-muted">No Outreach Yet</div>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {(["all", "no_outreach", "outreach_active", "replied", "sequence_complete"] as const).map(f => (
                        <button
                            key={f}
                            className={`btn ${filter === f ? "btn-primary" : "btn-outline"}`}
                            style={{ fontSize: 13 }}
                            onClick={() => setFilter(f)}
                        >
                            {f === "all" ? "All" : STATUS_CONFIG[f as RecoveryStatus]?.label ?? f}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-20 text-muted">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="card text-center py-12">
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                        <div className="text-muted">No cancelled appointments found.</div>
                        <div className="text-sm text-muted mt-2">
                            Import patient data and run a PMS sync to detect cancellations.
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-body)" }}>
                                    {["Patient", "Appointment", "Days Since", "Outreach", "Status"].map(h => (
                                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((row, idx) => {
                                    const d = new Date(row.cancelledDate);
                                    const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                                    return (
                                        <tr key={row.appointmentId} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                                            <td style={{ padding: "14px 16px", fontWeight: 600 }}>{row.patientName}</td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <div style={{ fontWeight: 500 }}>{row.type}</div>
                                                <div className="text-sm text-muted">{dateStr} · {row.provider}</div>
                                            </td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <span style={{
                                                    fontWeight: 600,
                                                    color: row.daysSince <= 2 ? "var(--error)" : row.daysSince <= 5 ? "var(--warning)" : "var(--text-muted)"
                                                }}>
                                                    {row.daysSince === 0 ? "Today" : `${row.daysSince}d ago`}
                                                </span>
                                            </td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <OutreachSteps step={row.outreachStep} />
                                            </td>
                                            <td style={{ padding: "14px 16px" }}>
                                                <RecoveryBadge status={row.recoveryStatus} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="text-sm text-muted mt-4">
                    Recovery outreach is sent on Day 0, Day 2, and Day 5 after cancellation. Workflow pauses automatically when the patient replies.
                </div>
            </div>
        </>
    );
}
