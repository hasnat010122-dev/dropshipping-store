import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "FetchWow — Great finds, everyday prices",
    template: "%s",
  },
  description:
    "FetchWow is a store for the things you didn't know you needed until you saw them. Fast local delivery in Pakistan, worldwide shipping everywhere else.",
  openGraph: {
    siteName: "FetchWow",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#14141C",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <CurrencyProvider>{children}</CurrencyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
