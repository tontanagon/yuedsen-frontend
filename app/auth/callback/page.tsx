"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState("กำลังเข้าสู่ระบบ...");
    const didRun = useRef(false); // ป้องกัน double-run

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;

        let retryCount = 0;
        const MAX_RETRIES = 10; // รอสูงสุด 5 วินาที (10 × 500ms)

        const syncUserAndRedirect = async () => {
            try {
                const session = await authClient.getSession();
                const user = session.data?.user;

                if (!user) {
                    retryCount++;
                    if (retryCount >= MAX_RETRIES) {
                        // session ไม่มา redirect ไปหน้าหลักเลย
                        console.warn("[Callback] Session timeout — redirecting anyway");
                        router.replace("/");
                        return;
                    }
                    // ยังไม่มี session รอแล้วลองใหม่
                    setTimeout(syncUserAndRedirect, 500);
                    return; // ← ออกโดยไม่ redirect ที่นี่
                }

                // มี user แล้ว sync กับ backend
                setStatus("กำลังบันทึกข้อมูลผู้ใช้...");

                // เรียก Next.js API route (same origin → ไม่มี CORS)
                // Next.js server จะ forward ไปยัง backend แทน
                const response = await fetch(`/api/sync-user`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: user.name,
                        email: user.email,
                        password: "",
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.token) {
                        // เก็บ JWT ใน cookie (อายุ 3 วัน = 72 ชั่วโมง)
                        const expires = new Date(Date.now() + 72 * 60 * 60 * 1000).toUTCString();
                        document.cookie = `api_token=${data.token}; path=/; expires=${expires}; SameSite=Strict`;
                        console.log("✅ JWT token saved");
                    }
                } else {
                    console.log(`Backend response: ${response.status}`);
                }
            } catch (error) {
                console.error("[Callback] Error:", error);
            }

            // redirect เฉพาะตอนจบ flow จริงๆ (ไม่อยู่ใน finally)
            router.replace("/");
        };

        syncUserAndRedirect();
    }, [router]);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
            fontFamily: "'Outfit', sans-serif",
            color: "white",
            gap: "16px",
        }}>
            <div style={{
                width: "48px",
                height: "48px",
                border: "4px solid rgba(255,255,255,0.2)",
                borderTop: "4px solid #7c3aed",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", margin: 0 }}>
                {status}
            </p>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
