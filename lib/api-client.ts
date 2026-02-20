/**
 * api-client.ts
 * Utility สำหรับเรียก Go backend API พร้อม JWT token อัตโนมัติ
 *
 * ใช้งาน:
 *   import { apiClient } from "@/lib/api-client";
 *   const poses = await apiClient.get("/poses");
 *   await apiClient.post("/poses", { name: "T-Pose", ... });
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/** อ่าน JWT token จาก cookie */
function getToken(): string | null {
    if (typeof document === "undefined") return null; // server-side guard
    const match = document.cookie.match(/(?:^|;\s*)api_token=([^;]+)/);
    return match ? match[1] : null;
}

/** สร้าง headers พร้อม Authorization */
function buildHeaders(extra?: HeadersInit): HeadersInit {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    };
}

/** ตรวจสอบ response และ throw error ถ้าไม่ ok */
async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
}

// ===== API Methods =====

async function get<T = any>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
        method: "GET",
        headers: buildHeaders(options?.headers),
        ...options,
    });
    return handleResponse<T>(res);
}

async function post<T = any>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
        method: "POST",
        headers: buildHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        ...options,
    });
    return handleResponse<T>(res);
}

async function put<T = any>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
        method: "PUT",
        headers: buildHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        ...options,
    });
    return handleResponse<T>(res);
}

async function del<T = any>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
        method: "DELETE",
        headers: buildHeaders(options?.headers),
        ...options,
    });
    return handleResponse<T>(res);
}

/** ล้าง token เมื่อ logout */
function clearToken(): void {
    document.cookie = "api_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export const apiClient = { get, post, put, delete: del, getToken, clearToken };
