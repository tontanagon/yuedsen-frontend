import { ModeConfig } from './types';

interface HeaderProps {
    currentMode: ModeConfig;
}

export default function Header({ currentMode }: HeaderProps) {
    return (
        <div className="w-full flex justify-between items-start max-w-5xl mt-2 mb-12 relative z-10 px-4">
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
                    เหม่งเอ็กเซชายยยยย55555555
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

            {/* Top Right: Placeholder for layout balance */}
            <div className="w-14 md:w-16 hidden md:block"></div>
        </div>
    );
}
