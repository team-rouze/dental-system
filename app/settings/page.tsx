"use client";

import { useState, useEffect } from "react";
import type { PracticeSettings, CampaignTemplate, CampaignTemplateStep } from "@/types";

type Tab = "practice" | "campaigns" | "timing";

// ─── Practice Tab ─────────────────────────────────────────────────────────────

function PracticeTab() {
    const [form, setForm] = useState<Partial<PracticeSettings>>({});
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/settings/practice").then(r => r.json()).then(setForm);
    }, []);

    const save = async () => {
        setError(null);
        const res = await fetch("/api/settings/practice", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                practiceName: form.practiceName,
                practicePhone: form.practicePhone,
                messageFooter: form.messageFooter,
            }),
        });
        if (!res.ok) {
            const d = await res.json();
            setError(d.error);
        } else {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const preview = `Hi John, this is a friendly reminder from ${form.practiceName || "Our Dental Clinic"} about your upcoming appointment.${form.messageFooter ? `\n${form.messageFooter}` : ""}`;

    return (
        <div style={{ maxWidth: 640 }}>
            <div className="card mb-6">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Practice Information</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                        <label className="text-sm font-semibold block mb-2">
                            Practice Name <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— used as <code>{"{{practice_name}}"}</code> in messages</span>
                        </label>
                        <input
                            className="input"
                            style={{ width: "100%" }}
                            value={form.practiceName ?? ""}
                            onChange={e => setForm({ ...form, practiceName: e.target.value })}
                            placeholder="e.g. Smile Dental Group"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold block mb-2">Practice Phone <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— optional, for display in messages</span></label>
                        <input
                            className="input"
                            style={{ width: "100%" }}
                            value={form.practicePhone ?? ""}
                            onChange={e => setForm({ ...form, practicePhone: e.target.value })}
                            placeholder="e.g. (555) 123-4567"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold block mb-2">Message Footer / Signature <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— appended to all outbound messages</span></label>
                        <input
                            className="input"
                            style={{ width: "100%" }}
                            value={form.messageFooter ?? ""}
                            onChange={e => setForm({ ...form, messageFooter: e.target.value })}
                            placeholder="e.g. — Smile Dental Team | Reply STOP to opt out"
                        />
                    </div>
                </div>

                {error && <div className="alert alert-error mt-4">{error}</div>}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                    {saved ? <span style={{ color: "var(--success)", fontSize: 14 }}>Saved!</span> : <span />}
                    <button className="btn btn-primary" onClick={save}>Save Practice Info</button>
                </div>
            </div>

            {/* Preview */}
            <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Message Preview</h3>
                <div style={{ background: "var(--bg-body)", borderRadius: 12, padding: "12px 16px", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {preview}
                </div>
                <div className="text-sm text-muted mt-2">Sample preview with patient "John" — tokens replaced at send time.</div>
            </div>
        </div>
    );
}

// ─── Campaign Templates Tab ───────────────────────────────────────────────────

type StepDraft = CampaignTemplateStep & { error?: string };

function StepEditor({ step, idx, onChange, onRemove, canRemove }: {
    step: StepDraft;
    idx: number;
    onChange: (s: StepDraft) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const charCount = step.content.length;
    const overLimit = charCount > 160;

    return (
        <div style={{ background: "var(--bg-body)", border: `1px solid ${step.error ? "var(--error)" : "var(--border)"}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>Step {idx + 1}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="text-sm text-muted">Day</span>
                        <input
                            type="number"
                            min={0}
                            value={step.dayOffset}
                            onChange={e => onChange({ ...step, dayOffset: parseInt(e.target.value) || 0 })}
                            style={{ width: 52, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", textAlign: "center" }}
                        />
                    </div>
                </div>
                {canRemove && (
                    <button onClick={onRemove} className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px", color: "var(--error)", borderColor: "var(--error)" }}>
                        Remove
                    </button>
                )}
            </div>
            <textarea
                value={step.content}
                onChange={e => onChange({ ...step, content: e.target.value })}
                rows={3}
                style={{ width: "100%", resize: "vertical", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", padding: "8px 10px", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
                placeholder="Message content — use {{first_name}} and {{practice_name}}"
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span style={{ fontSize: 12, color: step.error ? "var(--error)" : "var(--text-muted)" }}>
                    {step.error || (overLimit ? `⚠ ${charCount}/160 chars — may split into 2 SMS` : `${charCount}/160 chars`)}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Tokens: <code>{"{{first_name}}"}</code> <code>{"{{practice_name}}"}</code>
                </span>
            </div>
        </div>
    );
}

function CampaignEditor({ campaign }: { campaign: CampaignTemplate }) {
    const [open, setOpen] = useState(false);
    const [steps, setSteps] = useState<StepDraft[]>(campaign.steps.map(s => ({ ...s })));
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validate = (): boolean => {
        let valid = true;
        const updated = steps.map((s, i) => {
            let err = "";
            if (!s.content.trim()) err = "Content cannot be empty";
            else if (!s.content.includes("{{first_name}}")) err = "Must include {{first_name}}";
            else if (i > 0 && s.dayOffset < steps[i - 1].dayOffset) err = "Day offset must be ≥ previous step";
            if (err) valid = false;
            return { ...s, error: err || undefined };
        });
        setSteps(updated);
        return valid;
    };

    const save = async () => {
        if (!validate()) return;
        setSaving(true);
        setError(null);
        const res = await fetch(`/api/settings/campaigns/${campaign.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ steps: steps.map(({ error: _, ...s }) => s) }),
        });
        if (!res.ok) {
            const d = await res.json();
            setError(d.error);
        } else {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        setSaving(false);
    };

    const addStep = () => {
        const lastDay = steps[steps.length - 1]?.dayOffset ?? 0;
        setSteps([...steps, { dayOffset: lastDay + 3, content: "Hi {{first_name}}, " }]);
    };

    return (
        <div className="card" style={{ marginBottom: 12 }}>
            <div
                onClick={() => setOpen(o => !o)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
            >
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{campaign.name}</div>
                    <div className="text-sm text-muted">{steps.length} steps · Targets: {campaign.targetSegment.replace(/_/g, " ")}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className={`badge ${campaign.status === "active" ? "badge-success" : "badge-warning"}`}>
                        {campaign.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 18, color: "var(--text-muted)" }}>{open ? "▲" : "▼"}</span>
                </div>
            </div>

            {open && (
                <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                    {steps.map((step, i) => (
                        <StepEditor
                            key={i}
                            step={step}
                            idx={i}
                            onChange={s => setSteps(steps.map((ss, ii) => ii === i ? s : ss))}
                            onRemove={() => setSteps(steps.filter((_, ii) => ii !== i))}
                            canRemove={steps.length > 1}
                        />
                    ))}

                    <button className="btn btn-outline" style={{ fontSize: 13, marginBottom: 12 }} onClick={addStep}>
                        + Add Step
                    </button>

                    {error && <div className="alert alert-error mb-3">{error}</div>}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {saved ? <span style={{ color: "var(--success)", fontSize: 14 }}>Template saved!</span> : <span />}
                        <button className="btn btn-primary" onClick={save} disabled={saving}>
                            {saving ? "Saving..." : "Save Template"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function CampaignsTab() {
    const [campaigns, setCampaigns] = useState<CampaignTemplate[]>([]);

    useEffect(() => {
        fetch("/api/automations").then(r => r.json()).then(setCampaigns);
    }, []);

    return (
        <div style={{ maxWidth: 720 }}>
            <div className="alert alert-info mb-6">
                Edit message content and day offsets for each campaign step. Changes apply immediately to future enrollments. Required token: <code>{"{{first_name}}"}</code>
            </div>
            {campaigns.length === 0
                ? <div className="text-muted text-center py-12">No campaigns found. Import patient data first.</div>
                : campaigns.map(c => <CampaignEditor key={c.id} campaign={c} />)
            }
        </div>
    );
}

// ─── Reminder Timing Tab ──────────────────────────────────────────────────────

function TimingTab() {
    const [form, setForm] = useState({ reminderTouch1Hours: 48, reminderTouch2Hours: 24, reminderTouch3Hours: 4 });
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/settings/practice").then(r => r.json()).then(d => {
            setForm({
                reminderTouch1Hours: d.reminderTouch1Hours,
                reminderTouch2Hours: d.reminderTouch2Hours,
                reminderTouch3Hours: d.reminderTouch3Hours,
            });
        });
    }, []);

    const save = async () => {
        setError(null);
        const res = await fetch("/api/settings/practice", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (!res.ok) {
            const d = await res.json();
            setError(d.error);
        } else {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const timingRow = (label: string, key: keyof typeof form, description: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                <div className="text-sm text-muted">{description}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                    type="number"
                    min={1}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: parseInt(e.target.value) || 1 })}
                    style={{ width: 64, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text)", textAlign: "center", fontSize: 16, fontWeight: 700 }}
                />
                <span className="text-sm text-muted">hours before</span>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: 600 }}>
            <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Appointment Reminder Timing</h3>
                <p className="text-sm text-muted mb-4">Configure when each reminder is sent before an appointment. Touch 1 must be later than Touch 2, which must be later than Touch 3.</p>

                {timingRow("Touch 1 — Awareness Reminder", "reminderTouch1Hours", "First reminder sent to the patient. Default: 48h")}
                {timingRow("Touch 2 — Confirmation Request", "reminderTouch2Hours", "Asks patient to reply YES. Default: 24h")}
                {timingRow("Touch 3 — Final Reminder", "reminderTouch3Hours", "Last reminder close to appointment time. Default: 4h")}

                {error && <div className="alert alert-error mt-4">{error}</div>}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                    {saved ? <span style={{ color: "var(--success)", fontSize: 14 }}>Timing saved!</span> : <span />}
                    <button className="btn btn-primary" onClick={save}>Save Timing</button>
                </div>
            </div>

            <div className="alert alert-info mt-4">
                Changes apply to all future reminder syncs. Already-queued reminders for existing appointments are not affected.
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
    { id: "practice", label: "Practice Info" },
    { id: "campaigns", label: "Campaign Templates" },
    { id: "timing", label: "Reminder Timing" },
];

export default function SettingsPage() {
    const [tab, setTab] = useState<Tab>("practice");

    return (
        <>
            <div className="topbar">
                <div>
                    <div className="topbar-title">Workflow Settings</div>
                    <div className="topbar-breadcrumb">Module 5.11 · Configuration & Customization</div>
                </div>
            </div>

            <div className="page-content">
                {/* Tab bar */}
                <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            style={{
                                padding: "8px 18px",
                                fontSize: 14,
                                fontWeight: tab === t.id ? 700 : 400,
                                background: "transparent",
                                border: "none",
                                borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                                color: tab === t.id ? "var(--accent)" : "var(--text-muted)",
                                cursor: "pointer",
                                marginBottom: -1,
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === "practice" && <PracticeTab />}
                {tab === "campaigns" && <CampaignsTab />}
                {tab === "timing" && <TimingTab />}
            </div>
        </>
    );
}
