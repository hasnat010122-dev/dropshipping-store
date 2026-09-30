export const BRAND = {
  name: "Thundra International",
  tagline: "Great finds, everyday prices",
  domain: "thundrainternational.com",
  contactEmail: process.env.NEXT_PUBLIC_STORE_EMAIL || "thundrain@gmail.com",
  contactPhone: process.env.NEXT_PUBLIC_STORE_WHATSAPP || "03086177169",
} as const;
