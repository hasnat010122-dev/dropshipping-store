"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { categories } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { BRAND } from "@/lib/brand";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { count } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setSignedIn(!!d.user))
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="focus-ring font-display text-2xl font-700 tracking-tight text-ink"
          >
            {BRAND.name}<span className="text-coral">.</span>
          </Link>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form
              onSubmit={handleSearch}
              className="w-full flex items-center border border-line bg-white px-3 py-2 focus-within:outline-2 focus-within:outline-ink"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-ink-soft/50 shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anything…"
                className="w-full bg-transparent px-2 text-sm outline-none placeholder:text-ink-soft/40 font-body"
              />
            </form>
          </div>

          <nav className="flex items-center gap-5">
            <Link
              href="/search"
              className="focus-ring md:hidden text-ink hover:text-coral"
              aria-label="Search"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Link>
            <Link
              href={signedIn ? "/account" : "/account/login"}
              className="focus-ring hidden sm:block text-sm font-body text-ink-soft hover:text-ink"
            >
              {signedIn ? "My Account" : "Sign In"}
            </Link>
            <Link
              href="/track"
              className="focus-ring hidden sm:block text-sm font-body text-ink-soft hover:text-ink"
            >
              Track Order
            </Link>
            <Link
              href="/cart"
              className="focus-ring relative flex items-center gap-1.5 text-sm font-body text-ink hover:text-coral"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              <AnimatePresence mode="popLayout">
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-2 -right-2 sm:static sm:ml-0.5 bg-coral text-white text-[10px] font-tag min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6 h-11 overflow-x-auto no-scrollbar border-t border-line/70 text-sm font-body">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/collections/${c.toLowerCase().replace(/\s+/g, "-")}`}
              className="focus-ring shrink-0 text-ink-soft hover:text-coral whitespace-nowrap"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
