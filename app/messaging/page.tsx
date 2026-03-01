"use client";

import { useState } from "react";
import Link from "next/link";

export default function MessagingDashboard() {
    const [phone, setPhone] = useState("+15551234567");
    const [text, setText] = useState("Hi {{first_name}}, this is a test from Rouze DS.");
    const [patientId, setPatientId] = useState("pat_001");
    const [sending, setSending] = useState(false);
    const [successStatus, setSuccessStatus] = useState<string | null>(null);

    const testSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        // Fire to the direct send endpoint
        const res = await fetch("/api/messaging/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, text, campaignId: "test_campaign" })
        });

        if (res.ok) {
            setSuccessStatus("Message queued successfully!");
        } else {
            const data = await res.json();
            setSuccessStatus(`Error: ${data.error}`);
        }

        setTimeout(() => setSuccessStatus(null), 3000);
        setSending(false);
    };

    const testReply = async () => {
        // Simulate Twilio inbound webhook
        const formData = new URLSearchParams();
        formData.append("From", phone);
        formData.append("Body", "STOP");

        await fetch("/api/messaging/webhook/reply", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
        });
        alert("Simulated STOP reply from patient phone.");
    };

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Smart Messaging Engine</div>
                    <div className="topbar-breadcrumb">Communication Infrastructure</div>
                </div>
                <Link href="/messaging/config" className="btn btn-outline">
                    ⚙️ Twilio Config
                </Link>
            </div>

            <div className="page-content">
                <div className="grid grid-cols-2" style={{ gap: 24 }}>

                    <div className="card">
                        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Test Dispatcher</h2>
                        <p className="text-sm text-muted mb-6">
                            Use this tool to manually queue a message into the Cadence Engine. The engine will check the patient&apos;s consent, parse `{"{{tokens}}"}` and execute sending via the Twilio adapter.
                        </p>

                        <form onSubmit={testSend} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label className="text-sm font-semibold block mb-2">Patient ID (for context matching)</label>
                                <input type="text" className="input" style={{ width: "100%" }} value={patientId} onChange={e => setPatientId(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-sm font-semibold block mb-2">Patient Phone (for webhook simulation)</label>
                                <input type="text" className="input" style={{ width: "100%" }} value={phone} onChange={e => setPhone(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-sm font-semibold block mb-2">Message Body (Supports `{"{{first_name}}"}`)</label>
                                <textarea className="input" style={{ width: "100%", height: 80 }} value={text} onChange={e => setText(e.target.value)} required />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                {successStatus ? <span className="text-sm" style={{ color: successStatus.includes("Error") ? "var(--danger)" : "var(--success)" }}>{successStatus}</span> : <span />}
                                <button type="submit" className="btn btn-primary" disabled={sending}>
                                    {sending ? "Queuing..." : "Send Test Message"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="card">
                        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Test Inbound Webhook</h2>
                        <p className="text-sm text-muted mb-6">
                            Simulate a patient texting a reply to the Twilio number.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16, background: "rgba(248, 81, 73, 0.05)", padding: 16, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                            <div className="text-sm font-semibold" style={{ color: "var(--danger)" }}>Simulate Patient STOP Reply</div>
                            <p className="text-sm text-muted m-0">This simulates an inbound webhook from Twilio with the body "STOP". The Consent Engine will capture this, mark the patient as opted_out, write an immutable Audit Log entry, and the Cadence Engine will pause all active outbound messages for this patient.</p>
                            <button onClick={testReply} className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
                                Simulate STOP Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
