"use client";

import { useState, useEffect } from "react";
import type { RevenueAuditSummary, RevenueAuditResult } from "@/types";
import Link from "next/link";

const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

const formatNumber = (val: number) =>
    new Intl.NumberFormat("en-US").format(val);

export default function RevenueAuditDashboard() {
    const [summary, setSummary] = useState<RevenueAuditSummary | null>(null);

    useEffect(() => {
        fetch("/api/audit")
            .then((r) => r.json())
            .then(setSummary)
            .catch(console.error);
    }, []);

    if (!summary) {
        return (
            <div className="page-content" style={{ textAlign: "center", paddingTop: 48, color: "var(--text-secondary)" }}>
                Generating Revenue Gap Audit...
            </div>
        );
    }

    const hygiene = summary.results.find(r => r.category === "hygiene");
    const treatment = summary.results.find(r => r.category === "treatment");
    const reactivation = summary.results.find(r => r.category === "reactivation");

    const total = summary.totalRecoverableRevenue || 1; // avoid /0

    const getPct = (val?: number) => val ? (val / total) * 100 : 0;

    const getConfBadge = (conf: string) => {
        switch (conf) {
            case "high": return <span className="badge badge-success">High Confidence</span>;
            case "medium": return <span className="badge badge-warning">Medium Confidence</span>;
            case "low": return <span className="badge badge-danger">Low Confidence</span>;
            default: return null;
        }
    };

    const Card = ({ title, icon, color, data, desc }: { title: string, icon: string, color: string, data?: RevenueAuditResult, desc: string }) => {
        if (!data) return null;
        return (
            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ fontSize: 24, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-card-hover)", borderRadius: 8 }}>
                            {icon}
                        </div>
                        <div>
                            <div className="font-semibold" style={{ fontSize: 16 }}>{title}</div>
                            <div className="text-sm text-muted">{desc}</div>
                        </div>
                    </div>
                    {getConfBadge(data.confidenceScore)}
                </div>

                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: color, lineHeight: 1 }}>
                        {formatCurrency(data.estimatedRevenue)}
                    </div>
                    <div className="text-sm text-muted" style={{ paddingBottom: 4 }}>
                        from {formatNumber(data.patientCount)} patients
                    </div>
                </div>

                <div style={{ height: 6, background: "var(--bg-card-hover)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${getPct(data.estimatedRevenue)}%`, height: "100%", background: color }} />
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Revenue Gap Audit</div>
                </div>
                <button className="btn btn-primary" disabled>
                    Activate Campaigns →
                </button>
            </div>

            <div className="page-content">

                {total === 1 ? (
                    <div className="alert alert-warning mb-6">
                        ⚠ No data available for audit. <Link href="/integration">Connect your PMS</Link> to generate the Revenue Gap Audit.
                    </div>
                ) : (
                    <>
                        {/* Hero Section */}
                        <div style={{ textAlign: "center", padding: "40px 0 60px 0" }}>
                            <div className="text-muted mb-2" style={{ textTransform: "uppercase", letterSpacing: 1, fontSize: 13, fontWeight: 600 }}>Total Recoverable Revenue Estimate</div>
                            <div style={{ fontSize: 72, fontWeight: 800, color: "var(--text-primary)", letterSpacing: -2, lineHeight: 1 }}>
                                {formatCurrency(summary.totalRecoverableRevenue)}
                            </div>
                            <p className="text-muted mt-4 mx-auto" style={{ maxWidth: 600 }}>
                                This audit analyzes your practice&apos;s segmented data to identify unrealized production sitting idle in your database.
                            </p>
                        </div>

                        {/* Visual Distribution Bar */}
                        <div className="mb-8">
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span className="text-sm font-semibold">Opportunity Distribution</span>
                            </div>
                            <div style={{ display: "flex", height: 24, borderRadius: 12, overflow: "hidden", gap: 2 }}>
                                <div style={{ width: `${getPct(treatment?.estimatedRevenue)}%`, background: "var(--accent)", transition: "width 1s ease" }} title="Treatment" />
                                <div style={{ width: `${getPct(hygiene?.estimatedRevenue)}%`, background: "var(--warning)", transition: "width 1s ease" }} title="Hygiene" />
                                <div style={{ width: `${getPct(reactivation?.estimatedRevenue)}%`, background: "var(--purple)", transition: "width 1s ease" }} title="Reactivation" />
                            </div>
                        </div>

                        {/* Breakdown Cards */}
                        <div className="grid grid-cols-1 mb-8" style={{ gap: 24 }}>
                            <Card
                                title="Unscheduled Treatment"
                                icon="📋"
                                color="var(--accent)"
                                data={treatment}
                                desc="Approved treatment plans that remain unbooked."
                            />
                            <Card
                                title="Overdue Hygiene"
                                icon="🦷"
                                color="var(--warning)"
                                data={hygiene}
                                desc="Active patients past their recall due date."
                            />
                            <Card
                                title="Inactive Patient Reactivation"
                                icon="💤"
                                color="var(--purple)"
                                data={reactivation}
                                desc="Patients with no visits in 18+ months (based on 15% estimated win-back rate)."
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
