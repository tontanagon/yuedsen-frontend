import { NextRequest, NextResponse } from "next/server";

// หน้าที่ทุกคนเข้าได้ (ไม่ต้อง login)
const PUBLIC_PATHS = [
    "/",           // home
    "/login",      // login page
    "/auth/callback", // OAuth callback
];

// path prefix ที่ทุกคนเข้าได้ (API routes)
const PUBLIC_PREFIXES = [
    "/api/auth",   // better-auth API
    "/api/sync-user", // sync user API (เรียกหลัง login)
    "/_next",      // Next.js static files
    "/images",     // static images
    "/favicon",    // favicon
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ตรวจสอบว่าเป็น public path หรือเปล่า
    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const isPublicPrefix = PUBLIC_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
    );

    if (isPublicPath || isPublicPrefix) {
        return NextResponse.next();
    }

    // ตรวจสอบ session จาก cookie
    // better-auth session cookie = "sessionId.HMACsignature"
    // แค่เช็คว่ามีค่า → เร็ว ไม่ต้อง query DB ทุก request
    const sessionCookie =
        request.cookies.get("better-auth.session_token") ??
        request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie?.value) {
        // ไม่มี session → redirect ไปหน้าหลัก
        const homeUrl = new URL("/login", request.url);
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

export const config = {
    // รัน middleware ทุก path ยกเว้น static files
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
