"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface ScoreboardEntry {
    user_id: number;
    user_name: string;
    user_email: string;
    category_id: number;
    category_name: string;
    progress: number;
    total_score: number;
    status: string;
}

interface UserRow {
    user_id: number;
    user_name: string;
    user_email: string;
    categories: Record<string, { progress: number; total_score: number; status: string; category_id: number }>;
    totalProgress: number;
}

// ── config ตาม category ──
const CATEGORY_CONFIG: Record<string, { icon: string; gradient: string; light: string; text: string; border: string }> = {
    รักษา:           { icon: "🩹", gradient: "from-[#7BC69A] to-[#459E60]", light: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
    ป้องกัน:          { icon: "🛡️", gradient: "from-[#60A5FA] to-[#2563EB]", light: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200"   },
    เสริมบุคลิกภาพ:   { icon: "🧘", gradient: "from-[#FBBF24] to-[#D97706]", light: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200"  },
};

const MAX_DAYS = 30;

function getRankDisplay(idx: number) {
    if (idx === 0) return { emoji: "🥇", bg: "bg-yellow-100", text: "text-yellow-700" };
    if (idx === 1) return { emoji: "🥈", bg: "bg-gray-100",   text: "text-gray-600"  };
    if (idx === 2) return { emoji: "🥉", bg: "bg-orange-100", text: "text-orange-700" };
    return { emoji: `#${idx + 1}`, bg: "bg-gray-50", text: "text-gray-500" };
}

export default function ScoreboardPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<ScoreboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"all" | string>("all");
    const [sortBy, setSortBy] = useState<"progress" | "name">("progress");

    useEffect(() => {
        const fetchScoreboard = async () => {
            try {
                const data = await apiClient.get<{ scoreboard: ScoreboardEntry[] }>("/scoreboard");
                setEntries(data.scoreboard || []);
            } catch (err: any) {
                setError(err.message || "ไม่สามารถโหลดข้อมูลได้");
            } finally {
                setIsLoading(false);
            }
        };
        fetchScoreboard();
    }, []);

    // Group by user
    const userMap: Record<number, UserRow> = {};
    for (const e of entries) {
        if (!userMap[e.user_id]) {
            userMap[e.user_id] = { user_id: e.user_id, user_name: e.user_name, user_email: e.user_email, categories: {}, totalProgress: 0 };
        }
        userMap[e.user_id].categories[e.category_name] = { progress: e.progress, total_score: e.total_score, status: e.status, category_id: e.category_id };
        userMap[e.user_id].totalProgress += e.progress;
    }

    const allUsers = Object.values(userMap);
    const allCategories = Array.from(new Set(entries.map((e) => e.category_name)));

    let filteredUsers = activeTab === "all" ? allUsers : allUsers.filter((u) => u.categories[activeTab] !== undefined);
    filteredUsers = [...filteredUsers].sort((a, b) =>
        sortBy === "progress" ? b.totalProgress - a.totalProgress : a.user_name.localeCompare(b.user_name)
    );

    return (
        <div
            className="min-h-screen flex flex-col font-sans overflow-hidden relative bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/background_home_heal.png')" }}
        >
            {/* White overlay เหมือนหน้าความรู้ */}
            <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 px-5 pt-10 pb-4">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-full shadow-md flex items-center justify-center border border-white/80 hover:bg-white/90 transition-all duration-200 active:scale-95"
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#2A6546] to-[#3B9E6E] bg-clip-text text-transparent leading-tight">
                        🏆 Score Board
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">ความก้าวหน้าของผู้ใช้แต่ละคน</p>
                </div>
            </div>

            {/* Stats pills */}
            {!isLoading && !error && (
                <div className="relative z-10 flex gap-3 px-5 mb-4 flex-wrap">
                    {[
                        { label: "ผู้ใช้", value: allUsers.length, icon: "👥", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                        { label: "Mode", value: allCategories.length, icon: "🎮", color: "text-blue-700 bg-blue-50 border-blue-200" },
                        { label: "Progress รวม", value: entries.reduce((s, e) => s + e.progress, 0), icon: "📈", color: "text-amber-700 bg-amber-50 border-amber-200" },
                    ].map((s) => (
                        <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold bg-white/70 backdrop-blur-md ${s.color}`}>
                            <span>{s.icon}</span>
                            <span>{s.value} {s.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Zone Tabs - สไตล์เดียวกับหน้าความรู้ */}
            <div className="relative z-10 px-4 mb-4">
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-white/70 flex gap-1 overflow-x-auto">
                    {[{ key: "all", label: "🌐 ทั้งหมด" }, ...allCategories.map((c) => ({ key: c, label: `${CATEGORY_CONFIG[c]?.icon ?? "🎯"} ${c}` }))].map((tab) => {
                        const cfg = CATEGORY_CONFIG[tab.key];
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                                    isActive
                                        ? cfg
                                            ? `bg-gradient-to-br ${cfg.gradient} text-white shadow-md`
                                            : "bg-gradient-to-br from-[#7BC69A] to-[#459E60] text-white shadow-md"
                                        : "text-gray-500 hover:bg-white/60"
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}

                    {/* Sort toggle */}
                    <button
                        onClick={() => setSortBy(sortBy === "progress" ? "name" : "progress")}
                        className="flex-shrink-0 ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-white/60 transition-all whitespace-nowrap"
                    >
                        {sortBy === "progress" ? "📊 Progress" : "🔤 ชื่อ"}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative z-10 px-4 pb-10 overflow-y-auto flex flex-col gap-3">

                {/* Loading skeleton */}
                {isLoading && [...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-white/50 backdrop-blur-sm rounded-2xl animate-pulse border border-white/60" />
                ))}

                {/* Error */}
                {error && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-red-200 text-center">
                        <div className="text-3xl mb-2">⚠️</div>
                        <p className="font-bold text-red-600">{error}</p>
                        <p className="text-sm text-gray-400 mt-1">กรุณา login ก่อนเข้าหน้านี้</p>
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !error && filteredUsers.length === 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white/60 text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="font-bold text-gray-600 text-lg">ยังไม่มีข้อมูล</p>
                        <p className="text-sm text-gray-400 mt-1">ยังไม่มีผู้ใช้เริ่มเล่นใน mode นี้</p>
                    </div>
                )}

                {/* User cards */}
                {!isLoading && !error && filteredUsers.map((user, idx) => {
                    const rank = getRankDisplay(idx);
                    return (
                        <div
                            key={user.user_id}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/60 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                            style={{ animation: `fadeInUp 0.4s ease ${idx * 0.05}s both` }}
                        >
                            {/* User header */}
                            <div className="flex items-center gap-3 mb-4">
                                {/* Rank */}
                                <div className={`min-w-[40px] h-10 rounded-xl ${rank.bg} flex items-center justify-center text-base font-extrabold ${rank.text}`}>
                                    {rank.emoji}
                                </div>

                                {/* Avatar */}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0"
                                    style={{ background: `hsl(${(user.user_id * 47) % 360}, 55%, 55%)` }}
                                >
                                    {user.user_name?.charAt(0)?.toUpperCase() || "?"}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 text-base leading-tight truncate">{user.user_name || "(ไม่มีชื่อ)"}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.user_email}</p>
                                </div>

                                {/* Total badge */}
                                <div className="flex-shrink-0 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-center">
                                    <p className="text-lg font-extrabold text-emerald-700 leading-none">{user.totalProgress}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">รวม Day</p>
                                </div>
                            </div>

                            {/* Category rows */}
                            <div className="flex flex-col gap-2">
                                {(activeTab === "all" ? allCategories : [activeTab]).map((catName) => {
                                    const catData = user.categories[catName];
                                    const cfg = CATEGORY_CONFIG[catName] ?? { icon: "🎯", gradient: "from-gray-400 to-gray-500", light: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };
                                    const pct = catData ? Math.min((catData.progress / MAX_DAYS) * 100, 100) : 0;

                                    return (
                                        <div key={catName} className={`${cfg.light} ${cfg.border} border rounded-xl px-4 py-3`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm font-bold ${cfg.text} flex items-center gap-1.5`}>
                                                    {cfg.icon} {catName}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {catData ? (
                                                        <>
                                                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                                                                catData.status === "completed"
                                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                    : "bg-amber-100 text-amber-700 border-amber-200"
                                                            }`}>
                                                                {catData.status === "completed" ? "✅ เสร็จแล้ว" : "⏳ กำลังเล่น"}
                                                            </span>
                                                            <span className={`text-sm font-bold ${cfg.text}`}>
                                                                Day {catData.progress}/{MAX_DAYS}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">ยังไม่เริ่ม</span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-1000`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
