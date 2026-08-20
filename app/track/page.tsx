"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatUSD } from "@/lib/currency";

const statusSteps = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const fulfillmentLabels: Record<string, string> = {
  not_ordered: "Preparing your order",
  ordered_from_supplier: "Order sent for fulfillment",
  shipped_by_supplier: "On its way to you",
  delivered: "Delivered",
};

type OrderResult = {
  id: string;
  customerName: string;
  city: string;
  items: { id: string; name: string; price: number; qty: number; color?: string | null }[];
  total: number;
  status: string;
  fulfillmentStatus: string;
  supplierTrackingNumber: string | null;
  supplierTrackingUrl: string | null;
  paymentMethod: string;
  createdAt: string;
};

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order") || "");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, phone }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult(data);
    } else {
      setError(data.error || "Something went wrong.");
    }
    setLoading(false);
  }

  const currentStepIndex = result
    ? statusSteps.findIndex((s) => s.key === result.status)
    : -1;

  return (
    <main className="flex-1 max-w-2xl mx-auto px-5 sm:px-8 py-14 w-full">
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-2">
          Track your order
        </h1>
        <p className="text-ink-soft font-body mb-8">
          Enter your order ID (from your confirmation page) and the phone
          number you used at checkout.
        </p>

        <form
          onSubmit={handleSubmit}
          className="border border-line bg-paper-dim p-6 mb-8 grid sm:grid-cols-2 gap-4"
        >
          <label className="block sm:col-span-2">
            <span className="text-sm font-body text-ink-soft mb-1 block">
              Order ID
            </span>
            <input
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 5bb02009-2c77-4fd6-9ee0-dbd6b99f8f53"
              className="focus-ring w-full border border-line bg-white px-3 py-2.5 outline-none focus:border-ink font-tag text-sm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-body text-ink-soft mb-1 block">
              Phone number
            </span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03xx-xxxxxxx"
              className="focus-ring w-full border border-line bg-white px-3 py-2.5 outline-none focus:border-ink"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="focus-ring sm:col-span-2 bg-ink text-paper py-3 font-body font-medium hover:bg-coral transition-colors disabled:opacity-50"
          >
            {loading ? "Looking up…" : "Track order"}
          </button>
          {error && <p className="sm:col-span-2 text-coral text-sm">{error}</p>}
        </form>

        {result && (
          <div className="border border-line bg-white p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-display text-xl text-ink">
                  Order #{result.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-ink-soft font-body">
                  Placed {new Date(result.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-xs font-tag uppercase bg-coral/10 text-coral px-2.5 py-1 rounded-full">
                {fulfillmentLabels[result.fulfillmentStatus]}
              </span>
            </div>

            {/* Status stepper */}
            <div className="flex items-center mb-8">
              {statusSteps.map((step, i) => (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        i <= currentStepIndex
                          ? "bg-coral"
                          : "bg-line"
                      }`}
                    />
                    <span
                      className={`text-[11px] font-tag mt-2 text-center ${
                        i <= currentStepIndex ? "text-ink" : "text-ink-soft/40"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-1 ${
                        i < currentStepIndex ? "bg-coral" : "bg-line"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {result.supplierTrackingNumber && (
              <div className="bg-paper-dim border border-line p-4 mb-6 text-sm font-body">
                <p className="text-ink-soft mb-1">Tracking number</p>
                <p className="font-tag text-ink">
                  {result.supplierTrackingNumber}
                </p>
                {result.supplierTrackingUrl && (
                  <a
                    href={result.supplierTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-coral underline text-xs mt-1 inline-block"
                  >
                    Track shipment →
                  </a>
                )}
              </div>
            )}

            <div className="space-y-2 mb-4 border-t border-line pt-4">
              {result.items.map((i) => (
                <div
                  key={i.id}
                  className="flex justify-between text-sm font-body text-ink-soft"
                >
                  <span>
                    {i.name}{i.color ? ` — ${i.color}` : ""} × {i.qty}
                  </span>
                  <span className="font-tag">
                    {formatUSD(i.price * i.qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-display text-lg text-ink border-t border-line pt-4">
              <span>Total</span>
              <span className="font-tag">{formatUSD(result.total)}</span>
            </div>
          </div>
        )}
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <TrackOrderForm />
      </Suspense>
      <Footer />
    </>
  );
}
