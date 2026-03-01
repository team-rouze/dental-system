"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

// ─── Admin steps ─────────────────────────────────────────────────────────────

function AdminStep0({ name, onNext }: { name: string; onNext: () => void }) {
    return (
        <div style={stepWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Rouze Dental" style={{ width: 72, height: 72, objectFit: "contain", marginBottom: 24 }} />
            <h1 style={heading}>Welcome, {name.split(" ")[0]}!</h1>
            <p style={sub}>Let's configure your revenue reactivation platform in just a few steps. It takes less than 2 minutes.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", marginTop: 12 }}>
                {[
                    { icon: "🏥", label: "Practice Details", desc: "Name, phone & message settings" },
                    { icon: "🔌", label: "Connect Your PMS", desc: "Link Dentrix, Eaglesoft, or similar" },
                    { icon: "🚀", label: "Launch", desc: "Start recovering lost revenue" },
                ].map(item => (
                    <div key={item.label} style={featureRow}>
                        <span style={{ fontSize: 22 }}>{item.icon}</span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{item.label}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{item.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
            <button className="btn btn-primary" style={ctaBtn} onClick={onNext}>
                Get Started →
            </button>
        </div>
    );
}

function AdminStep1({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
    const [practiceName, setPracticeName] = useState("");
    const [phone, setPhone] = useState("");
    const [footer, setFooter] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNext = async () => {
        if (!practiceName.trim()) return;
        setError(null);
        setSaving(true);
        try {
            const res = await fetch("/api/settings/practice", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    practiceName: practiceName.trim(),
                    practicePhone: phone.trim(),
                    messageFooter: footer.trim(),
                }),
            });
            if (!res.ok) throw new Error("Failed to save");
            onNext();
        } catch {
            setError("Could not save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={stepWrap}>
            <div style={stepIcon}>🏥</div>
            <h1 style={heading}>Practice Details</h1>
            <p style={sub}>This information personalises messages sent to your patients.</p>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                <div>
                    <label className="form-label">Practice Name *</label>
                    <input
                        className="form-input"
                        placeholder="e.g. Bright Smiles Dental"
                        value={practiceName}
                        onChange={e => setPracticeName(e.target.value)}
                        autoFocus
                    />
                    <div className="form-hint">Used as {"{{practice_name}}"} in all patient messages.</div>
                </div>
                <div>
                    <label className="form-label">Practice Phone</label>
                    <input
                        className="form-input"
                        placeholder="e.g. (555) 123-4567"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">
                        Message Footer{" "}
                        <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>(optional)</span>
                    </label>
                    <input
                        className="form-input"
                        placeholder="e.g. Reply STOP to opt out."
                        value={footer}
                        onChange={e => setFooter(e.target.value)}
                    />
                    <div className="form-hint">Appended to every outbound SMS.</div>
                </div>
                {error && <div className="alert alert-error">{error}</div>}
            </div>

            <div style={navRow}>
                <button className="btn btn-secondary" onClick={onBack}>← Back</button>
                <button
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={!practiceName.trim() || saving}
                >
                    {saving ? <><span className="spinner" /> Saving…</> : "Save & Continue →"}
                </button>
            </div>
        </div>
    );
}

const PMS_PROVIDERS = [
    { id: "Dentrix", label: "Dentrix", icon: "🦷" },
    { id: "Eaglesoft", label: "Eaglesoft", icon: "🦅" },
    { id: "OpenDental", label: "Open Dental", icon: "📂" },
    { id: "Carestream", label: "Carestream", icon: "💻" },
    { id: "Curve", label: "Curve", icon: "📈" },
];

function AdminStep2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div style={stepWrap}>
            <div style={stepIcon}>🔌</div>
            <h1 style={heading}>Connect Your PMS</h1>
            <p style={sub}>Select your Practice Management Software. You can complete setup from the PMS Connection page later.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", marginTop: 8 }}>
                {PMS_PROVIDERS.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setSelected(p.id === selected ? null : p.id)}
                        style={{
                            border: `2px solid ${selected === p.id ? "var(--accent)" : "var(--border)"}`,
                            borderRadius: "var(--radius)",
                            padding: "14px 10px",
                            background: selected === p.id ? "var(--accent-subtle)" : "var(--bg-card)",
                            cursor: "pointer",
                            textAlign: "center",
                            transition: "all 0.15s ease",
                        }}
                    >
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{p.label}</div>
                    </button>
                ))}
            </div>

            <div style={navRow}>
                <button className="btn btn-secondary" onClick={onBack}>← Back</button>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-secondary" onClick={onNext}>Skip for now</button>
                    <button className="btn btn-primary" onClick={onNext} disabled={!selected}>
                        Continue →
                    </button>
                </div>
            </div>
        </div>
    );
}

