import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { addUserAddress } from "@/lib/db";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { label, address, city, phone } = await req.json();
  if (!address || !city || !phone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await addUserAddress(userId, {
    label: label || "Home",
    address,
    city,
    phone,
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user.addresses, { status: 201 });
}
