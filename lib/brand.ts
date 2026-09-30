export const BRAND = {
  name: "Thundra International",
  tagline: "Great finds, everyday prices",
  domain: "thundrainternational.com",
  contactEmail: process.env.NEXT_PUBLIC_STORE_EMAIL || "Thundrainternational@gmail.com",
  contactPhone: process.env.NEXT_PUBLIC_STORE_WHATSAPP || "03279635549",
} as const;
