import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { orderId, phone } = await req.json();

  if (!orderId || !phone) {
    return NextResponse.json(
      { error: "Please enter your order ID and phone number." },
      { status: 400 }
    );
  }

  const order = await getOrderById(orderId.trim());

  const normalize = (p: string) => p.replace(/[^\d]/g, "").slice(-10);

  if (!order || normalize(order.phone) !== normalize(phone)) {
    return NextResponse.json(
      { error: "We couldn't find an order matching those details." },
      { status: 404 }
    );
  }

  // Only return customer-relevant fields — never expose supplier cost/contact info
  return NextResponse.json({
    id: order.id,
    customerName: order.customerName,
    city: order.city,
    items: order.items,
    total: order.total,
    status: order.status,
    fulfillmentStatus: order.fulfillmentStatus,
    supplierTrackingNumber: order.supplierTrackingNumber,
    supplierTrackingUrl: order.supplierTrackingUrl,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
  });
}
