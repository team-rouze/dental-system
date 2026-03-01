import { NextResponse } from "next/server";
import { initializeCampaigns } from "@/lib/automations/campaignTemplates";
import { getRescheduleStats, syncRescheduleRecovery } from "@/lib/automations/rescheduleEngine";

export async function GET() {
    initializeCampaigns();
    const data = getRescheduleStats();
    return NextResponse.json(data);
}

export async function POST() {
    initializeCampaigns();
    const result = syncRescheduleRecovery();
    const data = getRescheduleStats();
    return NextResponse.json({ ...data, syncResult: result });
}
