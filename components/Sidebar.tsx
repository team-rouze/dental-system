"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
    {
        section: "Data",
        links: [
            { href: "/integration", label: "PMS Connection", icon: "🔌" },
            { href: "/dashboard", label: "Sync Dashboard", icon: "📊" },
            { href: "/patients", label: "Patients", icon: "👥" },
        ],
    },
    {
        section: "Intelligence",
        links: [
            { href: "/segmentation", label: "Segmentation", icon: "🧠" },
            { href: "/audit", label: "Revenue Audit", icon: "💰" },
            { href: "/automations", label: "Automations", icon: "⚡" },
            { href: "/reminders", label: "Confirmations", icon: "📅" },
            { href: "/reschedule", label: "Reschedule Recovery", icon: "🔁" },
        ],
    },
    {
        section: "Compliance",
        links: [
            { href: "/compliance", label: "Compliance Overview", icon: "🛡️" },
            { href: "/compliance/suppression", label: "Suppression List", icon: "🚫" },
            { href: "/compliance/audit", label: "Audit Log", icon: "📋" },
        ],
    },
    {
        section: "Infrastructure",
        links: [
            { href: "/messaging", label: "Smart Messaging", icon: "💬" },
            { href: "/settings", label: "Workflow Settings", icon: "⚙️" },
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
            <div className="sidebar-logo">
                <h2>Rouze DS™</h2>
                <span>Revenue Reactivation</span>
            </div>

            {navItems.map((section) => (
                <div key={section.section} className="sidebar-section">
                    <div className="sidebar-section-label">{section.section}</div>
                    {section.links.map((link) => {
                        // Hide admin-only links from staff
                        if (link.href === "/settings" && role !== "admin") return null;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
                            >
                                <span className="icon">{link.icon}</span>
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
                    borderTop: "1px solid var(--border)",
                }}>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{email}</div>
                        <span
                            className={`badge ${role === "admin" ? "badge-success" : ""}`}
                            style={{ fontSize: 10, marginTop: 4, display: "inline-block" }}
                        >
                            {role === "admin" ? "Admin" : "Staff"}
                        </span>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="btn btn-outline"
                        style={{ width: "100%", fontSize: 12, padding: "6px" }}
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </aside>
    );
}
