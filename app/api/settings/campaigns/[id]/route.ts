import { NextResponse } from "next/server";
import { campaignStore } from "@/lib/db/store";
import { initializeCampaigns } from "@/lib/automations/campaignTemplates";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    initializeCampaigns();

    const { id } = await params;
    const campaign = campaignStore.getById(id);
    if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const { steps } = await req.json();

    // Validation
    if (!Array.isArray(steps) || steps.length === 0) {
        return NextResponse.json({ error: "Steps must be a non-empty array" }, { status: 400 });
    }

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        if (!step.content || step.content.trim() === "") {
            return NextResponse.json({ error: `Step ${i + 1}: content cannot be empty` }, { status: 400 });
        }
        if (!step.content.includes("{{first_name}}")) {
            return NextResponse.json(
                { error: `Step ${i + 1}: message must include {{first_name}} (required variable)` },
                { status: 400 }
            );
        }
        if (typeof step.dayOffset !== "number" || step.dayOffset < 0) {
            return NextResponse.json({ error: `Step ${i + 1}: dayOffset must be 0 or greater` }, { status: 400 });
        }
        // Ensure offsets are non-decreasing
        if (i > 0 && step.dayOffset < steps[i - 1].dayOffset) {
            return NextResponse.json(
                { error: `Step ${i + 1}: day offset must be ≥ previous step (offsets must be in ascending order)` },
                { status: 400 }
            );
        }
    }

    campaign.steps = steps;
    campaignStore.upsert(campaign);

    return NextResponse.json(campaign);
}
