import { NextRequest, NextResponse } from "next/server";
import { updateCoupon, deleteCoupon } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { code, type, value, active, usageLimit, expiresAt } = body;

  const updated = await updateCoupon(id, {
    code,
    type: type === "fixed" ? "fixed" : "percent",
    value: Number(value),
    active: active !== false,
    usageLimit: usageLimit ? Number(usageLimit) : null,
    expiresAt: expiresAt || null,
  });

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const { id } = await params;
  await deleteCoupon(id);
  return NextResponse.json({ ok: true });
}
