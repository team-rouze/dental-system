import { configStore } from "@/lib/db/store";

export interface TwilioSendResult {
    success: boolean;
    twilioSid?: string;
    error?: string;
}

export const sendSms = async (to: string, body: string): Promise<TwilioSendResult> => {
    const config = configStore.getTwilioConfig();

    // Sandbox / Local Dev mode logic
    if (config.isSandboxMode || !config.accountSid || !config.authToken) {
        console.log(`[Twilio Sandbox] Sending SMS to ${to}: "${body}"`);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));
        return {
            success: true,
            twilioSid: `SM_mock_${Math.random().toString(36).slice(2, 10)}`
        };
    }

    // Real Twilio API Call
    try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')
            },
            body: new URLSearchParams({
                To: to,
                From: config.phoneNumber || config.messagingServiceSid,
                Body: body
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to send message via Twilio");
        }

        return {
            success: true,
            twilioSid: data.sid
        };
    } catch (error: any) {
        console.error("[Twilio Adapter] Send Error:", error);
        return {
            success: false,
            error: error.message
        };
    }
};
