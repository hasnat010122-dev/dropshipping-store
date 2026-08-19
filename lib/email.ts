import { Resend } from "resend";
import type { OrderRow } from "@/lib/db";
import { BRAND } from "@/lib/brand";
import { escapeHtml } from "@/lib/security";
import { BANK_TRANSFER, paymentLabel } from "@/lib/payment";

function emailClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ORDER_EMAIL_FROM?.trim();
  return apiKey && from ? { resend: new Resend(apiKey), from } : null;
}

async function deliver(message: { to: string; subject: string; html: string }) {
  const client = emailClient();
  if (!client) return false;
  const { error } = await client.resend.emails.send({ from: client.from, ...message });
  if (error) throw new Error(`Resend rejected the email: ${error.message}`);
  return true;
}

export async function sendOtpEmail(email: string, code: string) {
  const sent = await deliver({
    to: email,
    subject: `${BRAND.name} sign-in code: ${code}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;color:#14141c"><h2>Your sign-in code</h2><p>Enter this code to sign in to ${escapeHtml(BRAND.name)}:</p><p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:24px 0">${escapeHtml(code)}</p><p style="color:#777;font-size:13px">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
  });
  if (!sent && process.env.NODE_ENV !== "production") {
    console.log(`[${BRAND.name}] Development OTP for ${email}: ${code}`);
  }
  return sent;
}

export async function sendOrderConfirmationEmail(order: OrderRow) {
  if (!order.email) return false;
  const itemsHtml = order.items.map((item) => `<tr><td style="padding:7px 0">${escapeHtml(item.name)} × ${item.qty}</td><td style="padding:7px 0;text-align:right">Rs ${(item.price * item.qty).toLocaleString("en-PK")}</td></tr>`).join("");
  return deliver({
    to: order.email,
    subject: `${BRAND.name} order received — #${order.id.slice(0, 8).toUpperCase()}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;color:#14141c"><h2>Thanks, ${escapeHtml(order.customerName)}!</h2><p>We received your order. It is awaiting owner review before supplier processing.</p><table style="width:100%;border-collapse:collapse;margin:20px 0">${itemsHtml}<tr style="border-top:1px solid #ddd;font-weight:700"><td style="padding:10px 0">Total</td><td style="padding:10px 0;text-align:right">Rs ${order.total.toLocaleString("en-PK")}</td></tr></table><p style="font-size:14px">Payment method: ${escapeHtml(paymentLabel(order.paymentMethod))}<br>Delivery: ${escapeHtml(order.address)}, ${escapeHtml(order.city)}</p>${order.paymentMethod === BANK_TRANSFER.id ? `<div style="border:1px solid #ddd;padding:16px;margin-top:20px"><strong>Bank transfer details</strong><p>Account number: ${BANK_TRANSFER.accountNumber}</p><p>Transfer exactly Rs ${order.total.toLocaleString("en-PK")} and use ${order.id.slice(0, 8).toUpperCase()} as the reference. Keep your receipt until payment is confirmed.</p></div>` : ""}<p style="color:#777;font-size:12px;margin-top:30px">Order ID: ${escapeHtml(order.id)}</p></div>`,
  });
}
