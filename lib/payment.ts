export const COD = {
  id: "cod",
  label: "Cash on Delivery",
} as const;

export const PAYMENT_METHODS = [COD] as const;

export function paymentLabel(method: string) {
  if (method === COD.id) return COD.label;
  // Legacy orders placed before COD became the only option may still have
  // the old bank_transfer label; show a neutral fallback rather than the
  // raw id.
  if (method === "bank_transfer") return "Bank transfer (legacy)";
  return method;
}
