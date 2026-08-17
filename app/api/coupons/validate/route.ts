import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();
  if (!code || typeof subtotal !== "number") {
    return NextResponse.json({ error: "Missing code or subtotal" }, { status: 400 });
  }
  const result = await validateCoupon(code, subtotal);
  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    code: result.coupon.code,
    discount: result.discount,
    type: result.coupon.type,
    value: result.coupon.value,
  });
}
