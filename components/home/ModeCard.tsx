import { ModeConfig } from './types';

interface ModeCardProps {
    mode: ModeConfig;
}

export default function ModeCard({ mode }: ModeCardProps) {
    return (
        <div className="relative w-64 h-64 md:w-96 md:h-96 perspective-1000">
            <div
                className="w-full h-full rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white/60 animate-fade-in-scale"
            >
                {/* Inner White Circle */}
                <div className="w-[85%] h-[85%] bg-white rounded-full flex flex-col items-center justify-center shadow-inner p-6 overflow-hidden relative group cursor-pointer hover:shadow-lg transition-shadow">

                    {/* Decorative background blob inside */}
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${mode.bgColor} rounded-full opacity-50 blur-xl transition-colors duration-500`}></div>

                    {/* Character/Icon Placeholder */}
                    <div className="relative z-10 flex flex-col items-center mb-6">
                        <div className="text-7xl md:text-8xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                            {mode.icon}
                        </div>
                        <span className="text-xs text-gray-400 font-medium absolute -bottom-8">แตะเพื่อดูรายละเอียด</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
