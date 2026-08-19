export const BANK_TRANSFER = {
  id: "bank_transfer",
  label: "Meezan Bank transfer",
  bankName: "Meezan Digital Centre",
  accountTitle: "HUSSAIN AHMED",
  accountNumber: "00300114982252",
  iban: "PK22MEZN0000300114982252",
} as const;

export function paymentLabel(method: string) {
  if (method === BANK_TRANSFER.id) return BANK_TRANSFER.label;
  if (method === "cod") return "Cash on Delivery";
  return method;
}
