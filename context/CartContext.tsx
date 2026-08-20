"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  color?: string | null;
  qty: number;
};

export function cartItemKey(item: Pick<CartItem, "id" | "color">) {
  return `${item.id}::${item.color || "default"}`;
}

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "buyzo_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Ignore corrupt browser storage.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  function addItem(item: Omit<CartItem, "qty">, qty = 1) {
    const key = cartItemKey(item);
    setItems((prev) => {
      const existing = prev.find((entry) => cartItemKey(entry) === key);
      if (existing) {
        return prev.map((entry) =>
          cartItemKey(entry) === key ? { ...entry, qty: entry.qty + qty } : entry
        );
      }
      return [...prev, { ...item, qty }];
    });
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((item) => cartItemKey(item) !== key));
  }

  function updateQty(key: string, qty: number) {
    if (qty < 1) return removeItem(key);
    setItems((prev) =>
      prev.map((item) => (cartItemKey(item) === key ? { ...item, qty } : item))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
