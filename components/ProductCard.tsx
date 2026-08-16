"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ProductRow } from "@/lib/db";
import PriceDisplay from "@/components/PriceDisplay";
import TiltCard from "@/components/TiltCard";

export default function ProductCard({ product }: { product: ProductRow }) {
  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(100 - (product.price / product.compareAt) * 100)
      : null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href={`/products/${product.id}`}
        className="tag-card focus-ring group block border border-line bg-white overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
      >
        <span className="tag-notch" aria-hidden />
        <TiltCard maxTilt={6} className="relative aspect-square overflow-hidden bg-paper-dim">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-ink text-paper text-xs font-tag px-2 py-1 tracking-wide uppercase z-10">
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="absolute top-3 right-3 bg-coral text-white text-xs font-tag px-2 py-1 z-10">
              -{discount}%
            </span>
          )}
        </TiltCard>
        <div className="p-4 border-t border-dashed border-line">
          <p className="text-xs font-tag uppercase tracking-wide text-ink-soft/60 mb-1">
            {product.category}
          </p>
          <h3 className="font-display font-medium text-ink leading-snug mb-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 font-tag">
            <PriceDisplay
              amount={product.price}
              compareAt={product.compareAt}
              className="text-ink font-medium"
              compareClassName="text-ink-soft/40 line-through text-sm"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
