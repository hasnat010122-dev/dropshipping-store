import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("no committed environment secret file exists", () => {
  for (const name of [".env", ".env.local", ".env.production", ".env.development.local"]) {
    assert.equal(fs.existsSync(path.join(root, name)), false, `${name} must not be committed`);
  }
});

test("public repository has safe placeholders and ignores runtime data", () => {
  const env = read(".env.local.example");
  assert.match(env, /RESEND_API_KEY=\s*\n/);
  assert.match(env, /GOOGLE_CLIENT_SECRET=\s*\n/);
  const ignore = read(".gitignore");
  for (const marker of [".env.local", "data/", "public/uploads/", "node_modules/"]) assert.ok(ignore.includes(marker));
});

test("admin and customer sessions are signed", () => {
  const auth = read("lib/auth.ts");
  const session = read("lib/session.ts");
  assert.ok(auth.includes("jwtVerify"));
  assert.ok(auth.includes("SignJWT"));
  assert.ok(session.includes("jwtVerify"));
  assert.ok(!auth.includes('value === "true"'));
});

test("orders are priced from the server catalog", () => {
  const orders = read("app/api/orders/route.ts");
  assert.ok(orders.includes("getProductById"));
  assert.ok(orders.includes("serverItems"));
  assert.ok(!orders.includes("safeSubtotal = Math.round(Number(subtotal))"));
});

test("OAuth return paths cannot become external redirects", () => {
  assert.ok(read("app/api/auth/google/route.ts").includes("safeInternalPath"));
  assert.ok(read("app/api/auth/google/callback/route.ts").includes("safeInternalPath"));
});

test("public product APIs redact supplier sourcing fields", () => {
  assert.ok(read("app/api/products/route.ts").includes("toPublicProduct"));
  assert.ok(read("app/api/products/[id]/route.ts").includes("toPublicProduct"));
});

test("products require approval before publication", () => {
  const db = read("lib/db.ts");
  const route = read("app/api/products/[id]/route.ts");
  assert.ok(db.includes('publicationStatus: "draft"'));
  assert.ok(route.includes('current !== "approved"'));
  assert.ok(read("app/admin/(dashboard)/products/page.tsx").includes("Approve product"));
});

test("orders require owner approval before supplier forwarding", () => {
  const db = read("lib/db.ts");
  const route = read("app/api/orders/[id]/route.ts");
  const page = read("app/admin/(dashboard)/orders/page.tsx");
  assert.ok(db.includes('approvalStatus: "pending"'));
  assert.ok(route.includes("Owner approval is required before forwarding"));
  assert.ok(page.includes("Approve order"));
});
