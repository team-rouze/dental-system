"use client";

import type { ConsentState, ContactChannel } from "@/types";

interface ConsentBadgeProps {
    state: ConsentState;
    channel?: ContactChannel;
    showChannel?: boolean;
}

const stateConfig: Record<ConsentState, { emoji: string; label: string; className: string }> = {
    opted_in: { emoji: "✅", label: "Opted In", className: "consent-opted-in" },
    opted_out: { emoji: "🚫", label: "Opted Out", className: "consent-opted-out" },
    unknown: { emoji: "⚠️", label: "Unknown", className: "consent-unknown" },
    restricted: { emoji: "⛔", label: "Restricted", className: "consent-restricted" },
    do_not_contact: { emoji: "🛑", label: "Do Not Contact", className: "consent-dnc" },
};

export default function ConsentBadge({ state, channel, showChannel = false }: ConsentBadgeProps) {
    const config = stateConfig[state] ?? stateConfig.unknown;
    return (
        <span className={`consent-badge ${config.className}`}>
            {config.emoji}
            {showChannel && channel && <span style={{ opacity: 0.7, marginRight: 2 }}>{channel.toUpperCase()}</span>}
            {config.label}
        </span>
    );
}
