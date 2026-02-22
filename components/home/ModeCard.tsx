import { ModeConfig, getImageForDay } from './types';
import Image from 'next/image';

interface ModeCardProps {
    mode: ModeConfig;
    currentDay: number;
}

export default function ModeCard({ mode, currentDay }: ModeCardProps) {
    const selectedImage = getImageForDay(mode.imageOverride, currentDay);

    return (
        <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
            {/* Outer rings - สีเปลี่ยนตาม theme */}
            <div
                className="absolute inset-0 rounded-full m-[-18px]"
                style={{
                    border: `6px solid ${mode.ringColor}80`,
                    transition: 'border-color 0.5s ease',
                }}
            />
            <div
                className="absolute inset-0 rounded-full m-[-8px]"
                style={{
                    border: `6px solid ${mode.ringColor}B3`,
                    transition: 'border-color 0.5s ease',
                }}
            />
            <div className="absolute inset-0 rounded-full border-[10px] border-white/90 shadow-xl m-[2px]" />

            <div className="w-full h-full rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center animate-fade-in-scale z-10">
                {/* Inner Circle - สีเปลี่ยนตาม theme */}
                <div
                    className="w-[88%] h-[88%] rounded-full flex flex-col items-center justify-center shadow-inner overflow-hidden relative group cursor-pointer hover:shadow-lg transition-all"
                    style={{
                        backgroundColor: mode.cardBg,
                        border: `4px solid ${mode.ringColor}50`,
                        transition: 'background-color 0.5s ease, border-color 0.5s ease',
                    }}
                >
                    {/* Character/Icon/Image */}
                    <div className="relative z-10 flex flex-col items-center">
                        {selectedImage ? (
                            <div className="relative w-[380px] h-[380px] md:w-[520px] md:h-[520px] transform group-hover:scale-105 transition-transform duration-300">
                                <Image
                                    src={selectedImage}
                                    alt={mode.title}
                                    fill
                                    className="object-contain drop-shadow-lg"
                                />
                            </div>
                        ) : (
                            <div className="text-7xl md:text-8xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                                {mode.icon}
                            </div>
                        )}
                        <span className="text-xs text-gray-400 font-medium absolute -bottom-8">แตะเพื่อดูรายละเอียด</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
