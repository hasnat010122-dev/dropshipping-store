import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth";
import { SESSION_COOKIE, verifyCustomerToken } from "@/lib/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLoggedIn = await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
    const isLoginPage = pathname === "/admin/login";
    if (!isLoggedIn && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (isLoggedIn && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/account") || pathname === "/checkout") {
    const isAuthPage = pathname === "/account/login" || pathname === "/account/verify";
    const signedIn = !!(await verifyCustomerToken(req.cookies.get(SESSION_COOKIE)?.value));
    if (!signedIn && !isAuthPage) {
      const url = new URL("/account/login", req.url);
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
    if (signedIn && isAuthPage) {
      return NextResponse.redirect(new URL("/account", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout"],
};
