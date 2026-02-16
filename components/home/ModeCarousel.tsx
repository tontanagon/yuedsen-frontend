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
}

export default function ModeCarousel({
    modes,
    currentIndex,
    currentMode,
    onNext,
    onPrev,
    onSelectMode,
    savedDate
}: ModeCarouselProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl relative z-10 my-4">

            <div className="flex items-center justify-center gap-2 md:gap-8 w-full">
                {/* Left Arrow */}
                <button
                    onClick={onPrev}
                    className="p-3 md:p-4 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all shadow-sm hover:scale-105 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-gray-600 group-hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Central Circle Card */}
                <ModeCard key={currentIndex} mode={currentMode} />

                {/* Right Arrow */}
                <button
                    onClick={onNext}
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
                        onClick={() => onSelectMode(i)}
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
    );
}
