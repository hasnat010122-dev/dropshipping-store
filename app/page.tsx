import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedProductGrid from "@/components/AnimatedProductGrid";
import { getAllProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getAllProducts();
  return (
    <>
      <Header />

      <main className="flex-1">
        <AnimatedHero />

        {/* Trust strip */}
        <section className="border-b border-line bg-paper-dim">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex flex-wrap gap-x-10 gap-y-2 justify-center sm:justify-between text-sm font-tag text-ink-soft">
            <span>🚚 Fast delivery, nationwide</span>
            <span>💳 Cash on Delivery · Meezan Bank transfer</span>
            <span>↩︎ 7-day easy returns</span>
            <span>🌍 We ship worldwide</span>
          </div>
        </section>

        {/* Product grid */}
        <section id="shop" className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display text-3xl sm:text-4xl text-ink">
              Trending this week
            </h2>
            <a
              href="/collections/trending-now"
              className="focus-ring text-sm font-tag text-coral hover:underline hidden sm:block"
            >
              View all →
            </a>
          </div>
          <AnimatedProductGrid products={products} />
          {products.length === 0 && (
            <p className="text-center text-ink-soft py-16 font-body">
              No products yet — add your first one from{" "}
              <a href="/admin" className="text-coral underline">
                the admin panel
              </a>
              .
            </p>
          )}
        </section>

        {/* Newsletter */}
        <section className="relative bg-ink text-paper overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full opacity-20 blur-3xl"
            style={{
              background: "radial-gradient(circle, var(--coral) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 text-center">
            <h2 className="font-display text-3xl sm:text-4xl mb-3">
              Get first dibs on new drops
            </h2>
            <p className="text-paper/60 font-body mb-7 max-w-md mx-auto">
              One email a week. Early access to restocks and new arrivals,
              nothing else.
            </p>
            <form className="flex max-w-md mx-auto gap-2">
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="focus-ring flex-1 bg-paper/5 border border-paper/20 px-4 py-3 text-sm placeholder:text-paper/40 outline-none focus:border-marigold"
              />
              <button
                type="submit"
                className="focus-ring bg-marigold text-ink px-5 py-3 font-body font-medium hover:bg-coral hover:text-white transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
