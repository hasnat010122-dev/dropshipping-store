import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, createOrder, validateCoupon, incrementCouponUsage, getCouponByCode } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getSessionUserId } from "@/lib/session";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const rows = getAllOrders();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerName,
    phone,
    email,
    address,
    city,
    paymentMethod,
    items,
    subtotal,
    couponCode,
  } = body;

  if (!customerName || !phone || !address || !city || !items?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const safeSubtotal = Math.round(Number(subtotal));
  let discount = 0;
  let appliedCode: string | null = null;

  if (couponCode) {
    const result = validateCoupon(couponCode, safeSubtotal);
    if (result.valid) {
      discount = result.discount;
      appliedCode = result.coupon.code;
    }
  }

  // Attach to the signed-in customer's account if there is one — guest
  // checkout stays fully supported when there isn't.
  const userId = await getSessionUserId();

  const order = createOrder({
    userId,
    customerName,
    phone,
    email: email || null,
    address,
    city,
    paymentMethod,
    items,
    subtotal: safeSubtotal,
    couponCode: appliedCode,
    discount,
    total: Math.max(0, safeSubtotal - discount),
  });

  if (appliedCode) {
    const coupon = getCouponByCode(appliedCode);
    if (coupon) incrementCouponUsage(coupon.id);
  }

  if (order.email) {
    sendOrderConfirmationEmail(order).catch(() => {});
  }

  return NextResponse.json({ id: order.id }, { status: 201 });
}
