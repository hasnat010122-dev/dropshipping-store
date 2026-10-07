"use client";

import { createContext, useContext, type ReactNode } from "react";
import { formatPKR } from "@/lib/currency";

type CurrencyContextType = {
  currency: "PKR";
  format: (amountPkr: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  return (
    <CurrencyContext.Provider value={{ currency: "PKR", format: formatPKR }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
