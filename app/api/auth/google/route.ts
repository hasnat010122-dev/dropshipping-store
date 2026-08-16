import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { safeInternalPath, secureCookieOptions } from "@/lib/security";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const returnTo = safeInternalPath(req.nextUrl.searchParams.get("returnTo"), "/account");
  if (!clientId) {
    const url = new URL("/account/login", req.url);
    url.searchParams.set("error", "google_not_configured");
    if (returnTo !== "/account") url.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(url);
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
  const redirectUri = `${siteUrl}/api/auth/google/callback`;
  const state = crypto.randomBytes(32).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  response.cookies.set("fetchwow_oauth_state", state, secureCookieOptions(10 * 60));
  response.cookies.set("fetchwow_oauth_returnto", returnTo, secureCookieOptions(10 * 60));
  return response;
}
