export interface ModeConfig {
    id: number;
    title: string;
    icon: string;
    imageOverride: string | null;
    colorTheme: string;
    bgColor: string;
    buttonColor: string;
    accentColor: string;
}

export const modes: ModeConfig[] = [
    {
        id: 0,
        title: "รักษา", // Treatment
        icon: "🩹",
        imageOverride: null,
        colorTheme: "red",
        bgColor: "bg-[#ffccb0]",
        buttonColor: "bg-[#b30000]",
        accentColor: "text-red-700"
    },
    {
        id: 1,
        title: "ป้องกัน", // Prevention
        icon: "🛡️",
        imageOverride: null,
        colorTheme: "blue",
        bgColor: "bg-[#b0ccff]",
        buttonColor: "bg-[#0047b3]",
        accentColor: "text-blue-700"
    },
    {
        id: 2,
        title: "ปรับบุคลิกภาพ", // Personality/Posture
        icon: "🧘",
        imageOverride: null,
        colorTheme: "green",
        bgColor: "bg-[#b0ffcc]",
        buttonColor: "bg-[#00b347]",
        accentColor: "text-green-700"
    }
];
