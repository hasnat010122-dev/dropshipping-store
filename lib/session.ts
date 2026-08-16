import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSessionSecret, secureCookieOptions } from "@/lib/security";

export const SESSION_COOKIE = "fetchwow_customer_session";
const SESSION_ISSUER = "fetchwow-store";
const SESSION_AUDIENCE = "fetchwow-customer";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSessionSecret());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, secureCookieOptions(SESSION_MAX_AGE));
}

export async function verifyCustomerToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return verifyCustomerToken(store.get(SESSION_COOKIE)?.value);
}

export async function clearSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}
