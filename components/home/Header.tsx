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
}

export default function Header({ currentMode }: HeaderProps) {
    const { data: session } = authClient.useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        setDropdownOpen(false);
        apiClient.clearToken();         // ล้าง JWT cookie
        await authClient.signOut();     // ล้าง better-auth session
        router.push('/login');
    };

    return (
        <div className="w-full h-20 max-w-5xl mt-2 relative z-10 px-4">

            {/* Top Center: Title & Dynamic Subtitle */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-2 md:top-4 text-center w-full max-w-2xl pointer-events-none z-0 flex flex-col items-center gap-0.5">
                <h1
                    className="text-3xl md:text-5xl font-black text-white tracking-widest"
                    style={{
                        textShadow: '0 4px 6px rgba(0,0,0,0.1), -2px -2px 0 #58B372, 2px -2px 0 #58B372, -2px 2px 0 #58B372, 2px 2px 0 #58B372, 0 3px 0 #459E60',
                        WebkitTextStroke: '2px #58B372'
                    }}
                >
                    YUEDSEN
                </h1>
                <div className="overflow-hidden">
                    <p
                        key={currentMode.title}
                        className="text-xl md:text-2xl font-semibold animate-slide-up tracking-wide"
                        style={{ color: '#58B372' }}
                    >
                        {currentMode.title}
                    </p>
                </div>
            </div>

            {/* Top Right: User Profile or Login Button */}
            <div className="absolute right-4 md:right-8 top-4 md:top-6 z-20">
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
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl overflow-hidden z-20">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                                >
                                    Logout
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
