"use client";

import { useState, useEffect } from "react";
import type { SyncLog, PMSConnection } from "@/types";

interface DashboardData {
    connection: PMSConnection | null;
    recentLogs: SyncLog[];
    stats: { patients: number; appointments: number; treatmentPlans: number };
}

const phaseColors: Record<string, string> = {
    success: "badge-success",
    error: "badge-danger",
    partial_warning: "badge-warning",
    syncing: "badge-accent",
    normalizing: "badge-accent",
    importing: "badge-accent",
    connecting: "badge-accent",
    idle: "badge-muted",
};

const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState<string | null>(null);

    const load = async () => {
        const res = await fetch("/api/integration/connect");
        const json = await res.json();
        setData(json);
    };

    useEffect(() => { load(); }, []);

    const triggerSync = async () => {
        setSyncing(true);
        setSyncMsg(null);
        const res = await fetch("/api/integration/sync", { method: "POST" });
        const json = await res.json();
        setSyncMsg(json.success ? "✅ Incremental sync completed." : `❌ ${json.error ?? "Sync failed."}`);
        setSyncing(false);
        load();
    };

    const noData = !data?.connection;

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Sync Dashboard</div>
                    <div className="topbar-breadcrumb">Data Integration → Status</div>
                </div>
                <button id="trigger-sync-btn" className="btn btn-secondary btn-sm" onClick={triggerSync} disabled={syncing || noData}>
                    {syncing ? <><span className="spinner" /> Syncing…</> : "↻ Sync Now"}
                </button>
            </div>

            <div className="page-content">
                <div className="page-header">
                    <h1>Connection Status Dashboard</h1>
                    <p>Monitor your PMS data sync health and import history.</p>
                </div>

                {syncMsg && (
                    <div className={`alert ${syncMsg.startsWith("✅") ? "alert-success" : "alert-danger"}`}>
                        {syncMsg}
                    </div>
                )}

                {noData ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔌</div>
                        <h3>No PMS Connected</h3>
                        <p>Connect your Practice Management System to begin syncing patient data.</p>
                        <a href="/integration" className="btn btn-primary mt-4">Connect PMS</a>
                    </div>
                ) : (
                    <>
                        {/* Connection Card */}
                        <div className="card mb-6">
                            <div className="card-header">
                                <div>
                                    <div className="card-title">PMS Connection</div>
                                    <div className="card-subtitle">Provider: {data.connection!.provider}</div>
                                </div>
                                <span className={`badge ${phaseColors[data.connection!.status] ?? "badge-muted"}`}>
                                    {data.connection!.status}
                                </span>
                            </div>
                            <div className="grid-2">
                                <div>
                                    <div className="text-sm text-muted">Connected At</div>
                                    <div className="font-semibold mt-2">{formatDate(data.connection!.connectedAt)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted">Last Sync</div>
                                    <div className="font-semibold mt-2">{formatDate(data.connection!.lastSyncAt)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-label">Total Patients</div>
                                <div className="stat-value">{data.stats.patients}</div>
                                <div className="stat-sub">Synced from PMS</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Appointments</div>
                                <div className="stat-value">{data.stats.appointments}</div>
                                <div className="stat-sub">Historical records</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Treatment Plans</div>
                                <div className="stat-value">{data.stats.treatmentPlans}</div>
                                <div className="stat-sub">Unscheduled opportunities</div>
                            </div>
                        </div>

                        {/* Sync Logs */}
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Recent Sync History</div>
                            </div>
                            <div className="table-wrap">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Started</th>
                                            <th>Completed</th>
                                            <th>Status</th>
                                            <th>Patients</th>
                                            <th>Appointments</th>
                                            <th>Retries</th>
                                            <th>Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recentLogs.length === 0 && (
                                            <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)" }}>No logs yet</td></tr>
                                        )}
                                        {data.recentLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td>{formatDate(log.startedAt)}</td>
                                                <td>{formatDate(log.completedAt)}</td>
                                                <td><span className={`badge ${phaseColors[log.phase] ?? "badge-muted"}`}>{log.phase}</span></td>
                                                <td>{log.patientsImported}</td>
                                                <td>{log.appointmentsImported}</td>
                                                <td>{log.retryCount}</td>
                                                <td style={{ color: "var(--danger)", fontSize: 12 }}>{log.errorMessage ?? "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
