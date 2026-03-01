"use client";

import { useState, useEffect } from "react";
import type { Patient, ContactChannel } from "@/types";
import ConsentBadge from "@/components/ConsentBadge";

export default function SuppressionPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [search, setSearch] = useState("");
    const [optingIn, setOptingIn] = useState<string | null>(null);

    const load = () => {
        fetch("/api/compliance/suppression")
            .then((r) => r.json())
            .then((d) => setPatients(d.patients ?? []));
    };

    useEffect(() => { load(); }, []);

    const reactivate = async (patientId: string, channel: ContactChannel) => {
        setOptingIn(patientId);
        await fetch(`/api/patients/${patientId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channel, newState: "opted_in", actor: "staff" }),
        });
        load();
        setOptingIn(null);
    };

    const filtered = patients.filter((p) => {
        const name = `${p.firstName} ${p.lastName}`.toLowerCase();
        return !search || name.includes(search.toLowerCase()) || p.phone.includes(search);
    });

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Suppression List</div>
                    <div className="topbar-breadcrumb">Compliance → Suppression</div>
                </div>
                <span className="badge badge-danger">{patients.length} suppressed</span>
            </div>

            <div className="page-content">
                <div className="page-header">
                    <h1>Suppression List</h1>
                    <p>Patients who have opted out or are marked Do Not Contact. No automated outreach will be sent to these patients.</p>
                </div>

                <div className="alert alert-warning">
                    ⚠ Patients on this list will never receive automated messages. Staff can manually re-consent patients with their explicit permission only.
                </div>

                <input
                    id="suppression-search"
                    type="text"
                    className="form-input mb-4"
                    placeholder="Search by name or phone…"
                    style={{ maxWidth: 320 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {patients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">✅</div>
                        <h3>No Suppressed Patients</h3>
                        <p>All synced patients are eligible for contact. Opt-outs will appear here instantly.</p>
                    </div>
                ) : (
                    <div className="card">
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Phone</th>
                                        <th>SMS Consent</th>
                                        <th>Email Consent</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((p) => (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="font-semibold">{p.firstName} {p.lastName}</div>
                                                <div className="text-sm text-muted">{p.id}</div>
                                            </td>
                                            <td>{p.phone}</td>
                                            <td><ConsentBadge state={p.consentSms} channel="sms" showChannel /></td>
                                            <td><ConsentBadge state={p.consentEmail} channel="email" showChannel /></td>
                                            <td>
                                                <div className="flex gap-2">
                                                    {p.consentSms !== "opted_in" && (
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            disabled={optingIn === p.id}
                                                            onClick={() => reactivate(p.id, "sms")}
                                                        >
                                                            Re-consent SMS
                                                        </button>
                                                    )}
                                                    {p.consentEmail !== "opted_in" && (
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            disabled={optingIn === p.id}
                                                            onClick={() => reactivate(p.id, "email")}
                                                        >
                                                            Re-consent Email
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 0" }}>No results found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
