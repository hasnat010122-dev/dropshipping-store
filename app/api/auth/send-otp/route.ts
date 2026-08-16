import { NextRequest, NextResponse } from "next/server";
import { createOtpCode } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";
import { isValidEmail, normalizeEmail } from "@/lib/security";
import { requestIp, takeRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { email: rawEmail } = await req.json();
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const ip = requestIp(req);
  const emailRate = takeRateLimit(`otp-email:${email}`, 3, 15 * 60 * 1000);
  const ipRate = takeRateLimit(`otp-ip:${ip}`, 10, 15 * 60 * 1000);
  const rate = !emailRate.allowed ? emailRate : ipRate;
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many code requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const otp = createOtpCode(email);
  try {
    const sent = await sendOtpEmail(otp.email, otp.code);
    if (!sent && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
    }
  } catch (error) {
    console.error("OTP email delivery failed", error);
    return NextResponse.json({ error: "We could not send the code. Please try again." }, { status: 502 });
  }

  const development = process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY;
  return NextResponse.json({ ok: true, ...(development ? { devCode: otp.code } : {}) });
}
