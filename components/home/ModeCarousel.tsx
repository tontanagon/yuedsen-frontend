import { ModeConfig } from './types';
import ModeCard from './ModeCard';

interface ModeCarouselProps {
    modes: ModeConfig[];
    currentIndex: number;
    currentMode: ModeConfig;
    onNext: () => void;
    onPrev: () => void;
    onSelectMode: (index: number) => void;
    savedDate: number;
    currentDay: number; // เพิ่ม prop สำหรับวันที่ปัจจุบัน
}

export default function ModeCarousel({
    modes,
    currentIndex,
    currentMode,
    onNext,
    onPrev,
    onSelectMode,
    savedDate,
    currentDay // รับ currentDay
}: ModeCarouselProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl relative z-10 my-2 md:my-4 mt-4 md:mt-6">

            <div className="flex items-center justify-center gap-2 md:gap-8 w-full">
                {/* Left Arrow */}
                <button
                    onClick={onPrev}
                    className="p-3 md:p-5 rounded-full bg-gradient-to-br from-[#A5DABC] to-[#7BC69A] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_8px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-all group z-20 border-[3px] border-white/40"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Central Circle Card - ส่ง currentDay ไปด้วย */}
                <ModeCard key={currentIndex} mode={currentMode} currentDay={currentDay} />

                {/* Right Arrow */}
                <button
                    onClick={onNext}
                    className="p-3 md:p-5 rounded-full bg-gradient-to-br from-[#A5DABC] to-[#7BC69A] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_8px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-all group z-20 border-[3px] border-white/40"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Carousel Indicators */}
            <div className="flex gap-3 mt-3 md:mt-4 bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm">
                {modes.map((mode, i) => (
                    <div
                        key={mode.id}
                        onClick={() => onSelectMode(i)}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-full shadow-sm cursor-pointer transition-all duration-300 ${currentIndex === i ? `${currentMode.buttonColor} scale-125 ring-2 ring-white` : 'bg-white/70 hover:bg-white'}`}
                    ></div>
                ))}
            </div>

            {/* Start Game Button Container (with simple cloud-like backdrop and button) */}
            <div className="relative mt-4 flex justify-center items-center">
                {/* Cloud backdrop effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-80 h-16 md:h-20 bg-white/50 backdrop-blur-sm rounded-[100px] border border-white/60"></div>

                <button
                    onClick={() => window.location.href = '/game'}
                    className="relative z-10 flex items-center gap-3 bg-gradient-to-br from-[#6BC784] to-[#459E60] hover:from-[#76DC91] hover:to-[#4DB26C] text-white font-extrabold py-2.5 md:py-3 px-8 md:px-10 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.2)] border-2 border-white active:scale-95 transition-all group overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                    
                    {/* Play Icon Circle */}
                    <div className="bg-white rounded-full p-1 shadow-inner flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6 text-[#58B372] ml-0.5">
                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                        </svg>
                    </div>

                    <span className="text-xl md:text-2xl tracking-tight drop-shadow-sm flex items-center gap-2">
                        เริ่มเกม <span className="text-base md:text-xl font-semibold text-white/90">(Day {savedDate})</span>
                    </span>
                </button>
            </div>

        </div>
    );
}
