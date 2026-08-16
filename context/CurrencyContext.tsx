"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { formatPKR, formatUSD } from "@/lib/currency";

type Currency = "PKR" | "USD";

type CurrencyContextType = {
  currency: Currency;
  toggleCurrency: () => void;
  format: (amountPkr: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);
const STORAGE_KEY = "buyzo_currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("PKR");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "USD" || saved === "PKR") setCurrency(saved);
  }, []);

  function toggleCurrency() {
    setCurrency((prev) => {
      const next = prev === "PKR" ? "USD" : "PKR";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  function format(amountPkr: number) {
    return currency === "PKR" ? formatPKR(amountPkr) : formatUSD(amountPkr);
  }

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
