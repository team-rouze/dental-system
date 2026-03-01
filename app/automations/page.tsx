"use client";

import { useState, useEffect } from "react";
import type { CampaignTemplate, SegmentId } from "@/types";
import Link from "next/link";

export default function AutomationsDashboard() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [simulationDays, setSimulationDays] = useState(0);

    const fetchCampaigns = async () => {
        setLoading(true);
        const res = await fetch("/api/automations");
        const data = await res.json();
        setCampaigns(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "paused" : "active";
        await fetch("/api/automations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus })
        });
        fetchCampaigns();
    };

    const forceTick = async () => {
        await fetch("/api/automations/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ simulationDaysForward: simulationDays })
        });
        fetchCampaigns();
    };

    const getSegmentName = (id: SegmentId) => {
        const map: Record<string, string> = {
            overdue_hygiene: "Overdue Hygiene",
            unscheduled_treatment: "Unscheduled Treatment",
            inactive_patient: "Inactive Reactivation"
        };
        return map[id] || id;
    };

    if (loading && campaigns.length === 0) {
        return <div className="page-content text-center py-20">Loading automations...</div>;
    }

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Automations Dashboard</div>
                    <div className="topbar-breadcrumb">Campaign Control Center</div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>

                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: 8, padding: "4px 8px", background: "var(--bg-card)" }}>
                        <span className="text-sm text-muted mr-2">Simulate</span>
                        <input
                            type="number"
                            value={simulationDays}
                            onChange={e => setSimulationDays(parseInt(e.target.value) || 0)}
                            style={{ width: 50, background: "transparent", border: "none", color: "var(--text)", outline: "none", textAlign: "center" }}
                        />
                        <span className="text-sm text-muted ml-1">Days Forward</span>
                    </div>

                    <button className="btn btn-primary" onClick={forceTick}>
                        🔄 Force Tick
                    </button>
                </div>
            </div>

            <div className="page-content">
                <div className="mb-6 alert alert-info">
                    The Automation Engine continuously monitors segments and enrolls eligible patients. Use the "Force Tick" button above to manually fast-forward the simulation and trigger scheduled messages.
                </div>

                <div className="grid grid-cols-1" style={{ gap: 24, maxWidth: 900 }}>
                    {campaigns.map(camp => (
                        <div key={camp.id} className="card" style={{ display: "flex", gap: 32, opacity: camp.status === "paused" ? 0.7 : 1 }}>

                            {/* Info Column */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <div>
                                        <h2 style={{ fontSize: 18, marginBottom: 4 }}>{camp.name}</h2>
                                        <span className="badge" style={{ background: "var(--bg-body)" }}>Targets: {getSegmentName(camp.targetSegment)}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <span className={`badge ${camp.status === "active" ? "badge-success" : "badge-warning"}`}>
                                            {camp.status.toUpperCase()}
                                        </span>
                                        <button
                                            className={`btn ${camp.status === 'active' ? 'btn-outline' : 'btn-primary'}`}
                                            onClick={() => toggleStatus(camp.id, camp.status)}
                                        >
                                            {camp.status === "active" ? "Pause" : "Activate"}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-sm text-muted mb-4">
                                    <strong>Cadence Steps:</strong>
                                    <ul style={{ paddingLeft: 16, marginTop: 8 }}>
                                        {camp.steps.map((s: any, idx: number) => (
                                            <li key={idx} style={{ marginBottom: 4 }}>
                                                <span className="font-semibold">Day {s.dayOffset}:</span> "{s.content.substring(0, 50)}..."
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Stats Column */}
                            <div style={{ width: 280, borderLeft: "1px solid var(--border)", paddingLeft: 32, display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
                                <div>
                                    <div className="text-sm text-muted">Total Enrolled</div>
                                    <div style={{ fontSize: 24, fontWeight: 700 }}>{camp.stats?.totalTargeted || 0}</div>
                                </div>

                                <div className="grid grid-cols-2" style={{ gap: 12 }}>
                                    <div>
                                        <div className="text-sm text-muted">In Progress</div>
                                        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>{camp.stats?.inProgress || 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted">Completed</div>
                                        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--success)" }}>{camp.stats?.completed || 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted">Paused (Replied)</div>
                                        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--warning)" }}>{camp.stats?.pausedReply || 0}</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
