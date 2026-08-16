"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutSteps from "@/components/CheckoutSteps";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import PriceDisplay from "@/components/PriceDisplay";

export default function CartPage() {
  const { items, updateQty, removeItem, total } = useCart();
  const { format } = useCurrency();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(false);

  async function handleCheckout() {
    setCheckingAuth(true);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        router.push("/checkout");
      } else {
        router.push("/account/login?returnTo=/checkout");
      }
    } catch {
      router.push("/account/login?returnTo=/checkout");
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-5 sm:px-8 py-14 w-full">
        {items.length > 0 && <CheckoutSteps current={1} />}

        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-10">
          Your cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-line">
            <p className="font-body text-ink-soft mb-6">
              Your cart is empty right now.
            </p>
            <Link
              href="/"
              className="focus-ring inline-block bg-ink text-paper px-7 py-3.5 font-body font-medium hover:bg-coral transition-colors"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-5 border border-line bg-white p-5"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-paper-dim overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between gap-3">
                      <Link
                        href={`/products/${item.id}`}
                        className="focus-ring font-display text-ink hover:text-coral leading-snug"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="focus-ring text-ink-soft/50 hover:text-coral text-sm shrink-0"
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-line">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="focus-ring w-9 h-9 hover:bg-paper-dim font-tag"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-9 text-center font-tag text-sm">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="focus-ring w-9 h-9 hover:bg-paper-dim font-tag"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-tag text-ink font-medium">
                        <PriceDisplay amount={item.price * item.qty} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-line bg-paper-dim p-7 h-fit sticky top-24">
              <h2 className="font-display text-xl text-ink mb-6">
                Order summary
              </h2>
              <div className="flex justify-between font-body text-sm text-ink-soft mb-3">
                <span>Subtotal</span>
                <span className="font-tag">{format(total)}</span>
              </div>
              <div className="flex justify-between font-body text-sm text-ink-soft mb-5">
                <span>Delivery</span>
                <span className="font-tag">Calculated at checkout</span>
              </div>
              <div className="border-t border-line pt-5 flex justify-between font-display text-lg text-ink mb-7">
                <span>Total</span>
                <span className="font-tag">{format(total)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkingAuth}
                className="focus-ring w-full text-center bg-ink text-paper py-3.5 font-body font-medium hover:bg-coral transition-colors disabled:opacity-60"
              >
                {checkingAuth ? "Checking…" : "Proceed to checkout"}
              </button>
              <p className="text-[11px] text-ink-soft/50 font-body mt-3 text-center">
                We'll ask you to verify your email or Google account next —
                takes a few seconds.
              </p>
              {format(total).startsWith("$") && (
                <p className="text-[11px] text-ink-soft/50 font-body mt-2 text-center">
                  Prices shown in USD are approximate — you&apos;ll be
                  charged in PKR.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
