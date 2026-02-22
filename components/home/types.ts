export interface ModeConfig {
    id: number;
    title: string;
    icon: string;
    imageOverride: string[] | null;
    colorTheme: string;
    bgColor: string;
    buttonColor: string;
    accentColor: string;
    // === Per-mode theme ===
    background: string;           // path ของรูป background
    themeColor: string;           // สี accent หลัก (hex)
    strokeColor: string;          // สีขอบตัวอักษร YUEDSEN
    ringColor: string;            // สีวงแหวนรอบ ModeCard
    cardBg: string;               // สี inner circle ของ ModeCard
    arrowColor: string;           // gradient ปุ่ม ←→
    playBtnGradient: string;      // gradient ปุ่มเริ่มเกม
    playBtnHover: string;         // hover gradient ปุ่มเริ่มเกม
    indicatorColor: string;       // สี dot indicator
    navBarBg: string;             // สี navbar glassy
}

// Helper function: เลือกรูปตามวันที่ (1-30)
export function getImageForDay(images: string[] | null, day: number): string | null {
    if (!images || images.length === 0) return null;
    if (day >= 1 && day <= 7) return images[0];
    if (day >= 8 && day <= 15) return images[1];
    if (day >= 16 && day <= 23) return images[2];
    if (day >= 24 && day <= 30) return images[3];
    return images[images.length - 1];
}

export const modes: ModeConfig[] = [
    {
        // ── รักษา ── สีเขียวธรรมชาติ
        id: 0,
        title: "รักษา",
        icon: "🩹",
        imageOverride: [
            "/images/process/image_0.png",
            "/images/process/image_1.png",
            "/images/process/image_2.png",
            "/images/process/image_3.png"
        ],
        colorTheme: "green",
        bgColor: "bg-transparent",
        buttonColor: "bg-[#7BC69A]",
        accentColor: "text-[#58B372]",
        background: "/images/background_home_heal.png",
        themeColor: "#58B372",
        strokeColor: "#458F5A",
        ringColor: "#93DDAA",
        cardBg: "#E8F8EE",
        arrowColor: "from-[#A5DABC] to-[#7BC69A]",
        playBtnGradient: "from-[#6BC784] to-[#459E60]",
        playBtnHover: "hover:from-[#76DC91] hover:to-[#4DB26C]",
        indicatorColor: "bg-[#7BC69A]",
        navBarBg: "bg-white/70",
    },
    {
        // ── ป้องกัน ── สีน้ำเงิน/ม่วงเข้ม
        id: 1,
        title: "ป้องกัน",
        icon: "🛡️",
        imageOverride: [
            "/images/process/image_0.png",
            "/images/process/image_1.png",
            "/images/process/image_2.png",
            "/images/process/image_3.png"
        ],
        colorTheme: "blue",
        bgColor: "bg-transparent",
        buttonColor: "bg-[#5B8DEF]",
        accentColor: "text-[#3A6FD8]",
        background: "/images/background_home_protect.png",
        themeColor: "#3A6FD8",
        strokeColor: "#2A52B0",
        ringColor: "#93B8F5",
        cardBg: "#EEF3FF",
        arrowColor: "from-[#8AABF5] to-[#5B8DEF]",
        playBtnGradient: "from-[#5B8DEF] to-[#3A6FD8]",
        playBtnHover: "hover:from-[#6B9BFF] hover:to-[#4A7FE8]",
        indicatorColor: "bg-[#5B8DEF]",
        navBarBg: "bg-white/70",
    },
    {
        // ── เสริมบุคลิกภาพ ── สีทองส้ม
        id: 2,
        title: "เสริมบุคลิกภาพ",
        icon: "🧘",
        imageOverride: [
            "/images/process/image_0.png",
            "/images/process/image_1.png",
            "/images/process/image_2.png",
            "/images/process/image_3.png"
        ],
        colorTheme: "gold",
        bgColor: "bg-transparent",
        buttonColor: "bg-[#E8A630]",
        accentColor: "text-[#C8891A]",
        background: "/images/background_home_personality.png",
        themeColor: "#C8891A",
        strokeColor: "#A06A0A",
        ringColor: "#F5D08A",
        cardBg: "#FFF8EC",
        arrowColor: "from-[#F5D08A] to-[#E8A630]",
        playBtnGradient: "from-[#E8A630] to-[#C8891A]",
        playBtnHover: "hover:from-[#F5B840] hover:to-[#D8991A]",
        indicatorColor: "bg-[#E8A630]",
        navBarBg: "bg-white/70",
    }
];
