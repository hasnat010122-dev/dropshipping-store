import { NextRequest, NextResponse } from "next/server";
import { getAllCoupons, createCoupon } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  return NextResponse.json(getAllCoupons());
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const body = await req.json();
  const { code, type, value, active, usageLimit, expiresAt } = body;

  if (!code || !type || !value) {
    return NextResponse.json(
      { error: "Code, type, and value are required" },
      { status: 400 }
    );
  }

  const created = createCoupon({
    code,
    type: type === "fixed" ? "fixed" : "percent",
    value: Number(value),
    active: active !== false,
    usageLimit: usageLimit ? Number(usageLimit) : null,
    expiresAt: expiresAt || null,
  });

  return NextResponse.json(created, { status: 201 });
}
