import { NextRequest, NextResponse } from "next/server";
import { verifyOtpCode, findOrCreateUser } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { email, code, name } = await req.json();

  if (!email || !code) {
    return NextResponse.json(
      { error: "Please enter the code sent to your email." },
      { status: 400 }
    );
  }

  const valid = verifyOtpCode(email, code);
  if (!valid) {
    return NextResponse.json(
      { error: "That code is incorrect or has expired." },
      { status: 400 }
    );
  }

  const user = findOrCreateUser(email, name || email.split("@")[0], "email");
  await createSession(user.id);

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
}
