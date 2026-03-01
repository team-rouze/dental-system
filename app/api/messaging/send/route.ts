import { NextResponse, NextRequest } from "next/server";
import { messageStore } from "@/lib/db/store";
import { processMessageQueue } from "@/lib/messaging/cadenceEngine";

export async function POST(req: NextRequest) {
    try {
        const { patientId, text, campaignId } = await req.json();

        if (!patientId || !text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        messageStore.upsert({
            id: `msg_out_${Date.now()}`,
            patientId,
            campaignId: campaignId || null,
            content: text,
            status: "scheduled",
            direction: "outbound",
            scheduledFor: new Date().toISOString(), // send immediately
            sentAt: null,
            twilioSid: null,
            error: null,
        });

        // trigger queue processor asynchronously (do not await)
        processMessageQueue().catch(console.error);

        return NextResponse.json({ success: true, message: "Queued for sending" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