function AdminStep3({ name, onFinish, finishing }: { name: string; onFinish: () => void; finishing: boolean }) {
    return (
        <div style={stepWrap}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h1 style={heading}>You're all set, {name.split(" ")[0]}!</h1>
            <p style={sub}>Rouze Dental is ready to help you recover lost revenue and keep your schedule full.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", marginTop: 8 }}>
                {[
                    { icon: "🧠", label: "Segmentation", desc: "Automatically identifies high-value patient opportunities" },
                    { icon: "⚡", label: "Automations", desc: "Multi-touch campaigns that run on autopilot" },
                    { icon: "📅", label: "Confirmations", desc: "3-touch appointment reminder sequences" },
                ].map(f => (
                    <div key={f.label} style={{ ...featureRow, background: "var(--bg-secondary)" }}>
                        <span style={{ fontSize: 22 }}>{f.icon}</span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{f.label}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{f.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="btn btn-primary" style={ctaBtn} onClick={onFinish} disabled={finishing}>
                {finishing ? <><span className="spinner" /> Setting up…</> : "Go to Dashboard →"}
            </button>
        </div>
    );
}

// ─── Staff steps ─────────────────────────────────────────────────────────────

function StaffStep0({ name, onNext }: { name: string; onNext: () => void }) {
    return (
        <div style={stepWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Rouze Dental" style={{ width: 72, height: 72, objectFit: "contain", marginBottom: 24 }} />
            <h1 style={heading}>Welcome, {name.split(" ")[0]}!</h1>
            <p style={sub}>You've been added to your practice's Rouze Dental account. Here's a quick look at what you can do.</p>
            <div style={{ ...featureRow, marginTop: 16, background: "var(--accent-subtle)", border: "1px solid var(--accent)" }}>
                <span style={{ fontSize: 22 }}>👥</span>
                <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--accent)" }}>Staff Access</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                        You have access to patient data, confirmations, automations, and compliance tools.
                    </div>
                </div>
            </div>
            <button className="btn btn-primary" style={{ ...ctaBtn, marginTop: 28 }} onClick={onNext}>
                See My Workspace →
            </button>
        </div>
    );
}

function StaffStep1({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
    return (
        <div style={stepWrap}>
            <div style={stepIcon}>📋</div>
            <h1 style={heading}>Your Workspace</h1>
            <p style={sub}>Here's what you have access to as a staff member.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 8 }}>
                {[
                    { icon: "👥", label: "Patients", desc: "View patient profiles, segments, and contact history" },
                    { icon: "📅", label: "Confirmations", desc: "Monitor 3-touch appointment reminder sequences" },
                    { icon: "🔁", label: "Reschedule Recovery", desc: "Track outreach to recently cancelled patients" },
                    { icon: "⚡", label: "Automations", desc: "View active reactivation campaigns" },
                    { icon: "🛡️", label: "Compliance", desc: "Check consent status and suppression lists" },
                ].map(f => (
                    <div key={f.label} style={featureRow}>
                        <span style={{ fontSize: 20 }}>{f.icon}</span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{f.label}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{f.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={navRow}>
                <button className="btn btn-secondary" onClick={onBack}>← Back</button>
                <button className="btn btn-primary" onClick={onNext}>Continue →</button>
            </div>
        </div>
    );
}

function StaffStep2({ name, onFinish, finishing }: { name: string; onFinish: () => void; finishing: boolean }) {
    return (
        <div style={stepWrap}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h1 style={heading}>Ready to go, {name.split(" ")[0]}!</h1>
            <p style={sub}>Your account is set up. Head to the dashboard to get started.</p>
            <button className="btn btn-primary" style={ctaBtn} onClick={onFinish} disabled={finishing}>
                {finishing ? <><span className="spinner" /> Setting up…</> : "Go to Dashboard →"}
            </button>
        </div>
    );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const stepWrap: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
};

const heading: React.CSSProperties = {
    fontSize: 26,
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.4px",
    marginBottom: 10,
};

const sub: React.CSSProperties = {
    fontSize: 14,
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    marginBottom: 8,
    maxWidth: 400,
};

const featureRow: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: "12px 14px",
    borderRadius: "var(--radius)",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    textAlign: "left",
    width: "100%",
};

const ctaBtn: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    fontSize: 15,
    justifyContent: "center",
    marginTop: 24,
};

const navRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 24,
};

const stepIcon: React.CSSProperties = {
    fontSize: 44,
    marginBottom: 16,
};

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
    return (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        width: i === current ? 24 : 8,
                        height: 8,
                        borderRadius: 100,
                        background: i <= current ? "var(--accent)" : "var(--border)",
                        transition: "all 0.3s ease",
                    }}
                />
            ))}
        </div>
    );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingState() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 40 }}>
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3, color: "var(--accent)" }} />
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your account…</p>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
    const { data: session, status } = useSession();
    const [step, setStep] = useState(0);
    const [finishing, setFinishing] = useState(false);

    const role = (session?.user as any)?.role as "admin" | "staff" | undefined;
    const name = session?.user?.name ?? "there";

    const totalSteps = role === "admin" ? 4 : role === "staff" ? 3 : 0;

    const handleFinish = async () => {
        setFinishing(true);
        try {
            await fetch("/api/onboarding/complete", { method: "POST" });
            // API sets the onboarding_complete cookie — middleware reads it
            // immediately, so a hard redirect works without a JWT refresh.
            window.location.href = "/dashboard";
        } catch {
            setFinishing(false);
        }
    };

    const renderStep = () => {
        // Wait until session is loaded before showing any step
        if (status === "loading" || !role) return <LoadingState />;

        if (role === "admin") {
            switch (step) {
                case 0: return <AdminStep0 name={name} onNext={() => setStep(1)} />;
                case 1: return <AdminStep1 onNext={() => setStep(2)} onBack={() => setStep(0)} />;
                case 2: return <AdminStep2 onNext={() => setStep(3)} onBack={() => setStep(1)} />;
                case 3: return <AdminStep3 name={name} onFinish={handleFinish} finishing={finishing} />;
            }
        }

        if (role === "staff") {
            switch (step) {
                case 0: return <StaffStep0 name={name} onNext={() => setStep(1)} />;
                case 1: return <StaffStep1 onNext={() => setStep(2)} onBack={() => setStep(0)} />;
                case 2: return <StaffStep2 name={name} onFinish={handleFinish} finishing={finishing} />;
            }
        }

        return null;
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--bg-primary)",
            display: "flex",
            flexDirection: "column",
        }}>
            {/* Top bar */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 32px",
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-card)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Rouze Dental" style={{ width: 28, height: 28, objectFit: "contain" }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Rouze Dental</span>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    style={{
                        background: "none",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                    }}
                >
                    Sign Out
                </button>
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 24px",
            }}>
                {status !== "loading" && role && totalSteps > 0 && (
                    <ProgressDots total={totalSteps} current={step} />
                )}
                <div style={{ width: "100%", maxWidth: 520 }} key={`${role}-${step}`}>
                    {renderStep()}
                </div>
            </div>

            {/* Footer */}
            {status !== "loading" && role && (
                <div style={{ textAlign: "center", padding: "16px", fontSize: 12, color: "var(--text-muted)" }}>
                    Step {step + 1} of {totalSteps} · Rouze Dental
                </div>
            )}
        </div>
    );
}
