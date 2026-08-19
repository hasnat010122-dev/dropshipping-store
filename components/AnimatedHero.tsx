"use client";

import { motion } from "framer-motion";

const tickerWords = [
  "Tech",
  "Home",
  "Fashion",
  "Gadgets",
  "Kitchen",
  "Fitness",
  "Gifts",
  "Trending",
];

export default function AnimatedHero() {
  return (
    <section className="relative border-b border-line bg-paper overflow-hidden">
      {/* Ambient gradient glow — premium depth without changing the palette */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 w-[36rem] h-[36rem] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--coral) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 w-[28rem] h-[28rem] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--marigold) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-10 sm:pt-24 sm:pb-14">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-tag text-xs uppercase tracking-widest text-coral mb-4"
        >
          New drops every week
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="font-display font-700 text-[13vw] sm:text-7xl md:text-8xl leading-[0.95] text-ink tracking-tight max-w-4xl"
        >
          Things you didn&apos;t
          <br />
          know you needed<span className="text-coral">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 max-w-lg text-ink-soft font-body text-lg"
        >
          Curated finds, honest prices. Delivered to customers all over the
          world.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <motion.a
            href="#shop"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="focus-ring bg-ink text-paper px-6 py-3 font-body font-medium hover:bg-coral transition-colors"
          >
            Shop the collection
          </motion.a>
          <motion.a
            href="/collections/trending-now"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="focus-ring border border-ink px-6 py-3 font-body font-medium hover:border-coral hover:text-coral transition-colors"
          >
            See what&apos;s trending
          </motion.a>
        </motion.div>
      </div>

      {/* Marquee ticker */}
      <div className="relative border-t border-line overflow-hidden bg-ink py-3">
        <div className="marquee-track">
          {[...tickerWords, ...tickerWords].map((w, i) => (
            <span
              key={i}
              className="font-display text-lg text-paper px-6 whitespace-nowrap flex items-center gap-6"
            >
              {w}
              <span className="text-marigold">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
