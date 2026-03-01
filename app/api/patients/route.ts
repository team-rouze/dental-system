import { NextResponse } from "next/server";
import { patientStore } from "@/lib/db/store";

export async function GET() {
    const patients = patientStore.getAll();
    return NextResponse.json({ patients, total: patients.length });
}
