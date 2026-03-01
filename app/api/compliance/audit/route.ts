import { NextResponse } from "next/server";
import { auditLogStore } from "@/lib/db/store";

export async function GET() {
    const logs = auditLogStore.getAll();
    return NextResponse.json({ logs, total: logs.length });
}
