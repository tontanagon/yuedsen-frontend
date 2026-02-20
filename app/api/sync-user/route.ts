import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Proxy endpoint: browser → /api/sync-user → Go backend
// response จะรวม JWT token จาก Go backend
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        // 1. Upsert user ลง Go backend database
        await fetch(`${backendUrl}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        // 2. เรียก endpoint ที่ return JWT (ใช้ email เพื่อดึง token)
        const tokenRes = await fetch(`${backendUrl}/users/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: body.email }),
        });

        if (tokenRes.ok) {
            const { token } = await tokenRes.json();
            return NextResponse.json({ token });
        }

        return NextResponse.json({ token: null });
    } catch (error) {
        console.error("[API/sync-user] Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
