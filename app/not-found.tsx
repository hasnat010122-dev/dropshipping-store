import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-5 py-24">
        <div className="text-center max-w-md">
          <p className="font-display text-8xl text-ink mb-2">
            4<span className="text-coral">0</span>4
          </p>
          <h1 className="font-display text-2xl text-ink mb-3">
            This page went out of stock
          </h1>
          <p className="text-ink-soft font-body mb-8">
            We couldn&apos;t find what you&apos;re looking for — it may have
            moved, sold out, or never existed.
          </p>
          <Link
            href="/"
            className="focus-ring inline-block bg-ink text-paper px-6 py-3 font-body font-medium hover:bg-coral transition-colors"
          >
            Back to shopping
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
