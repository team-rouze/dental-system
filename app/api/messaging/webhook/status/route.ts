import { NextResponse, NextRequest } from "next/server";
import { handleDeliveryWebhook } from "@/lib/messaging/cadenceEngine";

export async function POST(req: NextRequest) {
    try {
        // Twilio sends data as URL-encoded form data
        const formData = await req.formData();

        const messageStatus = formData.get("MessageStatus") as string;
        const messageSid = formData.get("MessageSid") as string;

        if (messageSid && messageStatus) {
            handleDeliveryWebhook(messageSid, messageStatus);
        }

        // Twilio expects a 200 OK response with empty XML or string to acknowledge receipt
        return new NextResponse("<Response></Response>", {
            status: 200,
            headers: { "Content-Type": "text/xml" }
        });
    } catch (error) {
        console.error("Twilio Status Webhook Error:", error);
        return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
    }
}
