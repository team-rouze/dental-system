import { NextResponse, NextRequest } from "next/server";
import { handleInboundReply } from "@/lib/messaging/cadenceEngine";
import { processOptOutFromReply } from "@/lib/compliance/consentEngine";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const fromPhone = formData.get("From") as string;
        const body = formData.get("Body") as string;

        if (fromPhone && body) {
            // 1. Check if patient replied STOP to update compliance engine
            processOptOutFromReply(fromPhone, body);

            // 2. Handle reply in the cadence engine (auto-pause active sequences)
            handleInboundReply(fromPhone, body);
        }

        return new NextResponse("<Response></Response>", {
            status: 200,
            headers: { "Content-Type": "text/xml" }
        });
    } catch (error) {
        console.error("Twilio Reply Webhook Error:", error);
        return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
    }
}
