import { NextRequest, NextResponse } from "next/server";
import { findOrCreateUser } from "@/lib/db";
import { createSession } from "@/lib/session";
import { safeInternalPath } from "@/lib/security";

function loginRedirect(req: NextRequest, error: string) {
  const response = NextResponse.redirect(new URL(`/account/login?error=${error}`, req.url));
  response.cookies.set("fetchwow_oauth_state", "", { path: "/", maxAge: 0 });
  response.cookies.set("fetchwow_oauth_returnto", "", { path: "/", maxAge: 0 });
  return response;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("fetchwow_oauth_state")?.value;
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!code || !state || state !== savedState || !clientId || !clientSecret) {
    return loginRedirect(req, "google_auth_failed");
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
  const redirectUri = `${siteUrl}/api/auth/google/callback`;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
      cache: "no-store",
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Google token exchange rejected", {
        status: tokenRes.status,
        error: tokenData.error,
        errorDescription: tokenData.error_description,
      });
      throw new Error("Google token exchange failed");
    }
    if (!tokenData.access_token) throw new Error("Google returned no access token");

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      cache: "no-store",
    });
    if (!profileRes.ok) throw new Error("Google profile request failed");
    const profile = await profileRes.json();
    if (!profile.email || profile.email_verified !== true) throw new Error("Google email is unavailable or unverified");

    const user = await findOrCreateUser(profile.email, profile.name || profile.email.split("@")[0], "google");
    await createSession(user.id);
    const returnTo = safeInternalPath(req.cookies.get("fetchwow_oauth_returnto")?.value, "/account");
    const response = NextResponse.redirect(new URL(returnTo, req.nextUrl.origin));
    response.cookies.set("fetchwow_oauth_state", "", { path: "/", maxAge: 0 });
    response.cookies.set("fetchwow_oauth_returnto", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("Google OAuth callback failed", error);
    return loginRedirect(req, "google_auth_failed");
  }
}
