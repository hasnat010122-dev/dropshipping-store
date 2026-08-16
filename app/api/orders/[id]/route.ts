import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, updateOrderFulfillment } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const row = getOrderById(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
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

  if (body.status) {
    updateOrderStatus(id, body.status);
  }

  const fulfillmentKeys = [
    "supplierId",
    "fulfillmentStatus",
    "supplierTrackingNumber",
    "supplierTrackingUrl",
    "fulfillmentNotes",
  ];
  const fulfillmentUpdate: Record<string, unknown> = {};
  for (const key of fulfillmentKeys) {
    if (key in body) fulfillmentUpdate[key] = body[key];
  }
  if (Object.keys(fulfillmentUpdate).length > 0) {
    updateOrderFulfillment(id, fulfillmentUpdate);
  }

  const updated = getOrderById(id);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
