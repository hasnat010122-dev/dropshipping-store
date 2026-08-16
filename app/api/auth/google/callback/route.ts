import { NextRequest, NextResponse } from "next/server";
import { findOrCreateUser } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("buyzo_oauth_state")?.value;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!code || !state || state !== savedState || !clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/account/login?error=google_auth_failed", req.url)
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("No access token");

    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const profile = await profileRes.json();
    if (!profile.email) throw new Error("No email in profile");

    const user = findOrCreateUser(
      profile.email,
      profile.name || profile.email.split("@")[0],
      "google"
    );
    await createSession(user.id);

    const returnTo = req.cookies.get("buyzo_oauth_returnto")?.value;
    const res = NextResponse.redirect(new URL(returnTo || "/account", req.url));
    res.cookies.set("buyzo_oauth_state", "", { path: "/", maxAge: 0 });
    res.cookies.set("buyzo_oauth_returnto", "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return NextResponse.redirect(
      new URL("/account/login?error=google_auth_failed", req.url)
    );
  }
}
