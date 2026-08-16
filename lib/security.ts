import crypto from "crypto";

const DEV_SECRET = "dev-only-insecure-secret-change-before-deploying";

export function getSessionSecret(): Uint8Array {
  const configured = process.env.SESSION_SECRET?.trim();
  if (process.env.NODE_ENV === "production" && (!configured || configured.length < 32)) {
    throw new Error("SESSION_SECRET must be at least 32 characters in production");
  }
  return new TextEncoder().encode(configured || DEV_SECRET);
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function normalizeEmail(value: unknown): string {
  return String(value || "").trim().toLowerCase().slice(0, 254);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function cleanText(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

export function safeInternalPath(value: unknown, fallback = "/account"): string {
  const path = String(value || "").trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  return path;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function secureCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
