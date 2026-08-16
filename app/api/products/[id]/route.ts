import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const row = getProductById(id);
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
  const {
    name,
    price,
    compareAt,
    category,
    badge,
    image,
    description,
    stock,
    supplierId,
    supplierProductUrl,
    supplierCost,
  } = body;

  const existing = getProductById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = updateProduct(id, {
    name,
    price: Math.round(Number(price)),
    compareAt: compareAt ? Math.round(Number(compareAt)) : null,
    category,
    badge: badge || null,
    image,
    description: description || null,
    stock: stock ? Math.round(Number(stock)) : 0,
    supplierId: supplierId || null,
    supplierProductUrl: supplierProductUrl || null,
    supplierCost: supplierCost ? Math.round(Number(supplierCost)) : null,
  });

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
  deleteProduct(id);
  return NextResponse.json({ ok: true });
}
