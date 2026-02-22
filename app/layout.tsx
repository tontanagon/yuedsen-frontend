import type { Metadata } from "next";
import { Geist, Geist_Mono, Luckiest_Guy, Prompt } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const luckiestGuy = Luckiest_Guy({
  variable: "--font-luckiest",
  subsets: ["latin"],
  weight: "400",
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "YUEDSEN — ยืดเส้น ดูแลสุขภาพด้วย AI",
  description: "แอปออกกำลังกายและยืดเส้น ดูแลสุขภาพด้วย AI ติดตามความก้าวหน้าของคุณทุกวัน",
  keywords: ["ยืดเส้น", "ออกกำลังกาย", "สุขภาพ", "AI", "YUEDSEN"],
  authors: [{ name: "YUEDSEN" }],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "YUEDSEN — ยืดเส้น ดูแลสุขภาพด้วย AI",
    description: "แอปออกกำลังกายและยืดเส้น ดูแลสุขภาพด้วย AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${luckiestGuy.variable} ${prompt.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
