"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const errorParam = searchParams.get("error");
    const [status, setStatus] = useState("กำลังเข้าสู่ระบบ...");
    const didRun = useRef(false); // ป้องกัน double-run

    useEffect(() => {
        if (errorParam) return; // อย่ารันถ้ามี error param
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
    }, [router, errorParam]);

    if (errorParam) {
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
                padding: "24px",
                textAlign: "center"
            }}>
                <div style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: "40px",
                    borderRadius: "24px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    maxWidth: "400px",
                    width: "100%",
                }}>
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "rgba(239, 68, 68, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px auto",
                    }}>
                        <span style={{ fontSize: "32px" }}>⚠️</span>
                    </div>
                    <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 12px 0", color: "#f87171" }}>
                        Something went wrong
                    </h1>
                    <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", margin: "0 0 24px 0" }}>
                        CODE: <br />
                        <code style={{
                            background: "rgba(0,0,0,0.3)",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            display: "inline-block",
                            marginTop: "12px",
                            color: "#fff",
                            fontFamily: "monospace",
                            letterSpacing: "0.5px"
                        }}>
                            {errorParam}
                        </code>
                    </p>
                    <button
                        onClick={() => router.replace("/")}
                        style={{
                            background: "linear-gradient(to right, #7c3aed, #6d28d9)",
                            color: "white",
                            border: "none",
                            padding: "14px 24px",
                            borderRadius: "12px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                            width: "100%",
                            transition: "all 0.2s transform",
                            boxShadow: "0 4px 14px 0 rgba(124, 58, 237, 0.39)"
                        }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

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

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)"
            }}>
                <div style={{
                    width: "48px",
                    height: "48px",
                    border: "4px solid rgba(255,255,255,0.2)",
                    borderTop: "4px solid #7c3aed",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                }} />
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
