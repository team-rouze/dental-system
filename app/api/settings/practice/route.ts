import { NextResponse } from "next/server";
import { practiceStore } from "@/lib/db/store";

export async function GET() {
    return NextResponse.json(practiceStore.get());
}

export async function PATCH(req: Request) {
    const body = await req.json();

    // Validate reminder timing: must be descending and positive
    const { reminderTouch1Hours: t1, reminderTouch2Hours: t2, reminderTouch3Hours: t3 } = body;
    if (t1 !== undefined || t2 !== undefined || t3 !== undefined) {
        const current = practiceStore.get();
        const nt1 = t1 ?? current.reminderTouch1Hours;
        const nt2 = t2 ?? current.reminderTouch2Hours;
        const nt3 = t3 ?? current.reminderTouch3Hours;

        if (nt1 <= nt2 || nt2 <= nt3 || nt3 <= 0) {
            return NextResponse.json(
                { error: "Reminder timing must be descending and greater than 0 (e.g. 48h > 24h > 4h)" },
                { status: 400 }
            );
        }
    }

    practiceStore.update(body);
    return NextResponse.json(practiceStore.get());
}
