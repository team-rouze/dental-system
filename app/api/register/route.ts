import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { userStore } from "@/lib/db/store";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { name, email, password } = body as {
        name?: string;
        email?: string;
        password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json(
            { error: "Password must be at least 8 characters." },
            { status: 400 }
        );
    }

    const existing = userStore.getByEmail(email.trim());
    if (existing) {
        return NextResponse.json(
            { error: "An account with this email already exists." },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    userStore.create({ name: name.trim(), email: email.trim(), passwordHash });

    return NextResponse.json({ ok: true });
}
