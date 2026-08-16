import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_COOKIE } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";

function getSecret() {
  const secret = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

async function hasValidSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- Admin area ----
  if (pathname.startsWith("/admin")) {
    const isLoggedIn = req.cookies.get(ADMIN_COOKIE)?.value === "true";
    const isLoginPage = pathname === "/admin/login";

    if (!isLoggedIn && !isLoginPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    if (isLoggedIn && isLoginPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ---- Customer account area (and checkout, which requires sign-in) ----
  if (pathname.startsWith("/account") || pathname === "/checkout") {
    const isAuthPage =
      pathname === "/account/login" || pathname === "/account/verify";
    const signedIn = await hasValidSession(req);

    if (!signedIn && !isAuthPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/account/login";
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
    if (signedIn && isAuthPage) {
      const url = req.nextUrl.clone();
      url.pathname = "/account";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout"],
};
