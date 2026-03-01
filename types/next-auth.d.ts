import "next-auth";
import "next-auth/jwt";
import type { UserRole } from "@/types";

declare module "next-auth" {
    interface User {
        role: UserRole;
        tenantId: string;
        onboardingComplete: boolean;
    }
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
            tenantId: string;
            onboardingComplete: boolean;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: UserRole;
        tenantId: string;
        onboardingComplete: boolean;
    }
}
