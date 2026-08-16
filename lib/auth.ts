import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSessionSecret, safeEqual, secureCookieOptions } from "@/lib/security";

export const ADMIN_COOKIE = "fetchwow_admin_session";
const ADMIN_ISSUER = "fetchwow-store";
const ADMIN_AUDIENCE = "fetchwow-admin";
const ADMIN_MAX_AGE = 60 * 60 * 12;

export async function verifyAdminPassword(password: unknown): Promise<boolean> {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (!configured) return false;
  return safeEqual(String(password || ""), configured);
}

export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ADMIN_ISSUER)
    .setAudience(ADMIN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSessionSecret());
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, secureCookieOptions(ADMIN_MAX_AGE));
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      issuer: ADMIN_ISSUER,
      audience: ADMIN_AUDIENCE,
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function isAdmin() {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
}
