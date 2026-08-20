import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { addUserAddress } from "@/lib/db";
import { cleanText } from "@/lib/security";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const label = cleanText(body.label || "Home", 40);
  const address = cleanText(body.address, 200);
  const addressLine2 = cleanText(body.addressLine2, 120);
  const city = cleanText(body.city, 100);
  const state = cleanText(body.state, 100);
  const postalCode = cleanText(body.postalCode, 30);
  const country = cleanText(body.country, 100);
  const phone = cleanText(body.phone, 30);
  if (!address || !city || !state || !postalCode || !country || !phone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await addUserAddress(userId, {
    label: label || "Home",
    address,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    phone,
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user.addresses, { status: 201 });
}
