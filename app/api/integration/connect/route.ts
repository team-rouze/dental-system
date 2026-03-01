import { NextRequest, NextResponse } from "next/server";
import { connectionStore, syncLogStore, patientStore, appointmentStore, treatmentPlanStore } from "@/lib/db/store";
import { runInitialImport, setupConnection } from "@/lib/pms/syncEngine";
import type { PMSProvider } from "@/types";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { provider, apiKey, practiceId } = body as {
        provider: PMSProvider;
        apiKey: string;
        practiceId: string;
    };

    if (!provider || !apiKey || !practiceId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    setupConnection(provider, apiKey, practiceId);

    const log = await runInitialImport({ provider, apiKey, practiceId });

    return NextResponse.json({
        success: log.phase === "success",
        log,
        stats: {
            patients: patientStore.count(),
            appointments: appointmentStore.count(),
            treatmentPlans: treatmentPlanStore.count(),
        },
    });
}

export async function GET() {
    const connection = connectionStore.get();
    const logs = syncLogStore.getAll();
    return NextResponse.json({
        connection,
        recentLogs: logs.slice(0, 10),
        stats: {
            patients: patientStore.count(),
            appointments: appointmentStore.count(),
            treatmentPlans: treatmentPlanStore.count(),
        },
    });
}
