import { NextRequest, NextResponse } from "next/server";
import { createOrder, getAllOrders, getCouponByCode, getProductById, getUserById, incrementCouponUsage, validateCoupon, type OrderItem } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getSessionUserId } from "@/lib/session";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { cleanText } from "@/lib/security";

const PAYMENT_METHODS = new Set(["bank_transfer"]);

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  return NextResponse.json(await getAllOrders());
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  const user = userId ? await getUserById(userId) : undefined;
  if (!userId || !user) {
    return NextResponse.json({ error: "Please verify your account before placing an order." }, { status: 401 });
  }

  const body = await req.json();
  const customerName = cleanText(body.customerName || user.name, 100);
  const phone = cleanText(body.phone, 30);
  const address = cleanText(body.address, 500);
  const city = cleanText(body.city, 100);
  const paymentMethod = cleanText(body.paymentMethod, 30).toLowerCase();
  const requestedItems = Array.isArray(body.items) ? body.items : [];
  if (!customerName || phone.replace(/\D/g, "").length < 10 || !address || !city || !PAYMENT_METHODS.has(paymentMethod) || !requestedItems.length || requestedItems.length > 50) {
    return NextResponse.json({ error: "Please provide valid delivery, payment and cart information." }, { status: 400 });
  }

  const quantities = new Map<string, number>();
  const serverItems: OrderItem[] = [];
  for (const item of requestedItems) {
    const id = cleanText(item?.id, 100);
    const qty = Number(item?.qty);
    const color = cleanText(item?.color, 60) || null;
    if (!id || !Number.isInteger(qty) || qty < 1 || qty > 10) {
      return NextResponse.json({ error: "Your cart contains an invalid quantity." }, { status: 400 });
    }
    const product = await getProductById(id);
    if (!product) return NextResponse.json({ error: "A product in your cart is no longer available." }, { status: 409 });
    const colors = product.colors || [];
    if (colors.length && (!color || !colors.includes(color))) {
      return NextResponse.json({ error: `Please select an available color for ${product.name}.` }, { status: 409 });
    }
    const totalQty = (quantities.get(id) || 0) + qty;
    if (product.stock < totalQty) return NextResponse.json({ error: `Only ${product.stock} units of ${product.name} are currently available.` }, { status: 409 });
    quantities.set(id, totalQty);
    serverItems.push({ id: product.id, name: product.name, price: product.price, qty, color });
  }

  const subtotal = serverItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  let discount = 0;
  let appliedCode: string | null = null;
  const couponCode = cleanText(body.couponCode, 50);
  if (couponCode) {
    const result = await validateCoupon(couponCode, subtotal);
    if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400 });
    discount = result.discount;
    appliedCode = result.coupon.code;
  }

  const order = await createOrder({
    userId,
    customerName,
    phone,
    email: user.email,
    address,
    city,
    paymentMethod,
    items: serverItems,
    subtotal,
    couponCode: appliedCode,
    discount,
    total: Math.max(0, subtotal - discount),
  });

  if (appliedCode) {
    const coupon = await getCouponByCode(appliedCode);
    if (coupon) await incrementCouponUsage(coupon.id);
  }
  sendOrderConfirmationEmail(order).catch((error) => console.error("Order confirmation email failed", error));
  return NextResponse.json({ id: order.id, total: order.total }, { status: 201 });
}
