"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutSteps from "@/components/CheckoutSteps";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [devCode, setDevCode] = useState(searchParams.get("dev"));
  const requestedReturn = searchParams.get("returnTo") || "";
  const returnTo = requestedReturn.startsWith("/") && !requestedReturn.startsWith("//") ? requestedReturn : "";
  const isCheckoutFlow = returnTo === "/checkout";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function handleResend() {
    setResending(true);
    setError("");
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setDevCode(data.devCode || null);
      setResendCooldown(30);
    } else {
      setError(data.error || "Couldn't resend the code.");
    }
    setResending(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(returnTo || "/account");
      router.refresh();
    } else {
      setError(data.error || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      {isCheckoutFlow && <CheckoutSteps current={2} />}
      <h1 className="font-display text-3xl text-ink mb-2">Enter your code</h1>
      <p className="text-ink-soft font-body mb-6">
        We sent a 6-digit code to <strong className="text-ink">{email}</strong>.
        It expires in 10 minutes.
      </p>

      {devCode && (
        <div className="bg-marigold/10 border border-marigold/30 text-sm font-body px-3 py-2 mb-6">
          <strong>Dev mode</strong> — email isn't configured yet, so here's
          your code: <span className="font-tag text-lg">{devCode}</span>
        </div>
      )}

      <form onSubmit={handleVerify}>
        <label className="block mb-4">
          <span className="text-sm font-body text-ink-soft mb-1 block">
            6-digit code
          </span>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            autoFocus
            inputMode="numeric"
            className="focus-ring w-full border border-line bg-white px-3 py-3 text-center text-2xl font-tag tracking-[0.3em] outline-none focus:border-ink"
          />
        </label>
        {error && <p className="text-coral text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="focus-ring w-full bg-ink text-paper py-3 font-body font-medium hover:bg-coral transition-colors disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify & sign in"}
        </button>
      </form>

      <div className="text-center mt-5">
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending}
          className="focus-ring text-sm text-ink-soft hover:text-coral disabled:text-ink-soft/40 disabled:cursor-not-allowed"
        >
          {resending
            ? "Sending…"
            : resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Didn't get it? Resend code"}
        </button>
      </div>

      <a
        href={returnTo ? `/account/login?returnTo=${encodeURIComponent(returnTo)}` : "/account/login"}
        className="focus-ring block text-center text-sm text-coral underline mt-3"
      >
        Use a different email
      </a>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 py-16 w-full">
        <Suspense fallback={null}>
          <VerifyForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
