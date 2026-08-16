import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { getOrdersByUserId, toCustomerOrder } from "@/lib/db";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  return NextResponse.json(getOrdersByUserId(userId).map(toCustomerOrder));
}
