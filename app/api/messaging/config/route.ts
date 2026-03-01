import { NextResponse, NextRequest } from "next/server";
import { configStore } from "@/lib/db/store";

export async function GET() {
    const config = configStore.getTwilioConfig();
    // Safe return without exposing full tokens directly on GET if desired, 
    // but for this MVP dashboard we can return it.
    return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        configStore.updateTwilioConfig(data);
        return NextResponse.json({ success: true, config: configStore.getTwilioConfig() });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
