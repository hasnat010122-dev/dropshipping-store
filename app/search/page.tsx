import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? searchProducts(q) : [];

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 py-10 w-full">
        <form action="/search" method="GET" className="mb-8 md:hidden">
          <div className="flex items-center border border-line bg-white px-3 py-2.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-ink-soft/50 shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search for anything…"
              autoFocus
              className="w-full bg-transparent px-2 text-sm outline-none placeholder:text-ink-soft/40 font-body"
            />
          </div>
        </form>

        {q ? (
          <>
            <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1">
              {results.length > 0
                ? `${results.length} result${results.length === 1 ? "" : "s"} for "${q}"`
                : `No results for "${q}"`}
            </h1>
            {results.length === 0 && (
              <p className="text-ink-soft font-body mt-4">
                Try a different word, or{" "}
                <a href="/" className="text-coral underline">
                  browse everything
                </a>
                .
              </p>
            )}
          </>
        ) : (
          <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1">
            Search Zelko
          </h1>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-8">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
