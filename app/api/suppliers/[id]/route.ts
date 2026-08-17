import { NextRequest, NextResponse } from "next/server";
import { getSupplierById, updateSupplier, deleteSupplier } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const { id } = await params;
  const row = await getSupplierById(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { name, platform, contactName, phone, email, website, notes } = body;

  const updated = await updateSupplier(id, {
    name,
    platform,
    contactName: contactName || null,
    phone: phone || null,
    email: email || null,
    website: website || null,
    notes: notes || null,
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
  await deleteSupplier(id);
  return NextResponse.json({ ok: true });
}
