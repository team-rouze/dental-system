import { NextResponse } from "next/server";
import { runIncrementalSync } from "@/lib/pms/syncEngine";
import { patientStore } from "@/lib/db/store";

export async function POST() {
    const conn = patientStore.count();
    if (conn === 0) {
        return NextResponse.json({ error: "No data imported yet. Run initial import first." }, { status: 400 });
    }
    const log = await runIncrementalSync();
    return NextResponse.json({ success: log.phase === "success", log });
}
