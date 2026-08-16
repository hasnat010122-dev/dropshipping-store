import { NextRequest, NextResponse } from "next/server";
import { createOtpCode } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const otp = createOtpCode(email);
  await sendOtpEmail(otp.email, otp.code);

  // In development without email configured, return the code so the
  // store owner can actually test the flow without setting up Resend first.
  const devMode =
    process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY;

  return NextResponse.json({
    ok: true,
    ...(devMode ? { devCode: otp.code } : {}),
  });
}
