export interface ModeConfig {
    id: number;
    title: string;
    icon: string;
    imageOverride: string[] | null; // เปลี่ยนเป็น array
    colorTheme: string;
    bgColor: string;
    buttonColor: string;
    accentColor: string;
}

// Helper function: เลือกรูปตามวันที่ (1-30)
export function getImageForDay(images: string[] | null, day: number): string | null {
    if (!images || images.length === 0) return null;

    // แบ่งเป็น 4 ช่วง: วันที่ 1-7, 8-15, 16-23, 24-30
    if (day >= 1 && day <= 7) return images[0];
    if (day >= 8 && day <= 15) return images[1];
    if (day >= 16 && day <= 23) return images[2];
    if (day >= 24 && day <= 30) return images[3];

    // ถ้าเกิน 30 วัน ให้ใช้รูปสุดท้าย
    return images[images.length - 1];
}

export const modes: ModeConfig[] = [
    {
        id: 0,
        title: "รักษา",
        icon: "🩹",
        imageOverride: [
            "/images/image_0.png",
            "/images/image_2.png",
            "/images/image_3.png",
            "/images/image_4.png"
        ],
        colorTheme: "green",
        bgColor: "bg-transparent",
        buttonColor: "bg-[#7BC69A]",
        accentColor: "text-[#58B372]"
    },
    {
        id: 1,
        title: "ป้องกัน",
        icon: "🛡️",
        imageOverride: [
            "/images/image_0.png",
            "/images/image_2.png",
            "/images/image_3.png",
            "/images/image_4.png"
        ],
        colorTheme: "green",
        bgColor: "bg-transparent",
        buttonColor: "bg-[#7BC69A]",
        accentColor: "text-[#58B372]"
    },
    {
        id: 2,
        title: "เสริมบุคลิกภาพ",
        icon: "🧘",
        imageOverride: [
            "/images/image_0.png",
            "/images/image_2.png",
            "/images/image_3.png",
            "/images/image_4.png"
        ],
        colorTheme: "green",
        bgColor: "bg-transparent",
        buttonColor: "bg-[#7BC69A]",
        accentColor: "text-[#58B372]"
    }
];
