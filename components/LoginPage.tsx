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
        <div className="login-page-wrapper">
            {/* Animated background */}
            <div className="login-bg">
                <div className="login-blob login-blob-1"></div>
                <div className="login-blob login-blob-2"></div>
                <div className="login-blob login-blob-3"></div>
            </div>

            {/* Back button */}
            <Link href="/" className="login-back-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>กลับหน้าหลัก</span>
            </Link>

            {/* Modal Card */}
            <div className="login-modal">
                {/* Logo / Icon */}
                <div className="login-logo-wrap">
                    <div className="login-logo">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" width="32" height="32">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <div className="login-title-section">
                    <h1 className="login-title">ยินดีต้อนรับ</h1>
                    <p className="login-subtitle">เข้าสู่ระบบเพื่อเริ่มต้นการเรียนรู้</p>
                </div>

                {/* Brand name */}
                <div className="login-brand">YUEDSEN</div>

                {/* Error */}
                {error && (
                    <div className="login-error">
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
                    className={`login-google-btn${isLoading ? " loading" : ""}`}
                >
                    {isLoading ? (
                        <div className="login-spinner"></div>
                    ) : (
                        <svg className="google-icon" viewBox="0 0 24 24" width="22" height="22">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    )}
                    <span>{isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Google"}</span>
                </button>

                {/* Divider */}
                <div className="login-divider">
                    <span>หรือ</span>
                </div>

                {/* Terms */}
                <p className="login-terms">
                    การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
                    <a href="#">เงื่อนไขการใช้งาน</a>{" "}และ{" "}
                    <a href="#">นโยบายความเป็นส่วนตัว</a>
                </p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

                .login-page-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Outfit', sans-serif;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
                    position: relative;
                    overflow: hidden;
                    padding: 20px;
                }

                /* === Animated Blobs === */
                .login-bg {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 0;
                }
                .login-blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.35;
                    animation: blobFloat 8s ease-in-out infinite alternate;
                }
                .login-blob-1 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, #7c3aed, #4f46e5);
                    top: -100px; left: -100px;
                    animation-delay: 0s;
                }
                .login-blob-2 {
                    width: 350px; height: 350px;
                    background: radial-gradient(circle, #0ea5e9, #06b6d4);
                    bottom: -80px; right: -80px;
                    animation-delay: 3s;
                }
                .login-blob-3 {
                    width: 250px; height: 250px;
                    background: radial-gradient(circle, #ec4899, #f43f5e);
                    top: 50%; left: 60%;
                    animation-delay: 5s;
                    opacity: 0.2;
                }
                @keyframes blobFloat {
                    0% { transform: translate(0, 0) scale(1); }
                    100% { transform: translate(30px, 20px) scale(1.08); }
                }

                /* === Back Button === */
                .login-back-btn {
                    position: absolute;
                    top: 24px;
                    left: 24px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255,255,255,0.75);
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    z-index: 10;
                    padding: 8px 16px;
                    border-radius: 50px;
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.15);
                    transition: all 0.3s ease;
                }
                .login-back-btn:hover {
                    background: rgba(255,255,255,0.15);
                    color: white;
                    transform: translateX(-3px);
                }

                /* === Modal Card === */
                .login-modal {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 420px;
                    background: rgba(255, 255, 255, 0.07);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    border-radius: 28px;
                    padding: 48px 40px 40px;
                    box-shadow:
                        0 25px 50px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255,255,255,0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    animation: modalAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes modalAppear {
                    from { opacity: 0; transform: translateY(30px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* === Logo === */
                .login-logo-wrap {
                    display: flex;
                    justify-content: center;
                }
                .login-logo {
                    width: 72px;
                    height: 72px;
                    background: linear-gradient(135deg, #7c3aed, #4f46e5);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.5);
                    animation: logoPulse 2.5s ease-in-out infinite;
                }
                @keyframes logoPulse {
                    0%, 100% { box-shadow: 0 8px 24px rgba(124, 58, 237, 0.5); }
                    50% { box-shadow: 0 8px 40px rgba(124, 58, 237, 0.8); }
                }

                /* === Text === */
                .login-title-section {
                    text-align: center;
                }
                .login-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: white;
                    margin: 0 0 6px;
                    letter-spacing: -0.5px;
                }
                .login-subtitle {
                    font-size: 14px;
                    color: rgba(255,255,255,0.55);
                    margin: 0;
                    font-weight: 400;
                }
                .login-brand {
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 4px;
                    color: rgba(255,255,255,0.25);
                    text-transform: uppercase;
                }

                /* === Error === */
                .login-error {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    color: #fca5a5;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-size: 13px;
                    animation: shake 0.4s ease;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }

                /* === Google Button === */
                .login-google-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 15px 24px;
                    background: white;
                    color: #1f1f1f;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: 'Outfit', sans-serif;
                    border: none;
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    position: relative;
                    overflow: hidden;
                }
                .login-google-btn::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    transition: left 0.5s ease;
                }
                .login-google-btn:hover::before {
                    left: 100%;
                }
                .login-google-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                }
                .login-google-btn:active {
                    transform: translateY(0);
                }
                .login-google-btn.loading {
                    background: rgba(255,255,255,0.15);
                    color: rgba(255,255,255,0.7);
                    cursor: not-allowed;
                }
                .login-google-btn:disabled {
                    pointer-events: none;
                }

                /* === Spinner === */
                .login-spinner {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* === Divider === */
                .login-divider {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: rgba(255,255,255,0.3);
                    font-size: 12px;
                }
                .login-divider::before,
                .login-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: rgba(255,255,255,0.12);
                }

                /* === Terms === */
                .login-terms {
                    font-size: 12px;
                    color: rgba(255,255,255,0.35);
                    text-align: center;
                    line-height: 1.6;
                    margin: 0;
                }
                .login-terms a {
                    color: rgba(167, 139, 250, 0.8);
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .login-terms a:hover {
                    color: rgba(167, 139, 250, 1);
                    text-decoration: underline;
                }

                /* === Responsive === */
                @media (max-width: 480px) {
                    .login-modal {
                        padding: 36px 24px 32px;
                        border-radius: 20px;
                    }
                    .login-title { font-size: 24px; }
                }
            `}</style>
        </div>
    );
}
