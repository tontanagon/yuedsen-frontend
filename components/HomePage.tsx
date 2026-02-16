"use client";

import { useState, useEffect } from 'react';
import { modes } from './home/types';
import LoadingScreen from './home/LoadingScreen';
import Header from './home/Header';
import ModeCarousel from './home/ModeCarousel';
import NavItem from './home/NavItem';

const HomePage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [savedDate, setSavedDate] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const currentMode = modes[currentIndex];

    // Load saved date from localStorage on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            const storedDate = localStorage.getItem('user_current_date');
            if (storedDate) {
                setSavedDate(parseInt(storedDate, 10));
            } else {
                localStorage.setItem('user_current_date', '1');
            }
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

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
        <div className={`min-h-screen ${currentMode.bgColor} transition-colors duration-500 flex flex-col items-center justify-between p-4 md:p-6 font-sans text-gray-800 overflow-hidden relative gap-5`}>

            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white opacity-20 rounded-full blur-3xl"></div>
            </div>

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
            />

            {/* Footer Navigation */}
            <div className="w-full max-w-3xl flex justify-around items-end mb-4 md:mb-8 z-10">
                <NavItem
                    icon="bar_chart"
                    label="Dashboard"
                    color={currentMode.buttonColor}
                />
                <NavItem
                    icon="star"
                    label="Score"
                    color={currentMode.buttonColor}
                    size="large"
                />
                <NavItem
                    icon="lightbulb"
                    label="ความรู้"
                    color={currentMode.buttonColor}
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
