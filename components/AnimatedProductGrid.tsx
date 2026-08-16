"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import type { ProductRow } from "@/lib/db";

export default function AnimatedProductGrid({
  products,
}: {
  products: ProductRow[];
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
      }}
      className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-7"
    >
      {products.map((p) => (
        <motion.div
          key={p.id}
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
          }}
        >
          <ProductCard product={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}
