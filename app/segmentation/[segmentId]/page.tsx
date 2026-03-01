"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { PatientSegment, Patient, SegmentId } from "@/types";
import { SEGMENT_META } from "@/lib/segmentation/segmentationEngine";
import Link from "next/link";
import ConsentBadge from "@/components/ConsentBadge";

type SegmentResult = PatientSegment & { patient: Patient };

const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

export default function SegmentationDrilldownPage() {
    const params = useParams();
    const segmentId = params.segmentId as SegmentId;
    const meta = SEGMENT_META.find((m) => m.id === segmentId);

    const [patients, setPatients] = useState<SegmentResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!segmentId) return;
        fetch(`/api/segmentation/${segmentId}`)
            .then((r) => r.json())
            .then((d) => {
                setPatients(d.patients ?? []);
                setLoading(false);
            });
    }, [segmentId]);

    if (!meta) return <div className="page-content" style={{ color: "var(--danger)", paddingTop: 40 }}>Invalid Segment ID</div>;

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">{meta.label}</div>
                    <div className="topbar-breadcrumb">
                        <Link href="/segmentation" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Segmentation</Link> → {meta.label}
                    </div>
                </div>
                <span className="badge badge-accent">{patients.length} patients</span>
            </div>

            <div className="page-content">
                <div className="page-header" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ fontSize: 32, width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-subtle)" }}>
                        {meta.icon}
                    </div>
                    <div>
                        <h1 style={{ marginBottom: 4 }}>{meta.label}</h1>
                        <p style={{ margin: 0 }}>{meta.description}</p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: 48, color: "var(--text-secondary)" }}>Loading segment details...</div>
                ) : patients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">✨</div>
                        <h3>No patients in this segment</h3>
                        <p>Your data sync is active but no patients currently match the criteria for {meta.label}.</p>
                    </div>
                ) : (
                    <div className="card">
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Priority</th>
                                        <th>Patient</th>
                                        <th>Last Visit</th>
                                        <th>Contact Info</th>
                                        <th>Revenue Opp.</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((row) => (
                                        <tr key={row.patientId}>
                                            <td style={{ width: 80 }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: "50%",
                                                    background: row.priorityScore > 75 ? "rgba(248, 81, 73, 0.1)" : "rgba(88, 166, 255, 0.1)",
                                                    color: row.priorityScore > 75 ? "var(--danger)" : "var(--accent)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontWeight: "bold", fontSize: 14
                                                }}>
                                                    {row.priorityScore}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="font-semibold">{row.patient.firstName} {row.patient.lastName}</div>
                                                <div className="text-sm text-muted">{row.patient.id}</div>
                                            </td>
                                            <td>{row.patient.lastVisitDate ?? "Never"}</td>
                                            <td>
                                                <div className="text-sm">{row.patient.phone || "No phone"}</div>
                                                <div className="text-sm text-muted">{row.patient.email || "No email"}</div>
                                            </td>
                                            <td style={{ fontWeight: 500, color: row.revenueOpportunity > 0 ? "var(--success)" : "inherit" }}>
                                                {row.revenueOpportunity > 0 ? formatCurrency(row.revenueOpportunity) : "—"}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                    {!row.isOutreachEligible && <span className="badge badge-danger">EXCLUDED</span>}
                                                    {row.patient.consentSms !== "opted_in" && <ConsentBadge state={row.patient.consentSms} channel="sms" />}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
