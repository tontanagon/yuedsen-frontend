"use client";

import { useState, useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export type AccuracyMode = 'angle' | 'landmark';

export function getAccuracyMode(): AccuracyMode {
    if (typeof window === 'undefined') return 'angle';
    return (localStorage.getItem('accuracy_mode') as AccuracyMode) || 'angle';
}

export function setAccuracyMode(mode: AccuracyMode) {
    localStorage.setItem('accuracy_mode', mode);
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [mode, setMode] = useState<AccuracyMode>('angle');

    useEffect(() => {
        if (isOpen) {
            setMode(getAccuracyMode());
        }
    }, [isOpen]);

    const handleModeChange = (newMode: AccuracyMode) => {
        setMode(newMode);
        setAccuracyMode(newMode);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
            >
                <div
                    className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/80 w-full max-w-md pointer-events-auto"
                    style={{ animation: 'settingsAppear 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-800">ตั้งค่าเกม</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-5">
                        <div className="mb-2">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">โหมดตรวจจับท่า</h3>
                            <p className="text-xs text-gray-400 mb-4">เลือกวิธีการตรวจสอบความถูกต้องของท่า</p>
                        </div>

                        <div className="space-y-3">
                            {/* Angle Mode */}
                            <button
                                onClick={() => handleModeChange('angle')}
                                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                                    mode === 'angle'
                                        ? 'border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-100'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                                        mode === 'angle' ? 'bg-emerald-500 shadow-lg' : 'bg-gray-100'
                                    }`}>
                                        📐
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${mode === 'angle' ? 'text-emerald-700' : 'text-gray-700'}`}>
                                                Angle Mode
                                            </span>
                                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">ค่าเริ่มต้น</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            ตรวจจับโดยคำนวณมุมระหว่างข้อต่อ เหมาะสำหรับท่ายืด-งอแขน/ขา
                                        </p>
                                    </div>
                                    {mode === 'angle' && (
                                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </button>

                            {/* Landmark Mode */}
                            <button
                                onClick={() => handleModeChange('landmark')}
                                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                                    mode === 'landmark'
                                        ? 'border-blue-500 bg-blue-50/80 shadow-md shadow-blue-100'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                                        mode === 'landmark' ? 'bg-blue-500 shadow-lg' : 'bg-gray-100'
                                    }`}>
                                        📍
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${mode === 'landmark' ? 'text-blue-700' : 'text-gray-700'}`}>
                                                Landmark Mode
                                            </span>
                                            <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">ใหม่</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            ตรวจจับโดยเปรียบเทียบตำแหน่ง x, y, z โดยตรง เหมาะสำหรับท่าเอียง-หมุน
                                        </p>
                                    </div>
                                    {mode === 'landmark' && (
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* Info box */}
                        <div className="mt-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-start gap-2">
                                <span className="text-sm">💡</span>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    {mode === 'angle'
                                        ? 'Angle Mode ใช้การคำนวณมุมระหว่าง 3 จุดข้อต่อ เช่น ไหล่-ศอก-ข้อมือ เพื่อตรวจว่ามุมงอถูกต้อง'
                                        : 'Landmark Mode ใช้ตำแหน่ง x, y, z ของแต่ละจุดบนร่างกายเปรียบเทียบกับท่าต้นฉบับโดยตรง เหมาะกับท่าที่ต้องเอียงหรือหมุนลำตัว'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 pt-2">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all active:scale-[0.98]"
                        >
                            เสร็จสิ้น
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes settingsAppear {
                    from { opacity: 0; transform: translateY(24px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)   scale(1); }
                }
            `}</style>
        </>
    );
}
