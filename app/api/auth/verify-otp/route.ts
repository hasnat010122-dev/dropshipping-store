import { NextRequest, NextResponse } from "next/server";
import { verifyOtpCode, findOrCreateUser } from "@/lib/db";
import { createSession } from "@/lib/session";
import { isValidEmail, normalizeEmail } from "@/lib/security";
import { requestIp, takeRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { email: rawEmail, code, name } = await req.json();
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email) || !/^\d{6}$/.test(String(code || ""))) {
    return NextResponse.json({ error: "Enter the valid 6-digit code sent to your email." }, { status: 400 });
  }

  const rate = takeRateLimit(`otp-verify:${requestIp(req)}:${email}`, 8, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many verification attempts. Request a new code later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }
  if (!verifyOtpCode(email, String(code))) {
    return NextResponse.json({ error: "That code is incorrect or has expired." }, { status: 400 });
  }

  const user = findOrCreateUser(email, String(name || email.split("@")[0]).slice(0, 100), "email");
  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}
