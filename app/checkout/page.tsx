"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutSteps from "@/components/CheckoutSteps";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { BANK_TRANSFER } from "@/lib/payment";

const paymentMethods = [
  { id: BANK_TRANSFER.id, label: BANK_TRANSFER.label, note: "Transfer to the account shown below" },
];

type SavedAddress = { id: string; label: string; address: string; city: string; phone: string };

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { format } = useCurrency();
  const router = useRouter();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [paymentMethod, setPaymentMethod] = useState(BANK_TRANSFER.id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [signedIn, setSignedIn] = useState(false);

  // Checkout is verification-gated; prefill the signed-in account and saved addresses.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setSignedIn(true);
          setForm((f) => ({ ...f, customerName: d.user.name, email: d.user.email }));
          setSavedAddresses(d.user.addresses || []);
          if (d.user.addresses?.length > 0) {
            const first = d.user.addresses[0];
            setSelectedAddressId(first.id);
            setForm((f) => ({ ...f, address: first.address, city: first.city, phone: first.phone }));
          }
        }
      })
      .catch(() => {});
  }, []);

  function selectAddress(a: SavedAddress | "new") {
    if (a === "new") {
      setSelectedAddressId("new");
      setForm((f) => ({ ...f, address: "", city: "", phone: "" }));
    } else {
      setSelectedAddressId(a.id);
      setForm((f) => ({ ...f, address: a.address, city: a.city, phone: a.phone }));
    }
  }

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const finalTotal = Math.max(0, total - (appliedCoupon?.discount || 0));

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCouponError("");
    setCouponLoading(true);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal: total }),
    });
    const data = await res.json();
    if (res.ok) {
      setAppliedCoupon({ code: data.code, discount: data.discount });
    } else {
      setAppliedCoupon(null);
      setCouponError(data.error || "Couldn't apply that code.");
    }
    setCouponLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            qty: i.qty,
            color: i.color || null,
          })),
          subtotal: total,
          couponCode: appliedCoupon?.code || null,
        }),
      });

      if (!res.ok) throw new Error("Could not place order");
      const data = await res.json();
      clearCart();
      router.push(`/order-confirmation/${data.id}`);
    } catch {
      setError("Something went wrong placing your order. Please try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 py-20 text-center">
          <p className="font-body text-ink-soft mb-5">
            Your cart is empty — add something before checking out.
          </p>
          <a
            href="/"
            className="focus-ring inline-block bg-ink text-paper px-6 py-3 font-body font-medium hover:bg-coral transition-colors"
          >
            Start shopping
          </a>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-5 sm:px-8 py-14 w-full">
        <CheckoutSteps current={3} />

        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-3xl sm:text-4xl text-ink">
            Checkout
          </h1>
          {signedIn && (
            <span className="text-xs font-tag text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              ✓ Verified
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-10"
          >
            <fieldset>
              <legend className="flex items-center gap-2.5 font-display text-xl text-ink mb-5">
                <span className="w-6 h-6 rounded-full bg-ink text-paper text-xs font-tag flex items-center justify-center shrink-0">
                  1
                </span>
                Delivery address
              </legend>

              {savedAddresses.length > 0 && (
                <div className="space-y-2 mb-5">
                  {savedAddresses.map((a) => (
                    <label
                      key={a.id}
                      className={`flex items-start gap-3 border px-4 py-3 cursor-pointer transition-colors ${
                        selectedAddressId === a.id
                          ? "border-ink bg-white"
                          : "border-line bg-white/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === a.id}
                        onChange={() => selectAddress(a)}
                        className="accent-coral mt-1"
                      />
                      <span>
                        <span className="font-body font-medium text-ink block">
                          📍 {a.label}
                        </span>
                        <span className="text-xs text-ink-soft font-body">
                          {a.address}, {a.city} · {a.phone}
                        </span>
                      </span>
                    </label>
                  ))}
                  <label
                    className={`flex items-center gap-3 border px-4 py-3 cursor-pointer transition-colors ${
                      selectedAddressId === "new"
                        ? "border-ink bg-white"
                        : "border-line bg-white/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddressId === "new"}
                      onChange={() => selectAddress("new")}
                      className="accent-coral"
                    />
                    <span className="font-body font-medium text-ink">
                      + Use a new address
                    </span>
                  </label>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-body text-ink-soft mb-1.5 block">
                    Full name
                  </span>
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({ ...form, customerName: e.target.value })
                    }
                    className="focus-ring w-full border border-line bg-white px-3.5 py-3 outline-none focus:border-ink transition-colors"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-body text-ink-soft mb-1.5 block">
                    Phone number
                  </span>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="03xx-xxxxxxx"
                    className="focus-ring w-full border border-line bg-white px-3.5 py-3 outline-none focus:border-ink transition-colors"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-body text-ink-soft mb-1.5 block">
                    Verified email
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    placeholder="Signed-in email"
                    className="focus-ring w-full border border-line bg-paper-dim px-3.5 py-3 outline-none text-ink-soft"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-body text-ink-soft mb-1.5 block">
                    City
                  </span>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Multan"
                    className="focus-ring w-full border border-line bg-white px-3.5 py-3 outline-none focus:border-ink transition-colors"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-body text-ink-soft mb-1.5 block">
                    Full address
                  </span>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="focus-ring w-full border border-line bg-white px-3.5 py-3 outline-none focus:border-ink resize-none transition-colors"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="flex items-center gap-2.5 font-display text-xl text-ink mb-5">
                <span className="w-6 h-6 rounded-full bg-ink text-paper text-xs font-tag flex items-center justify-center shrink-0">
                  2
                </span>
                Payment method
              </legend>
              <div className="space-y-2.5">
                {paymentMethods.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 border px-4 py-3.5 cursor-pointer transition-colors ${
                      paymentMethod === m.id
                        ? "border-ink bg-white"
                        : "border-line bg-white/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="accent-coral"
                    />
                    <span>
                      <span className="font-body font-medium text-ink block">
                        {m.label}
                      </span>
                      <span className="text-xs text-ink-soft font-body">
                        {m.note}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {paymentMethod === BANK_TRANSFER.id && (
                <div className="mt-4 border border-line bg-paper-dim p-5 text-sm font-body text-ink-soft">
                  <p className="font-medium text-ink mb-3">Bank transfer details</p>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                    <dt>Account number</dt><dd className="font-tag text-ink break-all">{BANK_TRANSFER.accountNumber}</dd>
                  </dl>
                  <p className="mt-4 text-xs leading-relaxed">
                    Place the order first, then transfer the exact total and use the order ID shown on the confirmation page as your payment reference. Keep your receipt until payment is confirmed.
                  </p>
                </div>
              )}
            </fieldset>

            {error && (
              <p className="text-coral text-sm font-body">{error}</p>
            )}
          </form>

          <div className="lg:col-span-2">
            <div className="border border-line bg-paper-dim p-7 sticky top-24">
              <h2 className="font-display text-xl text-ink mb-6">
                Order summary
              </h2>
              <div className="space-y-2.5 mb-5">
                {items.map((i) => (
                  <div
                    key={i.id}
                    className="flex justify-between text-sm font-body text-ink-soft"
                  >
                    <span className="pr-3">
                      {i.name}{i.color ? ` — ${i.color}` : ""} × {i.qty}
                    </span>
                    <span className="font-tag shrink-0">
                      {format(i.price * i.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {appliedCoupon ? (
                <div className="flex justify-between items-center border-t border-line pt-4 mb-4 text-sm font-body">
                  <span className="text-emerald-700">
                    ✓ {appliedCoupon.code} applied
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput("");
                    }}
                    className="focus-ring text-ink-soft/50 hover:text-coral text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleApplyCoupon}
                  className="flex gap-2 border-t border-line pt-4 mb-4"
                >
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Discount code"
                    className="focus-ring flex-1 border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink font-tag"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput}
                    className="focus-ring border border-ink px-4 py-2.5 text-sm font-body hover:bg-ink hover:text-paper transition-colors disabled:opacity-40"
                  >
                    {couponLoading ? "…" : "Apply"}
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-coral text-xs mb-4">{couponError}</p>
              )}

              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm font-body text-ink-soft">
                  <span>Subtotal</span>
                  <span className="font-tag">{format(total)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm font-body text-emerald-700">
                    <span>Discount</span>
                    <span className="font-tag">
                      − {format(appliedCoupon.discount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-line pt-5 flex justify-between font-display text-lg text-ink mb-2">
                <span>Total</span>
                <span className="font-tag">{format(finalTotal)}</span>
              </div>
              <p className="text-[11px] text-ink-soft/50 font-body mb-5">
                USD prices are approximate. For the bank transfer, send exactly Rs {finalTotal.toLocaleString()}.
              </p>
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting}
                className="focus-ring w-full bg-ink text-paper py-3.5 font-body font-medium hover:bg-coral transition-colors disabled:opacity-50 mt-2"
              >
                {submitting ? "Placing order…" : "Place order"}
              </button>
              <p className="text-[11px] text-ink-soft/40 font-tag text-center mt-3">
                🔒 Your information is secure and never shared with third parties
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
