import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { userStore } from "@/lib/db/store";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const email = credentials?.email as string;
                const password = credentials?.password as string;
                if (!email || !password) return null;

                const user = userStore.getByEmail(email);
                if (!user) return null;

                const valid = await bcrypt.compare(password, user.passwordHash);
                if (!valid) return null;

                return {
                    id: user.id ?? "",
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    tenantId: user.tenantId,
                };
            },
        }),
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id ?? "";
                token.role = (user as any).role;
                token.tenantId = (user as any).tenantId;
            }
            return token;
        },
        session: async ({ session, token }) => {
            session.user.id = token.id as string;
            (session.user as any).role = token.role;
            (session.user as any).tenantId = token.tenantId;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET ?? "dev-secret-change-in-production",
});
