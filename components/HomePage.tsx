"use client";

import { useState, useEffect } from 'react';
import { modes } from './home/types';
import LoadingScreen from './home/LoadingScreen';
import Header from './home/Header';
import ModeCarousel from './home/ModeCarousel';
import NavItem from './home/NavItem';
import { apiClient } from '@/lib/api-client';

const HomePage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [savedDate, setSavedDate] = useState<number>(1);
    const [currentDay, setCurrentDay] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const [bgLoaded, setBgLoaded] = useState(false);
    const currentMode = modes[currentIndex];

    // Preload รูป background เมื่อเปลี่ยน mode
    useEffect(() => {
        setBgLoaded(false);
        const img = new window.Image();
        img.src = currentMode.background;
        img.onload = () => setBgLoaded(true);
        img.onerror = () => setBgLoaded(true);
    }, [currentMode.background]);

    // Load user progress from API on mount
    useEffect(() => {
        let isMounted = true;

        const fetchProgress = async () => {
            const token = apiClient.getToken();

            if (!token) {
                const storedDate = localStorage.getItem('user_current_date');
                if (isMounted) {
                    if (storedDate) {
                        const dateVal = parseInt(storedDate, 10);
                        setSavedDate(dateVal);
                        setCurrentDay(dateVal);
                    } else {
                        setSavedDate(1);
                        setCurrentDay(1);
                    }
                    setIsLoading(false);
                }
                return;
            }

            try {
                const data = await apiClient.get(`/game/plan?category_id=${currentMode.id + 1}`);
                if (isMounted && data && data.process) {
                    const progress = data.process.progress || 1;
                    setCurrentDay(progress);
                    setSavedDate(progress);
                    localStorage.setItem('user_current_date', progress.toString());
                }
            } catch (error) {
                console.error("Failed to fetch user progress:", error);
                const storedDate = localStorage.getItem('user_current_date');
                if (storedDate) {
                    const dateVal = parseInt(storedDate, 10);
                    setSavedDate(dateVal);
                    setCurrentDay(dateVal);
                } else {
                    setSavedDate(1);
                    setCurrentDay(1);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProgress();
        return () => { isMounted = false; };
    }, [currentMode.id]);

    const nextMode = () => {
        setCurrentIndex((prev) => (prev + 1) % modes.length);
    };

    const prevMode = () => {
        setCurrentIndex((prev) => (prev - 1 + modes.length) % modes.length);
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-between p-4 md:p-6 font-sans text-gray-800 overflow-hidden relative bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url('${currentMode.background}')`,
            }}
        >
            {/* Soft dark overlay ด้านล่างเพื่อให้ nav อ่านง่าย */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.0) 60%, rgba(0,0,0,0.15) 100%)',
                    transition: 'opacity 0.5s ease',
                    opacity: bgLoaded ? 1 : 0,
                }}
            />

            {/* Header Section */}
            <Header currentMode={currentMode} />

            {/* Main Content (Carousel) */}
            <ModeCarousel
                modes={modes}
                currentIndex={currentIndex}
                currentMode={currentMode}
                onNext={nextMode}
                onPrev={prevMode}
                onSelectMode={setCurrentIndex}
                savedDate={savedDate}
                currentDay={currentDay}
            />

            {/* Footer Navigation */}
            <div
                className="backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/80 px-10 py-4 mb-4 md:mb-8 z-10 flex justify-center items-center gap-10 md:gap-20"
                style={{ background: 'rgba(255,255,255,0.72)', transition: 'background 0.5s ease' }}
            >
                <NavItem
                    icon="bar_chart"
                    label="Dashboard"
                    color="bg-gradient-to-br from-[#53A0DF] to-[#3B80C0]"
                    labelColor={currentMode.strokeColor}
                />
                <NavItem
                    icon="star"
                    label="Score"
                    color={`bg-gradient-to-br ${currentMode.playBtnGradient}`}
                    href="/scoreboard"
                    labelColor={currentMode.strokeColor}
                />
                <NavItem
                    icon="lightbulb"
                    label="ความรู้"
                    color="bg-gradient-to-br from-[#ED8C57] to-[#E3662A]"
                    href="/knowledge"
                    labelColor={currentMode.strokeColor}
                />
            </div>

            {/* Inline Styles for Custom Animations */}
            <style jsx>{`
                @keyframes fade-in-scale {
                    0% { opacity: 0.5; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.3s ease-out forwards;
                }
                @keyframes slide-up {
                    0% { transform: translateY(100%); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </div>
    );
};

export default HomePage;
