import { NextRequest, NextResponse } from "next/server";
import { getAllReturnRequests, createReturnRequest, getOrderById } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  return NextResponse.json(getAllReturnRequests());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderId, phone, itemId, requestType, reason, comments } = body;

  if (!orderId || !phone || !itemId || !reason) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Verify the order actually exists and the phone matches, same check used for tracking
  const order = getOrderById(orderId.trim());
  const normalize = (p: string) => p.replace(/[^\d]/g, "").slice(-10);
  if (!order || normalize(order.phone) !== normalize(phone)) {
    return NextResponse.json(
      { error: "We couldn't verify that order and phone number combination." },
      { status: 404 }
    );
  }

  const orderedItem = order.items.find((item) => item.id === itemId);
  if (!orderedItem) {
    return NextResponse.json({ error: "That item is not part of this order." }, { status: 400 });
  }

  const created = createReturnRequest({
    orderId: order.id,
    customerName: order.customerName,
    phone: order.phone,
    itemId: orderedItem.id,
    itemName: orderedItem.name,
    requestType: requestType === "exchange" ? "exchange" : "refund",
    reason,
    comments: comments || null,
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
