"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import type { ProductRow } from "@/lib/db";

export default function AddToCartBox({ product }: { product: ProductRow }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="flex gap-3 mb-8">
      <motion.button
        onClick={handleAdd}
        disabled={outOfStock}
        whileHover={!outOfStock ? { scale: 1.02 } : {}}
        whileTap={!outOfStock ? { scale: 0.97 } : {}}
        animate={added ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="focus-ring flex-1 bg-ink text-paper py-3.5 font-body font-medium hover:bg-coral transition-colors disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={outOfStock ? "out" : added ? "added" : "add"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="block"
          >
            {outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <motion.button
        onClick={() => router.push("/cart")}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="focus-ring border border-ink px-5 hover:border-coral hover:text-coral transition-colors font-body"
      >
        View cart
      </motion.button>
    </div>
  );
}
