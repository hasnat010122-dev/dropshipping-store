import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Zelko — Great finds, everyday prices",
    template: "%s",
  },
  description:
    "Zelko is a store for the things you didn't know you needed until you saw them. Fast local delivery in Pakistan, worldwide shipping everywhere else.",
  openGraph: {
    siteName: "Zelko",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#14141C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
