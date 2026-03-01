import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { userStore } from "@/lib/db/store";

export async function POST() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Reset the flag in the in-memory store
    const user = userStore.getById(session.user.id);
    if (user) {
        userStore.upsert({ ...user, onboardingComplete: false });
    }

    // Clear the onboarding_complete cookie
    const response = NextResponse.json({ ok: true });
    response.cookies.set("onboarding_complete", "", {
        path: "/",
        maxAge: 0, // expires immediately
    });
    return response;
}
