"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("That password isn't right — try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A10] px-5">
      <form
        onSubmit={handleSubmit}
        className="bg-[#12121C] border border-white/[0.08] w-full max-w-sm p-8 rounded-2xl shadow-2xl"
      >
        <p className="font-display text-2xl text-white mb-1">
          FetchWow<span className="text-coral">.</span>
        </p>
        <p className="text-sm text-white/40 mb-6">
          Owner login — enter your password to manage the store.
        </p>
        <label className="block mb-4">
          <span className="text-sm text-white/40 mb-1.5 block">
            Password
          </span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-ring w-full bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-3 text-lg text-white outline-none focus:border-coral"
          />
        </label>
        {error && <p className="text-coral text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="focus-ring w-full bg-coral text-white py-3.5 rounded-lg font-medium hover:bg-coral-dim transition-colors disabled:opacity-50"
        >
          {loading ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
