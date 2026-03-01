import { NextResponse, NextRequest } from "next/server";
import { campaignStore, enrollmentStore } from "@/lib/db/store";
import { syncAutomations } from "@/lib/automations/automationEngine";
import { initializeCampaigns } from "@/lib/automations/campaignTemplates";

export async function GET() {
    initializeCampaigns();
    const campaigns = campaignStore.getAll();
    const allEnrollments = enrollmentStore.getAll();

    const augmented = campaigns.map(c => {
        const enrollments = allEnrollments.filter(e => e.campaignId === c.id);
        return {
            ...c,
            stats: {
                totalTargeted: enrollments.length,
                inProgress: enrollments.filter(e => e.status === "in_progress" || e.status === "enrolled").length,
                completed: enrollments.filter(e => e.status === "completed").length,
                pausedReply: enrollments.filter(e => e.status === "paused_reply").length,
            }
        };
    });

    return NextResponse.json(augmented);
}

export async function POST(req: NextRequest) {
    try {
        initializeCampaigns();
        const { id, status } = await req.json();

        const campaign = campaignStore.getById(id);
        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        campaign.status = status;
        campaignStore.upsert(campaign);

        // If activating, immediately run a sync to catch up on any eligible patients
        if (status === "active") {
            syncAutomations(0);
        }

        return NextResponse.json({ success: true, campaign });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
