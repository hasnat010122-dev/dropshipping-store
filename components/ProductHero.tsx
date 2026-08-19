"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import TiltCard from "@/components/TiltCard";
import AddToCartBox from "@/components/AddToCartBox";
import PriceDisplay from "@/components/PriceDisplay";
import type { ProductRow } from "@/lib/db";

export default function ProductHero({
  product,
  discount,
}: {
  product: ProductRow;
  discount: number | null;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <TiltCard
          maxTilt={8}
          className="aspect-square bg-paper-dim border border-line overflow-hidden shadow-lg"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
            priority
          />
          {product.badge && (
            <span className="absolute top-4 left-4 bg-ink text-paper text-xs font-tag px-2.5 py-1.5 uppercase tracking-wide z-10">
              {product.badge}
            </span>
          )}
        </TiltCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <p className="font-tag text-xs uppercase tracking-widest text-coral mb-3">
          {product.category}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-ink mb-4 leading-tight">
          {product.name}
        </h1>

        <div className="flex items-baseline gap-3 font-tag mb-2">
          <PriceDisplay
            amount={product.price}
            compareAt={product.compareAt}
            className="text-2xl text-ink font-medium"
            compareClassName="text-ink-soft/40 line-through"
          />
          {product.compareAt && (
            <span className="text-coral text-sm">Save {discount}%</span>
          )}
        </div>

        <p className="text-xs font-tag text-ink-soft/50 mb-6">
          {product.stock > 0
            ? `${product.stock} in stock`
            : "Currently out of stock"}
        </p>

        <p className="text-ink-soft font-body leading-relaxed mb-8">
          {product.description ||
            "A genuinely useful pick from this week's drop. Sourced for quality, priced to actually be worth it."}
        </p>

        <AddToCartBox product={product} />

        <div className="border-t border-line pt-6 space-y-3 text-sm font-body text-ink-soft">
          <p>🚚 Worldwide delivery available</p>
          <p>💳 Pay securely by bank account transfer</p>
          <p>↩︎ 7-day return window, no questions asked</p>
        </div>
      </motion.div>
    </div>
  );
}
