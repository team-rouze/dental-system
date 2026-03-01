"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("Invalid email or password. Please try again.");
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-body)",
            padding: 24,
        }}>
            <div style={{ width: "100%", maxWidth: 420 }}>
                {/* Brand */}
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text)" }}>
                        Rouze DS™
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
                        Dental Revenue Reactivation System
                    </div>
                </div>

                {/* Card */}
                <div className="card">
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Sign in</h2>
                    <p className="text-sm text-muted" style={{ marginBottom: 24 }}>
                        Enter your practice credentials to continue.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label className="text-sm font-semibold block mb-2">Email</label>
                            <input
                                type="email"
                                className="input"
                                style={{ width: "100%" }}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@practice.com"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold block mb-2">Password</label>
                            <input
                                type="password"
                                className="input"
                                style={{ width: "100%" }}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="alert alert-error" style={{ fontSize: 14 }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%", padding: "10px", fontSize: 15 }}
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                {/* Demo credentials hint */}
                <div className="card" style={{ marginTop: 16, background: "var(--bg-body)", border: "1px solid var(--border)" }}>
                    <div className="text-sm font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
                        Demo Credentials
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "var(--text-muted)" }}>Admin</span>
                            <span style={{ fontFamily: "monospace" }}>admin@demo.com / admin123</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "var(--text-muted)" }}>Staff</span>
                            <span style={{ fontFamily: "monospace" }}>staff@demo.com / staff123</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
