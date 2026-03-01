import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { userStore } from "@/lib/db/store";

export async function POST() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    userStore.setOnboardingComplete(session.user.id);

    // Set a lightweight cookie so the middleware can pass the user through
    // immediately — no JWT refresh round-trip required.
    const response = NextResponse.json({ ok: true });
    response.cookies.set("onboarding_complete", "1", {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return response;
}
