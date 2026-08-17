import { NextResponse } from "next/server";
import { getSessionUserId, clearSession } from "@/lib/session";
import { getUserById } from "@/lib/db";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ user: null });

  const user = await getUserById(userId);
  if (!user) {
    // The session token is validly signed but points at a user that no
    // longer exists (e.g. the underlying data was reset). Clear it so the
    // browser doesn't keep sending a token that looks "signed in" to the
    // middleware but resolves to nothing here — that mismatch is what
    // caused an infinite redirect loop between /account and /account/login.
    await clearSession();
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, addresses: user.addresses },
  });
}
