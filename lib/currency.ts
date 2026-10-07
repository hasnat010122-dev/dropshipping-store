// Prices in the database and throughout the store are stored and displayed
// in Pakistani Rupees (PKR). Conversion helpers are kept for reference /
// legacy migrations only.
export const USD_RATE = Number(process.env.NEXT_PUBLIC_USD_RATE) || 278;

export function pkrToUsd(pkr: number): number {
  return pkr / USD_RATE;
}

export function usdToPkr(usd: number): number {
  return Math.round(usd * USD_RATE);
}

export function formatPKR(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString("en-PK")}`;
}

// Backwards-compatible alias: store now runs entirely in PKR.
export const formatPrice = formatPKR;

export function formatUSD(amountPkr: number): string {
  const usd = pkrToUsd(amountPkr);
  return `$${usd.toFixed(usd < 100 ? 2 : 0)}`;
}
