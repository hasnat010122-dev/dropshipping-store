"use client";

import { useCurrency } from "@/context/CurrencyContext";

export default function PriceDisplay({
  amount,
  compareAt,
  className = "",
  compareClassName = "",
}: {
  amount: number;
  compareAt?: number | null;
  className?: string;
  compareClassName?: string;
}) {
  const { format } = useCurrency();

  return (
    <>
      <span className={className}>{format(amount)}</span>
      {compareAt && (
        <span className={compareClassName}>{format(compareAt)}</span>
      )}
    </>
  );
}
