import { NextRequest, NextResponse } from "next/server";
import { getSitePage, updateSitePage } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { isSitePageSlug } from "@/lib/site-pages";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const { slug } = await params;
  if (!isSitePageSlug(slug)) {
    return NextResponse.json({ error: "Unknown page" }, { status: 404 });
  }
  return NextResponse.json(await getSitePage(slug));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }
  const { slug } = await params;
  if (!isSitePageSlug(slug)) {
    return NextResponse.json({ error: "Unknown page" }, { status: 404 });
  }
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title : "";
  const content = typeof body.content === "string" ? body.content : "";

  if (!title.trim()) {
    return NextResponse.json({ error: "Page title is required" }, { status: 400 });
  }

  const updated = await updateSitePage(slug, { title, content });
  return NextResponse.json(updated);
}
