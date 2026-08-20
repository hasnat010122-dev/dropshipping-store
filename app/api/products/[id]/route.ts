import { NextRequest, NextResponse } from "next/server";
import { getProductById, getProductByIdAdmin, updateProduct, updateProductPublicationStatus, deleteProduct, toPublicProduct } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await isAdmin();
  const row = admin ? await getProductByIdAdmin(id) : await getProductById(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(admin ? row : toPublicProduct(row));
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
    images,
    colors,
    description,
    stock,
    supplierId,
    supplierProductUrl,
    supplierCost,
  } = body;

  const existing = await getProductByIdAdmin(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updateProduct(id, {
    name,
    price: Math.round(Number(price)),
    compareAt: compareAt ? Math.round(Number(compareAt)) : null,
    category,
    badge: badge || null,
    image,
    images: Array.isArray(images) ? images.filter((value): value is string => typeof value === "string" && value.trim().length > 0).slice(0, 12) : [image],
    colors: Array.isArray(colors) ? colors.filter((value): value is string => typeof value === "string" && value.trim().length > 0).map((value) => value.trim()).slice(0, 30) : [],
    description: description || null,
    stock: stock ? Math.round(Number(stock)) : 0,
    supplierId: supplierId || null,
    supplierProductUrl: supplierProductUrl || null,
    supplierCost: supplierCost ? Math.round(Number(supplierCost)) : null,
  });

  return NextResponse.json(updated);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  const { id } = await params;
  const product = await getProductByIdAdmin(id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { publicationStatus } = await req.json();
  if (!["draft", "approved", "published"].includes(publicationStatus)) {
    return NextResponse.json({ error: "Invalid publication status" }, { status: 400 });
  }
  const current = product.publicationStatus || "published";
  if (publicationStatus === "published" && current !== "approved") {
    return NextResponse.json({ error: "Approve the product before publishing it." }, { status: 409 });
  }
  return NextResponse.json(await updateProductPublicationStatus(id, publicationStatus));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
