import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const returnTo = req.nextUrl.searchParams.get("returnTo") || "";

  if (!clientId) {
    const url = new URL("/account/login", req.url);
    url.searchParams.set("error", "google_not_configured");
    if (returnTo) url.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(url);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const redirectUri = `${siteUrl}/api/auth/google/callback`;
  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
  res.cookies.set("buyzo_oauth_state", state, {
    httpOnly: true,
    maxAge: 600,
    path: "/",
  });
  if (returnTo) {
    res.cookies.set("buyzo_oauth_returnto", returnTo, {
      httpOnly: true,
      maxAge: 600,
      path: "/",
    });
  }
  return res;
}
