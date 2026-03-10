"use client";

import { useState } from 'react';
import { ModeConfig } from './types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';
import Image from 'next/image';

interface HeaderProps {
    currentMode: ModeConfig;
    onOpenSettings?: () => void;
}

export default function Header({ currentMode, onOpenSettings }: HeaderProps) {
    const { data: session } = authClient.useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        setDropdownOpen(false);
        apiClient.clearToken();         // ล้าง JWT cookie
        await authClient.signOut();     // ล้าง better-auth session
        router.push('/login');
    };

    const handleOpenSettings = () => {
        setDropdownOpen(false);
        onOpenSettings?.();
    };

    return (
        <div className="w-full h-28 max-w-5xl mt-2 relative z-50 px-4">

            {/* Top Center: Title & Dynamic Subtitle */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-2 md:top-4 text-center w-full max-w-2xl pointer-events-none z-0 flex flex-col items-center gap-0.5">
                <h1
                    className="text-5xl md:text-7xl font-black text-white tracking-widest"
                    style={{
                        textShadow: `0 4px 6px rgba(0,0,0,0.1), -2px -2px 0 ${currentMode.strokeColor}, 2px -2px 0 ${currentMode.strokeColor}, -2px 2px 0 ${currentMode.strokeColor}, 2px 2px 0 ${currentMode.strokeColor}, 0 3px 0 ${currentMode.strokeColor}`,
                        WebkitTextStroke: `2px ${currentMode.strokeColor}`,
                        transition: 'text-shadow 0.5s ease, -webkit-text-stroke 0.5s ease',
                    }}
                >
                    YUEDSEN
                </h1>
                <div className="overflow-hidden">
                    <p
                        key={currentMode.title}
                        className="text-2xl md:text-3xl font-semibold animate-slide-up tracking-wide"
                        style={{ color: currentMode.themeColor, transition: 'color 0.5s ease' }}
                    >
                        {currentMode.title}
                    </p>
                </div>
            </div>

            {/* Top Right: User Profile or Login Button */}
            <div className="absolute right-4 md:right-8 top-4 md:top-6 z-[100]">
                {session ? (
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg border-2 border-white/40 overflow-hidden hover:scale-105 transition-all duration-300`}
                        >
                            <Image
                                src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name ?? 'User')}&background=random&color=fff`}
                                alt={session.user.name ?? 'User Profile'}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl overflow-hidden z-[100]">
                                <button
                                    onClick={handleOpenSettings}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    ตั้งค่า
                                </button>
                                <div className="border-t border-gray-100" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    ออกจากระบบ
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login">
                        <button
                            className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 ${currentMode.buttonColor} rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 border-2 border-white/40 backdrop-blur-sm`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-white font-bold text-sm md:text-base tracking-wide hidden sm:inline">Login</span>
                        </button>
                    </Link>
                )}
            </div>

        </div>
    );
}

