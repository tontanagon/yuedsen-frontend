import { ModeConfig, getImageForDay } from './types';
import Image from 'next/image';

interface ModeCardProps {
    mode: ModeConfig;
    currentDay: number; // เพิ่ม prop สำหรับวันที่ปัจจุบัน
}

export default function ModeCard({ mode, currentDay }: ModeCardProps) {
    // เลือกรูปตามวันที่
    const selectedImage = getImageForDay(mode.imageOverride, currentDay);

    return (
        <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
            {/* Outer rings to mimic the concentric circles in the image */}
            <div className="absolute inset-0 rounded-full border-[6px] border-[#93DDAA]/50 m-[-18px]"></div>
            <div className="absolute inset-0 rounded-full border-[6px] border-[#68C58E]/70 m-[-8px]"></div>
            <div className="absolute inset-0 rounded-full border-[10px] border-white/90 shadow-xl m-[2px]"></div>
            
            <div
                className="w-full h-full rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center animate-fade-in-scale z-10"
            >
                {/* Inner White Circle */}
                <div className="w-[88%] h-[88%] bg-[#E8F8EE] rounded-full flex flex-col items-center justify-center shadow-inner overflow-hidden relative group cursor-pointer hover:shadow-lg transition-shadow border-4 border-[#76DC91]/30">


                    {/* Character/Icon/Image */}
                    <div className="relative z-10 flex flex-col items-center">
                        {selectedImage ? (
                            // แสดงรูปภาพที่เลือกตามวันที่
                            <div className="relative w-[380px] h-[380px] md:w-[520px] md:h-[520px] transform group-hover:scale-105 transition-transform duration-300">
                                <Image
                                    src={selectedImage}
                                    alt={mode.title}
                                    fill
                                    className="object-contain drop-shadow-lg"
                                />
                            </div>
                        ) : (
                            // แสดง emoji ถ้าไม่มีรูป
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
