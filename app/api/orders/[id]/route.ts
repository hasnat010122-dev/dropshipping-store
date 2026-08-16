import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, updateOrderApproval, updateOrderFulfillment, toCustomerOrder } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getSessionUserId } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const row = getOrderById(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (await isAdmin()) return NextResponse.json(row);
  const userId = await getSessionUserId();
  if (!userId || row.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toCustomerOrder(row));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const orderStatuses = new Set(["pending", "confirmed", "shipped", "delivered", "cancelled"]);
  const fulfillmentStatuses = new Set(["not_ordered", "ordered_from_supplier", "shipped_by_supplier", "delivered"]);

  if (body.approvalStatus) {
    if (!["approved", "rejected"].includes(body.approvalStatus)) {
      return NextResponse.json({ error: "Invalid approval status" }, { status: 400 });
    }
    updateOrderApproval(id, body.approvalStatus);
  }
  if (body.status) {
    if (!orderStatuses.has(body.status)) return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    updateOrderStatus(id, body.status);
  }

  const current = getOrderById(id);
  if (body.fulfillmentStatus && !fulfillmentStatuses.has(body.fulfillmentStatus)) {
    return NextResponse.json({ error: "Invalid fulfillment status" }, { status: 400 });
  }
  if (body.fulfillmentStatus && body.fulfillmentStatus !== "not_ordered" && current?.approvalStatus !== "approved") {
    return NextResponse.json({ error: "Owner approval is required before forwarding this order to a supplier." }, { status: 409 });
  }

  const fulfillmentKeys = ["supplierId", "fulfillmentStatus", "supplierTrackingNumber", "supplierTrackingUrl", "fulfillmentNotes"];
  const fulfillmentUpdate: Record<string, unknown> = {};
  for (const key of fulfillmentKeys) if (key in body) fulfillmentUpdate[key] = body[key];
  if (Object.keys(fulfillmentUpdate).length > 0) updateOrderFulfillment(id, fulfillmentUpdate);

  const updated = getOrderById(id);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
