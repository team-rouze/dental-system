"use client";

import { useState, useEffect } from "react";
import type { TwilioConfig } from "@/types";

export default function MessagingConfigPage() {
    const [config, setConfig] = useState<Partial<TwilioConfig>>({});
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/messaging/config")
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(console.error);
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(false);
        await fetch("/api/messaging/config", {
            method: "POST",
            body: JSON.stringify(config),
            headers: { "Content-Type": "application/json" }
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Twilio Configuration</div>
                    <div className="topbar-breadcrumb">Infrastructure → Messaging Config</div>
                </div>
            </div>

            <div className="page-content">
                <div className="card" style={{ maxWidth: 600 }}>
                    <h2 style={{ fontSize: 18, marginBottom: 16 }}>Connection Settings</h2>

                    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label className="text-sm font-semibold block mb-2">Account SID</label>
                            <input
                                type="text"
                                className="input"
                                style={{ width: "100%" }}
                                value={config.accountSid || ""}
                                onChange={e => setConfig({ ...config, accountSid: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold block mb-2">Auth Token</label>
                            <input
                                type="password"
                                className="input"
                                style={{ width: "100%" }}
                                value={config.authToken || ""}
                                onChange={e => setConfig({ ...config, authToken: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold block mb-2">Messaging Service SID (or Phone Number)</label>
                            <input
                                type="text"
                                className="input"
                                style={{ width: "100%" }}
                                value={config.messagingServiceSid || config.phoneNumber || ""}
                                onChange={e => setConfig({ ...config, messagingServiceSid: e.target.value })}
                            />
                        </div>

                        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "16px", background: "var(--bg-card-hover)", borderRadius: 8 }}>
                            <input
                                type="checkbox"
                                id="sandbox"
                                checked={config.isSandboxMode ?? true}
                                onChange={e => setConfig({ ...config, isSandboxMode: e.target.checked })}
                                style={{ width: 20, height: 20 }}
                            />
                            <label htmlFor="sandbox" style={{ cursor: "pointer" }}>
                                <div className="font-semibold">Enable Sandbox (Local Dev) Mode</div>
                                <div className="text-sm text-muted">When enabled, messages are printed to the console and delivery webhooks are bypassed.</div>
                            </label>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                            {saved ? <span style={{ color: "var(--success)" }}>Settings saved!</span> : <span />}
                            <button type="submit" className="btn btn-primary">Save Configuration</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
