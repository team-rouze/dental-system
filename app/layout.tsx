import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import { cookies, headers } from "next/headers";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
    title: "Rouze Dental — Revenue Reactivation Platform",
    description: "Recover lost revenue and prevent future leakage for your dental practice.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const cookieStore = await cookies();
    const headersList = await headers();

    // Mirror the same dual-check as middleware:
    // cookie is set instantly on completion; JWT lags until next sign-in.
    const cookieDone = cookieStore.get("onboarding_complete")?.value === "1";
    const jwtDone = (session?.user as any)?.onboardingComplete === true;
    const onboardingComplete = cookieDone || jwtDone;

    // Landing page is public — never show the sidebar regardless of auth state
    const isLanding = headersList.get("x-is-landing") === "1";

    return (
        <html lang="en">
            <body>
                <Providers session={session}>
                    {session && onboardingComplete && !isLanding ? (
                        <div className="layout">
                            <Sidebar />
                            <div className="main">{children}</div>
                        </div>
                    ) : (
                        children
                    )}
                </Providers>
            </body>
        </html>
    );
}
