"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        // 1. Register
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error ?? "Something went wrong. Please try again.");
            setLoading(false);
            return;
        }

        // 2. Auto sign-in with the new credentials
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Account created but sign-in failed. Please sign in manually.");
            setLoading(false);
            return;
        }

        // 3. Hard redirect so middleware sees fresh session → onboarding gate fires
        window.location.href = "/onboarding";
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-primary)",
            padding: 24,
        }}>
            <div style={{ width: "100%", maxWidth: 420 }}>
                {/* Brand */}
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Rouze Dental" style={{ width: 80, height: 80, objectFit: "contain" }} />
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text-primary)" }}>
                        Rouze Dental
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
                        Dental Revenue Reactivation Platform
                    </div>
                </div>

                {/* Card */}
                <div className="card">
                    <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>
                        Create your account
                    </h2>
                    <p className="text-sm text-muted" style={{ marginBottom: 24 }}>
                        Set up your practice in minutes. No credit card required.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Dr. Jane Smith"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="form-label">Work Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@practice.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Min. 8 characters"
                                required
                            />
                        </div>

                        <div>
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder="Repeat your password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="alert alert-error" style={{ fontSize: 13 }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%", padding: "11px", fontSize: 14, justifyContent: "center" }}
                            disabled={loading}
                        >
                            {loading
                                ? <><span className="spinner" /> Creating account…</>
                                : "Get Started →"
                            }
                        </button>
                    </form>
                </div>

                {/* Sign in link */}
                <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <a href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
