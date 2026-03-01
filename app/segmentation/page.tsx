"use client";

import { useState, useEffect } from "react";
import type { SegmentSummary, SegmentCount } from "@/types";
import { SEGMENT_META } from "@/lib/segmentation/segmentationEngine";
import Link from "next/link";

const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

export default function SegmentationDashboard() {
    const [summary, setSummary] = useState<SegmentSummary | null>(null);
    const [running, setRunning] = useState(false);

    const load = () => {
        fetch("/api/segmentation")
            .then((r) => r.json())
            .then(setSummary)
            .catch(console.error);
    };

    useEffect(() => { load(); }, []);

    const runEngine = async () => {
        setRunning(true);
        await fetch("/api/segmentation", { method: "POST" });
        await load();
        setRunning(false);
    };

    if (!summary) {
        return (
            <div className="page-content" style={{ textAlign: "center", paddingTop: 48, color: "var(--text-secondary)" }}>
                Loading segmentation data...
            </div>
        );
    }

    const getCountsForGroup = (group: string): SegmentCount[] => {
        const metaIds = SEGMENT_META.filter((m) => m.group === group).map((m) => m.id);
        return summary.counts.filter((c) => metaIds.includes(c.segmentId));
    };

    const revenueCounts = getCountsForGroup("revenue_recovery");
    const operationalCounts = getCountsForGroup("operational");
    const exclusionCounts = getCountsForGroup("exclusion");

    const Section = ({ title, counts }: { title: string, counts: SegmentCount[] }) => (
        <div className="mb-6">
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>{title}</h2>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {counts.map((c) => {
                    const meta = SEGMENT_META.find((m) => m.id === c.segmentId)!;
                    return (
                        <Link key={c.segmentId} href={`/segmentation/${c.segmentId}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <div className="card" style={{ cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-strong)"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-subtle)"}>
                                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                                    <div style={{ fontSize: 24, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-card-hover)", borderRadius: 8 }}>
                                        {meta.icon}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{meta.label}</div>
                                        <div className="text-sm text-muted">{meta.description}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
                                    <div>
                                        <div className="text-sm text-muted">Patients</div>
                                        <div style={{ fontSize: 24, fontWeight: 600, color: meta.color }}>{c.count}</div>
                                    </div>
                                    {c.totalRevenueOpportunity > 0 && (
                                        <div style={{ textAlign: "right" }}>
                                            <div className="text-sm text-muted">Opportunity</div>
                                            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--success)" }}>
                                                {formatCurrency(c.totalRevenueOpportunity)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Patient Segmentation</div>
                </div>
                <button className="btn btn-primary" onClick={runEngine} disabled={running || summary.totalPatients === 0}>
                    {running ? "Analyzing..." : "Run Segmentation Engine"}
                </button>
            </div>

            <div className="page-content">
                <div className="page-header">
                    <h1>Segmentation Intelligence</h1>
                    <p>Automatically classifies patients into actionable outreach groups based on their clinical and appointment history.</p>
                </div>

                {summary.totalPatients === 0 && (
                    <div className="alert alert-warning mb-6">
                        ⚠ No patients synced yet. Connect your PMS in the Integration tab to generate segments.
                    </div>
                )}

                <div className="stats-grid mb-8">
                    <div className="stat-card">
                        <div className="stat-label">Total Patients</div>
                        <div className="stat-value">{summary.totalPatients}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Segmented Patients</div>
                        <div className="stat-value">{summary.segmented}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Outreach Eligible</div>
                        <div className="stat-value" style={{ color: "var(--success)" }}>{summary.outreachEligible}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Revenue Opportunity</div>
                        <div className="stat-value" style={{ color: "var(--accent)" }}>{formatCurrency(summary.totalRevenueOpportunity)}</div>
                    </div>
                </div>

                <Section title="Revenue Recovery Opportunities" counts={revenueCounts} />
                <Section title="Operational Workflows" counts={operationalCounts} />
                <Section title="Exclusion & Compliance" counts={exclusionCounts} />
            </div>
        </>
    );
}
