import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { assertNoSupabaseError, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Please upload a JPG, PNG, WEBP, or GIF image" },
      { status: 400 }
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  const ext = extensions[file.type];
  const filename = `${uuid()}.${ext}`;
  if (isSupabaseConfigured()) {
    const client = getSupabaseAdmin();
    const { error } = await client.storage.from("product-images").upload(filename, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    assertNoSupabaseError(error, "Upload product image");
    const { data } = client.storage.from("product-images").getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
