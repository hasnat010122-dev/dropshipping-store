"use client";

import { useState } from "react";
import {
  RotateCcw,
  PackageCheck,
  Truck,
  Wallet,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type OrderItem = { id: string; name: string; price: number; qty: number };
type OrderResult = {
  id: string;
  customerName: string;
  items: OrderItem[];
  status: string;
};

const steps = [
  {
    icon: RotateCcw,
    title: "Start your return",
    body: "Look up your order below and tell us what you'd like to return and why.",
  },
  {
    icon: PackageCheck,
    title: "We review it",
    body: "We check your request within 24–48 hours and confirm next steps.",
  },
  {
    icon: Truck,
    title: "Send it back",
    body: "Ship the item back to us, or we'll arrange a pickup depending on your city.",
  },
  {
    icon: Wallet,
    title: "Get refunded",
    body: "Once we receive and inspect the item, your refund is on its way within 5–7 days.",
  },
];

const eligible = [
  "Unused, with tags and original packaging",
  "Requested within 7 days of delivery",
  "Not on the final sale list below",
];

const notEligible = [
  "Items marked as final sale",
  "Used, damaged, or altered items",
  "Items missing original packaging",
];

const reasons = [
  "Changed my mind",
  "Item arrived damaged",
  "Wrong item received",
  "Item doesn't match description",
  "Quality not as expected",
  "Other",
];

export default function ReturnsPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState("");
  const [requestType, setRequestType] = useState<"refund" | "exchange">("refund");
  const [reason, setReason] = useState(reasons[0]);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError("");
    setOrder(null);
    setConfirmation(null);
    setLookupLoading(true);
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, phone }),
    });
    const data = await res.json();
    if (res.ok) {
      setOrder(data);
      setSelectedItemId(data.items[0]?.id || "");
    } else {
      setLookupError(data.error || "Something went wrong.");
    }
    setLookupLoading(false);
  }

  async function handleSubmitReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setSubmitError("");
    setSubmitting(true);
    const item = order.items.find((i) => i.id === selectedItemId);
    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        phone,
        itemId: selectedItemId,
        itemName: item?.name,
        requestType,
        reason,
        comments,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setConfirmation(data.id);
      setOrder(null);
    } else {
      setSubmitError(data.error || "Something went wrong — please try again.");
    }
    setSubmitting(false);
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 py-14 w-full">
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-2">
          Returns & Refunds
        </h1>
        <p className="text-ink-soft font-body mb-10">
          Not quite right? You have 7 days from delivery to send it back.
          Here&apos;s how it works.
        </p>

        {/* How it works */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="border border-line bg-white p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </span>
                  <span className="font-tag text-xs text-ink-soft/50">
                    STEP {i + 1}
                  </span>
                </div>
                <p className="font-display text-ink mb-1">{s.title}</p>
                <p className="text-sm text-ink-soft font-body">{s.body}</p>
              </div>
            );
          })}
        </div>

        {/* Eligibility */}
        <div className="grid sm:grid-cols-2 gap-6 mb-14">
          <div>
            <p className="font-display text-ink flex items-center gap-2 mb-3">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Eligible for return
            </p>
            <ul className="space-y-1.5 text-sm text-ink-soft font-body">
              {eligible.map((e) => (
                <li key={e}>· {e}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display text-ink flex items-center gap-2 mb-3">
              <XCircle size={18} className="text-coral" />
              Not eligible
            </p>
            <ul className="space-y-1.5 text-sm text-ink-soft font-body">
              {notEligible.map((e) => (
                <li key={e}>· {e}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Start a return */}
        <div className="border-t border-line pt-10">
          <h2 className="font-display text-2xl text-ink mb-2">
            Start a return
          </h2>

          {confirmation ? (
            <div className="border border-line bg-paper-dim p-6 text-center">
              <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-3" />
              <p className="font-display text-lg text-ink mb-1">
                Return request submitted
              </p>
              <p className="text-sm text-ink-soft font-body mb-3">
                Reference: {confirmation.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-sm text-ink-soft font-body">
                We&apos;ll review it within 24–48 hours. You can also reach
                us via our <a href="/contact" className="text-coral underline">contact page</a> with this reference number.
              </p>
            </div>
          ) : !order ? (
            <>
              <p className="text-sm text-ink-soft font-body mb-5">
                Enter your order ID and the phone number you used at
                checkout to get started.
              </p>
              <form
                onSubmit={handleLookup}
                className="border border-line bg-paper-dim p-6 grid sm:grid-cols-2 gap-4"
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
                  disabled={lookupLoading}
                  className="focus-ring sm:col-span-2 bg-ink text-paper py-3 font-body font-medium hover:bg-coral transition-colors disabled:opacity-50"
                >
                  {lookupLoading ? "Looking up…" : "Find my order"}
                </button>
                {lookupError && (
                  <p className="sm:col-span-2 text-coral text-sm">{lookupError}</p>
                )}
              </form>
            </>
          ) : (
            <form
              onSubmit={handleSubmitReturn}
              className="border border-line bg-paper-dim p-6 space-y-5"
            >
              <p className="text-sm font-body text-ink-soft">
                Order found — hi {order.customerName}. What would you like to
                return?
              </p>

              <label className="block">
                <span className="text-sm font-body text-ink-soft mb-1 block">
                  Item
                </span>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="focus-ring w-full border border-line bg-white px-3 py-2.5 outline-none focus:border-ink"
                >
                  {order.items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} × {i.qty}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-body text-ink-soft mb-1 block">
                  I'd like a
                </span>
                <div className="flex gap-3">
                  {(["refund", "exchange"] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setRequestType(t)}
                      className={`focus-ring flex-1 border py-2.5 text-sm font-body capitalize transition-colors ${
                        requestType === t
                          ? "border-ink bg-white text-ink"
                          : "border-line bg-white/50 text-ink-soft"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-body text-ink-soft mb-1 block">
                  Reason
                </span>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="focus-ring w-full border border-line bg-white px-3 py-2.5 outline-none focus:border-ink"
                >
                  {reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-body text-ink-soft mb-1 block">
                  Anything else we should know?{" "}
                  <span className="text-ink-soft/40">(optional)</span>
                </span>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="focus-ring w-full border border-line bg-white px-3 py-2.5 outline-none focus:border-ink resize-none"
                />
              </label>

              {submitError && <p className="text-coral text-sm">{submitError}</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="focus-ring flex-1 bg-ink text-paper py-3 font-body font-medium hover:bg-coral transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit return request"}
                </button>
                <button
                  type="button"
                  onClick={() => setOrder(null)}
                  className="focus-ring border border-line px-5 py-3 font-body text-ink-soft hover:border-ink"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
