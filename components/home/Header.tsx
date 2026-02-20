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
        <div className="w-full flex justify-between items-start max-w-5xl mt-2 relative z-10 px-4">
            {/* Top Left: Mute Button */}
            <div className="flex flex-col items-center gap-2">
                <button
                    className={`w-14 h-14 md:w-16 md:h-16 ${currentMode.buttonColor} rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-white/30`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                </button>
            </div>

            {/* Top Center: Title & Dynamic Subtitle */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-2 md:top-4 text-center w-full max-w-[200px] md:max-w-md pointer-events-none z-0">
                <h1 className="text-2xl md:text-4xl font-black text-[#333] drop-shadow-md tracking-wide">
                    YUEDSEN
                </h1>
                <div className="overflow-hidden h-8 md:h-10 mt-1">
                    <p
                        key={currentMode.title}
                        className={`text-lg md:text-2xl font-bold ${currentMode.accentColor} animate-slide-up transition-colors duration-300`}
                    >
                        ({currentMode.title})
                    </p>
                </div>
            </div>

            {/* Top Right: User Profile or Login Button */}
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
    );
}
