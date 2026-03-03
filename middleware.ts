import { auth } from "@/auth";
import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";

const ADMIN_ONLY = ["/settings"];

export default auth((req: NextAuthRequest) => {
    const { nextUrl, auth: session } = req;

    // Public routes: landing page, sign-up page, and registration API
    if (
        nextUrl.pathname.startsWith("/landing") ||
        nextUrl.pathname.startsWith("/signup") ||
        nextUrl.pathname.startsWith("/api/register")
    ) {
        const reqHeaders = new Headers(req.headers);
        if (nextUrl.pathname.startsWith("/landing")) {
            reqHeaders.set("x-is-landing", "1");
        }
        return NextResponse.next({ request: { headers: reqHeaders } });
    }

    // Not authenticated → redirect to login
    if (!session) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Don't apply the onboarding gate to API routes
    const isApiRoute = nextUrl.pathname.startsWith("/api/");

    // Fast path: check the lightweight cookie set by POST /api/onboarding/complete.
    // Falls back to the JWT claim (populated after the next sign-in).
    const cookieDone = req.cookies.get("onboarding_complete")?.value === "1";
    const jwtDone = (session.user as any)?.onboardingComplete === true;
    const onboardingComplete = cookieDone || jwtDone;

    if (!onboardingComplete && !nextUrl.pathname.startsWith("/onboarding") && !isApiRoute) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // RBAC: staff cannot access admin-only routes
    if (!isApiRoute && ADMIN_ONLY.some(path => nextUrl.pathname.startsWith(path))) {
        if (session.user.role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|css|js)$).*)"],
};
