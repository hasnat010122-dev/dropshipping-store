import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { deleteUserAddress } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const user = deleteUserAddress(userId, id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user.addresses);
}
