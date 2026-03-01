"use client";

import { useState } from "react";
import type { SyncPhase, PMSProvider } from "@/types";

const PMS_PROVIDERS: { name: PMSProvider; icon: string }[] = [
    { name: "Dentrix", icon: "🦷" },
    { name: "Eaglesoft", icon: "🦅" },
    { name: "Carestream", icon: "💧" },
    { name: "OpenDental", icon: "⚙️" },
    { name: "Curve", icon: "📈" },
];

type SyncStep = {
    key: string;
    label: string;
    description: string;
    activePhases: SyncPhase[];
    donePhases: SyncPhase[];
};

const SYNC_STEPS: SyncStep[] = [
    {
        key: "connect",
        label: "Validating Credentials",
        description: "Establishing secure connection to PMS",
        activePhases: ["connecting"],
        donePhases: ["importing", "normalizing", "success", "partial_warning"],
    },
    {
        key: "import",
        label: "Importing Patient Data",
        description: "Pulling patients, appointments, and treatment plans",
        activePhases: ["importing"],
        donePhases: ["normalizing", "success", "partial_warning"],
    },
    {
        key: "normalize",
        label: "Normalizing Records",
        description: "Mapping PMS fields to internal schema",
        activePhases: ["normalizing"],
        donePhases: ["success", "partial_warning"],
    },
    {
        key: "done",
        label: "Sync Complete",
        description: "Data is ready for segmentation",
        activePhases: ["success"],
        donePhases: [],
    },
];

interface AuthModalProps {
    provider: PMSProvider;
    onClose: () => void;
    onConnect: (apiKey: string, practiceId: string) => void;
    loading: boolean;
}

