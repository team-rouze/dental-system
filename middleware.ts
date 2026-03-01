import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Admin-only routes — staff are redirected to dashboard
const ADMIN_ONLY = ["/settings"];

export default auth((req) => {
    const { nextUrl, auth: session } = req;

    // Not authenticated → redirect to login
    if (!session) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // RBAC: staff cannot access admin-only routes
    if (ADMIN_ONLY.some(path => nextUrl.pathname.startsWith(path))) {
        if (session.user.role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    // Protect everything except login, auth API, and Next.js internals
    matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
