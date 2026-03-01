import { NextResponse, NextRequest } from "next/server";
import { syncAutomations } from "@/lib/automations/automationEngine";

export async function POST(req: NextRequest) {
    try {
        const { simulationDaysForward } = await req.json();

        // Fire the core loop (sync eligible patients -> process steps)
        syncAutomations(simulationDaysForward || 0);

        return NextResponse.json({ success: true, message: `Automation tick complete. Offset: +${simulationDaysForward || 0} days` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
