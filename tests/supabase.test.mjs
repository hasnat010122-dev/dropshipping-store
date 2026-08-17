import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Supabase credentials remain server-only", () => {
  const env = read(".env.local.example");
  assert.match(env, /SUPABASE_URL=\s*\n/);
  assert.match(env, /SUPABASE_SECRET_KEY=\s*\n/);
  assert.ok(!env.includes("NEXT_PUBLIC_SUPABASE"));
  const client = read("lib/supabase.ts");
  assert.ok(client.includes("SUPABASE_SECRET_KEY"));
  assert.ok(!client.includes("NEXT_PUBLIC_"));
});

test("production schema protects all store tables with RLS", () => {
  const sql = read("supabase/schema.sql");
  for (const table of ["products", "suppliers", "users", "orders", "coupons", "returns", "activities", "otp_codes"]) {
    assert.ok(sql.includes(`create table if not exists public.${table}`), `missing ${table}`);
    assert.ok(sql.includes(`alter table public.${table} enable row level security`), `RLS missing for ${table}`);
  }
});

test("product images use a restricted Supabase Storage bucket", () => {
  const sql = read("supabase/schema.sql");
  assert.ok(sql.includes("'product-images'"));
  assert.ok(sql.includes("5242880"));
  const upload = read("app/api/upload/route.ts");
  assert.ok(upload.includes('storage.from("product-images").upload'));
});

test("database adapter keeps local development fallback", () => {
  const db = read("lib/db.ts");
  assert.ok(db.includes("isSupabaseConfigured"));
  assert.ok(db.includes("local.getAllProducts"));
  assert.ok(db.includes('from("orders")'));
});
