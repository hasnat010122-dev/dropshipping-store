import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession, createAdminSession, verifyAdminPassword } from "@/lib/auth";
import { logActivity } from "@/lib/db";
import { requestIp, takeRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return NextResponse.json({ error: "Admin login is not configured" }, { status: 503 });
  }
  const rate = takeRateLimit(`admin:${requestIp(req)}`, 8, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }
  const { password } = await req.json();
  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  await createAdminSession();
  logActivity("admin_login", "Admin logged in");
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
