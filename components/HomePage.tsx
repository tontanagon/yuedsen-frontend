
"use client";

import { useState, useEffect } from 'react';

const HomePage = () => {
    // Define the modes/pages for the carousel
    const modes = [
        {
            id: 0,
            title: "รักษา", // Treatment
            icon: "🩹",
            imageOverride: null, // You can add real images here later
            colorTheme: "red",
            bgColor: "bg-[#ffccb0]", 
            buttonColor: "bg-[#b30000]",
            accentColor: "text-red-700"
        },
        {
            id: 1,
            title: "ป้องกัน", // Prevention
            icon: "🛡️",
            imageOverride: null,
            colorTheme: "blue",
            bgColor: "bg-[#b0ccff]",
            buttonColor: "bg-[#0047b3]",
            accentColor: "text-blue-700"
        },
        {
            id: 2,
            title: "ปรับบุคลิกภาพ", // Personality/Posture
            icon: "🧘",
            imageOverride: null,
            colorTheme: "green",
            bgColor: "bg-[#b0ffcc]",
            buttonColor: "bg-[#00b347]",
            accentColor: "text-green-700"
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [savedDate, setSavedDate] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const currentMode = modes[currentIndex];

     // Load saved date from localStorage on mount
    useEffect(() => {
        // Simulate a short delay to show the loading state nicely
        const timer = setTimeout(() => {
            const storedDate = localStorage.getItem('user_current_date');
            if (storedDate) {
                setSavedDate(parseInt(storedDate, 10));
            } else {
                // Default to 1 if nothing is stored, and save it
                localStorage.setItem('user_current_date', '1');
            }
            setIsLoading(false);
        }, 1000); // 1 second delay

        return () => clearTimeout(timer);
    }, []);

    const nextMode = () => {
        setCurrentIndex((prev) => (prev + 1) % modes.length);
    };

    const prevMode = () => {
        setCurrentIndex((prev) => (prev - 1 + modes.length) % modes.length);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 font-sans">
                 <div className="relative w-24 h-24">
                     <div className="absolute top-0 left-0 w-full h-full border-4 border-red-200 rounded-full animate-ping"></div>
                     <div className="absolute top-0 left-0 w-full h-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">
                         🤕
                     </div>
                 </div>
                 <p className="mt-8 text-lg font-bold text-gray-600 animate-pulse">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

  return (
    <div className={`min-h-screen ${currentMode.bgColor} transition-colors duration-500 flex flex-col items-center justify-between p-4 md:p-6 font-sans text-gray-800 overflow-hidden relative`}>
      
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white opacity-20 rounded-full blur-3xl"></div>
      </div>

      {/* --- Header Section --- */}
      <div className="w-full flex justify-between items-start max-w-5xl mt-2 relative z-10 px-4">
        
        {/* Top Left: Mute Button */}
        {/* Adjusted: Added min-width to prevent squishing if title expands */}
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
        {/* Adjusted: Positioned absolutely in the center to maintain balance despite missing right element */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-2 md:top-4 text-center w-full max-w-[200px] md:max-w-md pointer-events-none z-0">
          <h1 className="text-2xl md:text-4xl font-black text-[#333] drop-shadow-md tracking-wide">
            เหม่งเอ็กเซชายยยยย
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

        {/* Top Right: Placeholder to balance the layout or empty if intentional */}
        {/* If the user wants to keep the spacing balanced, we can add an invisible div of the same size as the left button */}
        <div className="w-14 md:w-16 hidden md:block"></div> 
      </div>

      {/* --- Main Content (Carousel) --- */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl relative z-10 my-4">
        
        <div className="flex items-center justify-center gap-2 md:gap-8 w-full">
            {/* Left Arrow */}
            <button 
                onClick={prevMode}
                className="p-3 md:p-4 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all shadow-sm hover:scale-105 group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-gray-600 group-hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Central Circle Card Swiper */}
            <div className="relative w-64 h-64 md:w-96 md:h-96 perspective-1000">
                <div 
                    key={currentIndex}
                    className="w-full h-full rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white/60 animate-fade-in-scale"
                >
                    {/* Inner White Circle */}
                    <div className="w-[85%] h-[85%] bg-white rounded-full flex flex-col items-center justify-center shadow-inner p-6 overflow-hidden relative group cursor-pointer hover:shadow-lg transition-shadow">
                        
                        {/* Decorative background blob inside */}
                        <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${currentMode.bgColor} rounded-full opacity-50 blur-xl transition-colors duration-500`}></div>
                        
                        {/* Character/Icon Placeholder */}
                        <div className="relative z-10 flex flex-col items-center mb-6">
                             <div className="text-7xl md:text-8xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                                {currentMode.icon}
                             </div> 
                             {/* Removed Title here as requested */}
                             <span className="text-xs text-gray-400 font-medium absolute -bottom-8">แตะเพื่อดูรายละเอียด</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Arrow */}
            <button 
                onClick={nextMode}
                className="p-3 md:p-4 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all shadow-sm hover:scale-105 group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-gray-600 group-hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-3 mt-6 md:mt-10 bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm">
            {modes.map((mode, i) => (
                <div 
                    key={mode.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-full shadow-sm cursor-pointer transition-all duration-300 ${currentIndex === i ? `${currentMode.buttonColor} scale-125 ring-2 ring-white` : 'bg-white/70 hover:bg-white'}`}
                ></div>
            ))}
        </div>

        {/* Start Game Button */}
        <button 
            onClick={() => window.location.href = '/game'}
            className={`mt-8 md:mt-10 bg-gradient-to-br from-gray-100 to-gray-300 hover:from-white hover:to-gray-200 text-gray-800 font-extrabold py-3 md:py-4 px-16 md:px-20 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.15)] border-b-[6px] border-gray-400 active:border-b-0 active:translate-y-2 transition-all transform hover:-translate-y-1 group relative overflow-hidden`}
        >
            <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer`}></div>
            <span className="text-2xl md:text-3xl block tracking-tight">เริ่มเกม</span>
            <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">(วันที่ {savedDate})</span>
        </button>

      </div>

      {/* --- Footer Navigation --- */}
      <div className="w-full max-w-3xl flex justify-around items-end mb-4 md:mb-8 z-10">
          {/* Navigation Item: Chart/Rank */}
          <NavItem 
            icon="bar_chart" 
            label="Dashboard" 
            color={currentMode.buttonColor} 
          />

          {/* Navigation Item: Score */}
          <NavItem 
            icon="star" 
            label="Score" 
            color={currentMode.buttonColor} 
            size="large" 
          />

          {/* Navigation Item: Knowledge */}
          <NavItem 
            icon="lightbulb" 
            label="ความรู้" 
            color={currentMode.buttonColor} 
          />
      </div>

       {/* Inline Styles for Custom Animations (since we can't edit tailwind config directly easily) */}
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

// Helper Component for Footer Items
const NavItem = ({ icon, label, color, size = 'normal' }: { icon: string, label: string, color: string, size?: 'normal' | 'large' }) => {
    const isLarge = size === 'large';
    const sizeClasses = isLarge ? "w-20 h-20 md:w-24 md:h-24" : "w-16 h-16 md:w-20 md:h-20";
    const iconSize = isLarge ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl";

    return (
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className={`${sizeClasses} ${color} rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2 border-[5px] border-white ring-2 ring-black/5`}>
                 <span className={`text-white ${iconSize} drop-shadow-md`}>
                    {icon === 'bar_chart' && '📊'}
                    {icon === 'star' && '⭐'}
                    {icon === 'lightbulb' && '💡'}
                 </span>
            </div>
            <span className="font-bold text-gray-800 text-base md:text-lg group-hover:text-black transition-colors bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">{label}</span>
        </div>
    )
}

export default HomePage;
