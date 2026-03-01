"use client";

import { useState, useEffect } from "react";
import type { AuditLogEntry, AuditEventType } from "@/types";

const EVENT_CONFIG: Record<AuditEventType, { label: string; badge: string; icon: string }> = {
    consent_changed: { label: "Consent Changed", badge: "badge-accent", icon: "🔄" },
    message_allowed: { label: "Message Allowed", badge: "badge-success", icon: "✅" },
    message_blocked: { label: "Message Blocked", badge: "badge-danger", icon: "🚫" },
    opt_out_received: { label: "Opt-Out Received", badge: "badge-warning", icon: "⛔" },
    manual_override: { label: "Manual Override", badge: "badge-purple", icon: "⚙️" },
};

const formatTs = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

export default function AuditLogPage() {
    const [entries, setEntries] = useState<AuditLogEntry[]>([]);
    const [filter, setFilter] = useState<"all" | AuditEventType>("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/compliance/audit")
            .then((r) => r.json())
            .then((d) => setEntries(d.logs ?? []));
    }, []);

    const filtered = entries.filter((e) => {
        const matchType = filter === "all" || e.eventType === filter;
        const matchSearch = !search || e.patientName.toLowerCase().includes(search.toLowerCase()) || e.patientId.includes(search);
        return matchType && matchSearch;
    });

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Audit Log</div>
                    <div className="topbar-breadcrumb">Compliance → Audit Log</div>
                </div>
                <span className="badge badge-muted">{entries.length} events</span>
            </div>

            <div className="page-content">
                <div className="page-header">
                    <h1>Consent & Communication Audit Log</h1>
                    <p>Immutable record of all consent changes, outreach decisions, and opt-out events.</p>
                </div>

                <div className="flex gap-3 mb-4" style={{ flexWrap: "wrap" }}>
                    <input
                        id="audit-search"
                        type="text"
                        className="form-input"
                        placeholder="Search by patient name or ID…"
                        style={{ maxWidth: 280 }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="form-select"
                        style={{ width: "auto" }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as "all" | AuditEventType)}
                    >
                        <option value="all">All Events</option>
                        <option value="consent_changed">Consent Changed</option>
                        <option value="message_blocked">Message Blocked</option>
                        <option value="message_allowed">Message Allowed</option>
                        <option value="opt_out_received">Opt-Out Received</option>
                        <option value="manual_override">Manual Override</option>
                    </select>
                </div>

                {entries.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No Audit Events Yet</h3>
                        <p>Consent changes and messaging decisions will be logged here automatically once your PMS is connected.</p>
                        <a href="/integration" className="btn btn-primary mt-4">Connect PMS</a>
                    </div>
                ) : (
                    <div className="card">
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>Patient</th>
                                        <th>Event</th>
                                        <th>Channel</th>
                                        <th>Change</th>
                                        <th>Reason / Actor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 0" }}>No events match your filters.</td></tr>
                                    )}
                                    {filtered.map((entry) => {
                                        const config = EVENT_CONFIG[entry.eventType] ?? EVENT_CONFIG.consent_changed;
                                        return (
                                            <tr key={entry.id}>
                                                <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>{formatTs(entry.timestamp)}</td>
                                                <td>
                                                    <div className="font-semibold">{entry.patientName}</div>
                                                    <div className="text-sm text-muted">{entry.patientId}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${config.badge}`}>
                                                        {config.icon} {config.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    {entry.channel
                                                        ? <span className="badge badge-muted">{entry.channel.toUpperCase()}</span>
                                                        : "—"}
                                                </td>
                                                <td style={{ fontSize: 12 }}>
                                                    {entry.oldState && entry.newState
                                                        ? <span>{entry.oldState} → <strong>{entry.newState}</strong></span>
                                                        : "—"}
                                                </td>
                                                <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                                    {entry.reason ?? entry.actor}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
