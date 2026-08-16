import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds — Zelko",
  description:
    "Start a return or exchange on your Zelko order — 7-day return window, simple online request.",
};

export default function ReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
