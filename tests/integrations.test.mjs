import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

test("Resend stays server-side and checks provider errors", () => {
  const email = read("lib/email.ts");
  assert.ok(email.includes("process.env.RESEND_API_KEY"));
  assert.ok(email.includes("process.env.ORDER_EMAIL_FROM"));
  assert.ok(email.includes("if (error) throw"));
  assert.ok(!email.includes("NEXT_PUBLIC_RESEND"));
});

test("Google OAuth uses the exact application callback", () => {
  const start = read("app/api/auth/google/route.ts");
  const callback = read("app/api/auth/google/callback/route.ts");
  for (const source of [start, callback]) assert.ok(source.includes("/api/auth/google/callback"));
  assert.ok(start.includes("GOOGLE_CLIENT_ID"));
  assert.ok(callback.includes("GOOGLE_CLIENT_SECRET"));
  assert.ok(callback.includes("profile.email_verified"));
});

test("local example documents the localhost callback", () => {
  assert.ok(read(".env.local.example").includes("http://localhost:3000/api/auth/google/callback"));
});