function AuthModal({ provider, onClose, onConnect, loading }: AuthModalProps) {
    const [apiKey, setApiKey] = useState("");
    const [practiceId, setPracticeId] = useState("");

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Connect {provider}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="alert alert-info">
                        🔒 Credentials are encrypted in transit. This system uses read-only access only.
                    </div>
                    <div className="form-group">
                        <label className="form-label">API Key</label>
                        <input
                            id="pms-api-key"
                            type="password"
                            className="form-input"
                            placeholder="Enter your PMS API key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                        <p className="form-hint">Found in your PMS → Settings → Integrations panel</p>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Practice ID</label>
                        <input
                            id="pms-practice-id"
                            type="text"
                            className="form-input"
                            placeholder="e.g. PRX-00123"
                            value={practiceId}
                            onChange={(e) => setPracticeId(e.target.value)}
                        />
                    </div>
                    <p className="text-sm text-muted mt-2">
                        💡 <strong>Demo tip:</strong> Enter any value to simulate a successful connection. Enter <code>INVALID</code> as the API key to test the error state.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        id="connect-btn"
                        className="btn btn-primary"
                        disabled={!apiKey || !practiceId || loading}
                        onClick={() => onConnect(apiKey, practiceId)}
                    >
                        {loading ? <><span className="spinner" /> Connecting…</> : "Connect & Import"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function StepStatus({ step, currentPhase, hasError }: { step: SyncStep; currentPhase: SyncPhase; hasError: boolean }) {
    const isActive = step.activePhases.includes(currentPhase);
    const isDone = step.donePhases.includes(currentPhase) || (currentPhase === "success" && step.key === "done");
    const isError = hasError && step.activePhases.includes(currentPhase === "error" ? "connecting" : currentPhase);

    let className = "sync-step";
    if (isActive && !hasError) className += " active";
    else if (isDone) className += " done";
    else if (isError) className += " error";

    return (
        <div className={className}>
            <div className="sync-step-icon">
                {isDone ? "✓" : isActive && !hasError ? <span className="spinner" /> : isError ? "✗" : "○"}
            </div>
            <div className="sync-step-info">
                <h4>{step.label}</h4>
                <p>{step.description}</p>
            </div>
        </div>
    );
}

export default function IntegrationPage() {
    const [selectedProvider, setSelectedProvider] = useState<PMSProvider | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [phase, setPhase] = useState<SyncPhase>("idle");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; stats?: Record<string, number> } | null>(null);

    const handleConnect = async (apiKey: string, practiceId: string) => {
        if (!selectedProvider) return;
        setLoading(true);
        setShowModal(false);
        setPhase("connecting");
        setResult(null);

        // Simulate phase progression for UX
        const phases: SyncPhase[] = ["connecting", "importing", "normalizing"];
        for (const p of phases) {
            setPhase(p);
            await new Promise((r) => setTimeout(r, 800));
        }

        const res = await fetch("/api/integration/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: selectedProvider, apiKey, practiceId }),
        });
        const data = await res.json();

        setPhase(data.success ? "success" : "error");
        setResult({
            success: data.success,
            message: data.log?.errorMessage ?? (data.success ? "Data successfully imported." : "Connection failed."),
            stats: data.stats,
        });
        setLoading(false);
    };

    const isRunning = ["connecting", "importing", "normalizing"].includes(phase);

    return (
        <>
            {showModal && selectedProvider && (
                <AuthModal
                    provider={selectedProvider}
                    onClose={() => setShowModal(false)}
                    onConnect={handleConnect}
                    loading={loading}
                />
            )}

            <div className="topbar">
                <div>
                    <div className="topbar-title">PMS Connection Setup</div>
                    <div className="topbar-breadcrumb">Data Integration → Connect</div>
                </div>
                {phase === "success" && (
                    <span className="badge badge-success">✓ Connected</span>
                )}
                {phase === "error" && (
                    <span className="badge badge-danger">✗ Error</span>
                )}
            </div>

            <div className="page-content">
                <div className="page-header">
                    <h1>Connect Your Practice Management System</h1>
                    <p>Import your patient data to begin automated reactivation and revenue recovery.</p>
                </div>

                {/* Provider selection */}
                {phase === "idle" && (
                    <>
                        <div className="section">
                            <div className="section-title">Step 1 — Select Your PMS Provider</div>
                            <div className="provider-grid">
                                {PMS_PROVIDERS.map((p) => (
                                    <div
                                        key={p.name}
                                        id={`provider-${p.name.toLowerCase()}`}
                                        className={`provider-card ${selectedProvider === p.name ? "selected" : ""}`}
                                        onClick={() => setSelectedProvider(p.name)}
                                    >
                                        <div className="provider-card-icon">{p.icon}</div>
                                        <div className="provider-card-name">{p.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="section">
                            <div className="section-title">Step 2 — Authenticate</div>
                            <div className="card card-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="card-title">
                                            {selectedProvider ? `Connecting to ${selectedProvider}` : "Select a provider above"}
                                        </div>
                                        <div className="card-subtitle">Read-only access · TLS 1.2+ encrypted · HIPAA-conscious</div>
                                    </div>
                                    <button
                                        id="open-auth-modal-btn"
                                        className="btn btn-primary"
                                        disabled={!selectedProvider}
                                        onClick={() => setShowModal(true)}
                                    >
                                        🔌 Connect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Sync progress */}
                {phase !== "idle" && (
                    <div className="card" style={{ maxWidth: 560 }}>
                        <div className="card-header">
                            <div>
                                <div className="card-title">
                                    {isRunning ? "Importing Data…" : phase === "success" ? "Import Complete" : "Import Failed"}
                                </div>
                                <div className="card-subtitle">Provider: {selectedProvider}</div>
                            </div>
                        </div>

                        <div className="sync-steps">
                            {SYNC_STEPS.map((step) => (
                                <StepStatus key={step.key} step={step} currentPhase={phase} hasError={phase === "error"} />
                            ))}
                        </div>

                        {result && (
                            <div className={`alert ${result.success ? "alert-success" : "alert-danger"}`}>
                                {result.success ? "✅" : "❌"} {result.message}
                            </div>
                        )}

                        {result?.success && result.stats && (
                            <div className="stats-grid" style={{ marginTop: 0 }}>
                                <div className="stat-card">
                                    <div className="stat-label">Patients</div>
                                    <div className="stat-value">{result.stats.patients}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Appointments</div>
                                    <div className="stat-value">{result.stats.appointments}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Treatment Plans</div>
                                    <div className="stat-value">{result.stats.treatmentPlans}</div>
                                </div>
                            </div>
                        )}

                        {(result?.success || result?.success === false) && (
                            <div className="flex gap-2 mt-4">
                                {result.success && (
                                    <a href="/dashboard" className="btn btn-primary">→ View Dashboard</a>
                                )}
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => { setPhase("idle"); setResult(null); }}
                                >
                                    {result.success ? "Reconfigure" : "Try Again"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
