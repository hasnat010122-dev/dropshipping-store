import { NextRequest, NextResponse } from "next/server";
import { getAllSuppliers, createSupplier } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  return NextResponse.json(await getAllSuppliers());
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const body = await req.json();
  const { name, platform, contactName, phone, email, website, notes } = body;

  if (!name || !platform) {
    return NextResponse.json(
      { error: "Supplier name and platform are required" },
      { status: 400 }
    );
  }

  const created = await createSupplier({
    name,
    platform,
    contactName: contactName || null,
    phone: phone || null,
    email: email || null,
    website: website || null,
    notes: notes || null,
  });

  return NextResponse.json(created, { status: 201 });
}
