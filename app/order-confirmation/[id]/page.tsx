import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getOrderById } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/session";
import { paymentLabel } from "@/lib/payment";
import { formatPKR } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getSessionUserId();
  const order = await getOrderById(id);
  if (!order || !userId || order.userId !== userId) notFound();

  const items = order.items;

  return (
    <>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-5 sm:px-8 py-16 w-full text-center">
        <div className="w-14 h-14 rounded-full bg-coral text-white flex items-center justify-center text-2xl mx-auto mb-6">
          ✓
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-3">
          Order placed!
        </h1>
        <p className="font-body text-ink-soft mb-8">
          Thanks, {order.customerName} — we&apos;ve got your order. You&apos;ll
          get delivery updates on {order.phone}. Pay in cash when it arrives.
        </p>

        <div className="border border-line bg-white text-left p-6 mb-8">
          <div className="flex justify-between text-sm font-tag text-ink-soft mb-4">
            <span>Order ID</span>
            <span>{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="space-y-2 mb-4 border-t border-line pt-4">
            {items.map((i) => (
              <div
                key={i.id}
                className="flex justify-between text-sm font-body text-ink-soft"
              >
                <span>
                  {i.name}{i.color ? ` — ${i.color}` : ""} × {i.qty}
                </span>
                <span className="font-tag">
                  {formatPKR(i.price * i.qty)}
                </span>
              </div>
            ))}
          </div>
          {order.discount > 0 && (
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-sm font-body text-ink-soft">
                <span>Subtotal</span>
                <span className="font-tag">{formatPKR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body text-emerald-700">
                <span>Discount ({order.couponCode})</span>
                <span className="font-tag">
                  − {formatPKR(order.discount)}
                </span>
              </div>
            </div>
          )}
          <div className="border-t border-line pt-4 flex justify-between font-display text-lg text-ink">
            <span>Total (Cash on Delivery)</span>
            <span className="font-tag">{formatPKR(order.total)}</span>
          </div>
          <p className="text-xs font-tag text-ink-soft/60 mt-4 uppercase">
            Payment: {paymentLabel(order.paymentMethod)} · Status: {order.status}
          </p>
        </div>

        <div className="border-2 border-coral bg-white text-left p-6 mb-8">
          <h2 className="font-display text-xl text-ink mb-2">What happens next?</h2>
          <p className="text-sm font-body text-ink-soft mb-3">
            Our team will quickly verify your order and then dispatch it for delivery.
          </p>
          <ul className="text-sm font-body text-ink-soft list-disc pl-5 space-y-1.5">
            <li>You&apos;ll receive a confirmation call or message shortly after ordering.</li>
            <li>Your parcel will be delivered to the address you provided.</li>
            <li>Please keep <strong className="text-ink">Rs {order.total.toLocaleString("en-PK")}</strong> ready in cash to hand to the delivery agent.</li>
          </ul>
          <p className="text-xs font-body text-ink-soft mt-5">
            You can track your order status anytime using the order ID above on the Track Order page.
          </p>
        </div>

        <Link
          href="/"
          className="focus-ring inline-block bg-ink text-paper px-6 py-3 font-body font-medium hover:bg-coral transition-colors"
        >
          Continue shopping
        </Link>
      </main>
      <Footer />
    </>
  );
}
