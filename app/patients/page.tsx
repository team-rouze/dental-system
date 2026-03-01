"use client";

import { useState, useEffect } from "react";
import type { Patient } from "@/types";
import ConsentBadge from "@/components/ConsentBadge";

const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—";

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetch("/api/patients")
            .then((r) => r.json())
            .then((d) => setPatients(d.patients ?? []));
    }, []);

    const filtered = patients.filter((p) => {
        const name = `${p.firstName} ${p.lastName}`.toLowerCase();
        const matchSearch = !search || name.includes(search.toLowerCase()) || p.phone.includes(search) || p.email.includes(search.toLowerCase());
        const matchFilter =
            filter === "all" ||
            (filter === "overdue" && p.hygieneRecallStatus === "overdue") ||
            (filter === "inactive" && !p.isActive) ||
            (filter === "treatment" && p.hasUnscheduledTreatment);
        return matchSearch && matchFilter;
    });

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Patients</div>
                    <div className="topbar-breadcrumb">Data Integration → Patients</div>
                </div>
                <span className="badge badge-accent">{patients.length} total</span>
            </div>

            <div className="page-content">
                <div className="page-header">
                    <h1>Patient Records</h1>
                    <p>All synced patients from your PMS with consent status and recall information.</p>
                </div>

                {patients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3>No Patients Synced</h3>
                        <p>Connect your PMS and run an import to load patient records.</p>
                        <a href="/integration" className="btn btn-primary mt-4">Connect PMS</a>
                    </div>
                ) : (
                    <>
                        {/* Filters */}
                        <div className="flex gap-3 mb-4" style={{ flexWrap: "wrap" }}>
                            <input
                                id="patient-search"
                                type="text"
                                className="form-input"
                                placeholder="Search by name, phone, or email…"
                                style={{ maxWidth: 280 }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <select className="form-select" style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="all">All Patients</option>
                                <option value="overdue">Overdue Hygiene</option>
                                <option value="treatment">Unscheduled Treatment</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="card">
                            <div className="table-wrap">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Last Visit</th>
                                            <th>Hygiene Recall</th>
                                            <th>SMS Consent</th>
                                            <th>Email Consent</th>
                                            <th>Treatment</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length === 0 && (
                                            <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 0" }}>No patients match your filters.</td></tr>
                                        )}
                                        {filtered.map((p) => (
                                            <tr key={p.id}>
                                                <td>
                                                    <div className="font-semibold">{p.firstName} {p.lastName}</div>
                                                    <div className="text-sm text-muted">{p.id}</div>
                                                </td>
                                                <td>{p.phone}</td>
                                                <td>{formatDate(p.lastVisitDate)}</td>
                                                <td>
                                                    <span className={`badge ${p.hygieneRecallStatus === "overdue" ? "badge-danger" :
                                                            p.hygieneRecallStatus === "current" ? "badge-success" : "badge-muted"
                                                        }`}>
                                                        {p.hygieneRecallStatus}
                                                    </span>
                                                </td>
                                                <td><ConsentBadge state={p.consentSms} /></td>
                                                <td><ConsentBadge state={p.consentEmail} /></td>
                                                <td>
                                                    {p.hasUnscheduledTreatment
                                                        ? <span className="badge badge-warning">⚠ Unscheduled</span>
                                                        : <span className="badge badge-muted">None</span>}
                                                </td>
                                                <td>
                                                    <span className={`badge ${p.isActive ? "badge-success" : "badge-muted"}`}>
                                                        {p.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
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
