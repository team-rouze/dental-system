import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
    title: "Dental Revenue Reactivation System™",
    description: "Recover lost revenue and prevent future leakage for your dental practice.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    return (
        <html lang="en">
            <body>
                <Providers session={session}>
                    {session ? (
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
