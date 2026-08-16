import { Resend } from "resend";
import type { OrderRow } from "@/lib/db";

export async function sendOtpEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.ORDER_EMAIL_FROM;

  if (!apiKey || !fromAddress) {
    // Not configured — this is expected during local development.
    // Log the code so the store owner can still test the sign-in flow.
    console.log(`[Zelko] Email not configured. OTP code for ${email}: ${code}`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: `Your Zelko sign-in code: ${code}`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
        <h2 style="color:#14141C;">Your sign-in code</h2>
        <p style="color:#555;">Enter this code to sign in to Zelko:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #14141C; margin: 24px 0;">
          ${code}
        </p>
        <p style="color:#999; font-size: 13px;">
          This code expires in 10 minutes. If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(order: OrderRow) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.ORDER_EMAIL_FROM;

  // Not configured — silently skip. This keeps the store fully working
  // without requiring an email account to be set up first.
  if (!apiKey || !fromAddress || !order.email) return;

  const resend = new Resend(apiKey);

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${i.name} × ${i.qty}</td><td style="padding:6px 0;text-align:right;">Rs ${(
          i.price * i.qty
        ).toLocaleString()}</td></tr>`
    )
    .join("");

  await resend.emails.send({
    from: fromAddress,
    to: order.email,
    subject: `Your Zelko order is confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#14141C;">Thanks, ${order.customerName}!</h2>
        <p style="color:#555;">Your order has been placed and is being prepared.</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
          ${itemsHtml}
          <tr style="border-top: 1px solid #eee; font-weight: bold;">
            <td style="padding:10px 0;">Total</td>
            <td style="padding:10px 0; text-align:right;">Rs ${order.total.toLocaleString()}</td>
          </tr>
        </table>
        <p style="color:#555; font-size: 14px;">
          Payment method: ${order.paymentMethod}<br/>
          Delivering to: ${order.address}, ${order.city}
        </p>
        <p style="color:#999; font-size: 12px; margin-top: 30px;">
          Order ID: ${order.id}
        </p>
      </div>
    `,
  });
}
