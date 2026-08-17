import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, getAllProductsAdmin, createProduct, toPublicProduct } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await isAdmin();
  const rows = admin ? await getAllProductsAdmin() : await getAllProducts();
  return NextResponse.json(admin ? rows : rows.map(toPublicProduct));
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }

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

  if (!name || !price || !category || !image) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const created = await createProduct({
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

  return NextResponse.json(created, { status: 201 });
}
