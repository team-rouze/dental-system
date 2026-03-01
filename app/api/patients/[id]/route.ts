import { NextRequest, NextResponse } from "next/server";
import { patientStore, consentRecordStore } from "@/lib/db/store";
import { updateConsent, processOptOut } from "@/lib/compliance/consentEngine";
import type { ContactChannel, ConsentState } from "@/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const patient = patientStore.getById(id);
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const smsConsent = consentRecordStore.get(id, "sms");
    const emailConsent = consentRecordStore.get(id, "email");

    return NextResponse.json({
        patient,
        consent: {
            sms: smsConsent?.state ?? "unknown",
            email: emailConsent?.state ?? "unknown",
        },
    });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();
    const { channel, newState, actor } = body as {
        channel: ContactChannel;
        newState: ConsentState;
        actor: string;
    };

    if (!channel || !newState) {
        return NextResponse.json({ error: "Missing channel or newState" }, { status: 400 });
    }

    if (newState === "opted_out" && actor === "patient_reply") {
        processOptOut(id, channel);
    } else {
        updateConsent(id, channel, newState, actor ?? "staff");
    }

    return NextResponse.json({ success: true });
}
