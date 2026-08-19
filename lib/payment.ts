export const BANK_TRANSFER = {
  id: "bank_transfer",
  label: "Bank account transfer",
  accountNumber: "00300114982252",
} as const;

export function paymentLabel(method: string) {
  if (method === BANK_TRANSFER.id) return BANK_TRANSFER.label;
  return method;
}
