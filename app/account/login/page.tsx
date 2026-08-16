"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutSteps from "@/components/CheckoutSteps";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const returnTo = searchParams.get("returnTo") || "";
  const isCheckoutFlow = returnTo === "/checkout";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      const devSuffix = data.devCode ? `&dev=${data.devCode}` : "";
      const returnSuffix = returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : "";
      router.push(`/account/verify?email=${encodeURIComponent(email)}${devSuffix}${returnSuffix}`);
    } else {
      setError(data.error || "Something went wrong.");
      setLoading(false);
    }
  }

  const googleHref = returnTo
    ? `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`
    : "/api/auth/google";

  return (
    <div className="max-w-sm mx-auto">
      {isCheckoutFlow && <CheckoutSteps current={2} />}

      <h1 className="font-display text-3xl text-ink mb-2">
        {isCheckoutFlow ? "Verify it's you" : "Sign in"}
      </h1>
      <p className="text-ink-soft font-body mb-8">
        {isCheckoutFlow
          ? "Quick verification before checkout — this keeps your order and account secure."
          : "Sign in to see your order history and save addresses for faster checkout."}
      </p>

      {oauthError && (
        <p className="text-coral text-sm mb-4 bg-coral/5 border border-coral/20 px-3 py-2">
          {oauthError === "google_not_configured"
            ? "Google sign-in isn't set up yet — try email instead."
            : "Something went wrong with Google sign-in — try email instead."}
        </p>
      )}

      <a
        href={googleHref}
        className="focus-ring w-full flex items-center justify-center gap-3 border border-line bg-white py-3 font-body font-medium hover:border-ink transition-colors mb-4"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.28v3.09A12 12 0 0 0 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.37l3.99-3.09z"
          />
          <path
            fill="#EA4335"
            d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.63l3.99 3.09C6.22 6.88 8.87 4.77 12 4.77z"
          />
        </svg>
        Continue with Google
      </a>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-line flex-1" />
        <span className="text-xs text-ink-soft/50 font-tag">OR</span>
        <div className="h-px bg-line flex-1" />
      </div>

      <form onSubmit={handleContinue}>
        <label className="block mb-4">
          <span className="text-sm font-body text-ink-soft mb-1 block">
            Email address
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="focus-ring w-full border border-line bg-white px-3 py-2.5 outline-none focus:border-ink"
          />
        </label>
        {error && <p className="text-coral text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="focus-ring w-full bg-ink text-paper py-3 font-body font-medium hover:bg-coral transition-colors disabled:opacity-50"
        >
          {loading ? "Sending code…" : "Continue with email"}
        </button>
      </form>

      <p className="text-xs text-ink-soft/50 font-body mt-6 text-center">
        We'll send a 6-digit code to confirm it's you — no password needed.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 py-16 w-full">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
