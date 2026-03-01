"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
    {
        section: "Data",
        links: [
            { href: "/integration", label: "PMS Connection" },
            { href: "/dashboard", label: "Sync Dashboard" },
            { href: "/patients", label: "Patients" },
        ],
    },
    {
        section: "Intelligence",
        links: [
            { href: "/segmentation", label: "Segmentation" },
            { href: "/audit", label: "Revenue Audit" },
            { href: "/automations", label: "Automations" },
            { href: "/reminders", label: "Confirmations" },
            { href: "/reschedule", label: "Reschedule Recovery" },
        ],
    },
    {
        section: "Compliance",
        links: [
            { href: "/compliance", label: "Compliance Overview" },
            { href: "/compliance/suppression", label: "Suppression List" },
            { href: "/compliance/audit", label: "Audit Log" },
        ],
    },
    {
        section: "Infrastructure",
        links: [
            { href: "/messaging", label: "Smart Messaging" },
            { href: "/settings", label: "Workflow Settings" },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const role = (session?.user as any)?.role as string | undefined;
    const name = session?.user?.name ?? "User";
    const email = session?.user?.email ?? "";

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Rouze Dental" style={{ width: 34, height: 34, objectFit: "contain" }} />
                <div className="sidebar-logo-text">
                    <h2>Rouze Dental</h2>
                    <span>Revenue Reactivation</span>
                </div>
            </div>

            {navItems.map((section) => (
                <div key={section.section} className="sidebar-section">
                    <div className="sidebar-section-label">{section.section}</div>
                    {section.links.map((link) => {
                        if (link.href === "/settings" && role !== "admin") return null;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            ))}

            {/* User info + logout */}
            {session && (
                <div style={{
                    marginTop: "auto",
                    padding: "16px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                }}>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sidebar-user-text)" }}>{name}</div>
                        <div style={{ fontSize: 11, color: "var(--sidebar-user-muted)", marginTop: 2 }}>{email}</div>
                        <span
                            className={`badge ${role === "admin" ? "badge-accent" : "badge-muted"}`}
                            style={{ fontSize: 10, marginTop: 4, display: "inline-block" }}
                        >
                            {role === "admin" ? "Admin" : "Staff"}
                        </span>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        style={{
                            width: "100%",
                            fontSize: 12,
                            padding: "7px",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--sidebar-text)",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontWeight: 500,
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </aside>
    );
}
