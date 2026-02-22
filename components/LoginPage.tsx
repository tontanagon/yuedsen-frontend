"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/auth/callback",
            });
        } catch (err: any) {
            setError(err?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col font-sans overflow-hidden relative bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/background_home_heal.png')" }}
        >
            {/* Subtle white overlay */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] pointer-events-none" />

            {/* Back button - เหมือนหน้าความรู้ */}
            <div className="relative z-10 flex items-center gap-3 px-5 pt-10 pb-4">
                <Link href="/">
                    <button className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-full shadow-md flex items-center justify-center border border-white/80 hover:bg-white/90 transition-all duration-200 active:scale-95">
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#2A6546] to-[#3B9E6E] bg-clip-text text-transparent leading-tight">
                        เข้าสู่ระบบ
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">YUEDSEN — ระบบดูแลสุขภาพด้วย AI</p>
                </div>
            </div>

            {/* Center card */}
            <div className="flex-1 flex items-center justify-center px-4 pb-10 relative z-10">
                <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/70 p-8 flex flex-col items-center gap-6"
                    style={{ animation: "modalAppear 0.5s cubic-bezier(0.16,1,0.3,1) forwards" }}
                >
                    {/* Logo icon */}
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ background: "linear-gradient(135deg, #7BC69A, #459E60)" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" width="36" height="36">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <div className="text-center">
                        <h2 className="text-2xl font-extrabold text-gray-800 leading-tight">ยินดีต้อนรับ</h2>
                        <p className="text-sm text-gray-400 mt-1">เข้าสู่ระบบเพื่อเริ่มต้นการเรียนรู้</p>
                        <p className="text-xs font-bold tracking-[4px] text-gray-300 mt-2 uppercase">YUEDSEN</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="w-full flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Google Login Button */}
                    <button
                        id="google-login-btn"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                            <svg className="flex-shrink-0" viewBox="0 0 24 24" width="22" height="22">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        )}
                        <span className="text-gray-700 font-semibold text-sm">
                            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Google"}
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="w-full flex items-center gap-3 text-gray-300 text-xs">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span>หรือ</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-gray-400 text-center leading-relaxed">
                        การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
                        <a href="#" className="text-emerald-600 hover:underline font-medium">เงื่อนไขการใช้งาน</a>
                        {" "}และ{" "}
                        <a href="#" className="text-emerald-600 hover:underline font-medium">นโยบายความเป็นส่วนตัว</a>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes modalAppear {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1); }
                }
            `}</style>
        </div>
    );
}
