import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProductsForCollection, getCollectionTitle } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = getCollectionTitle(slug);
  return {
    title: `${title} — Zelko`,
    description: `Shop ${title} at Zelko — great finds, everyday prices.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = getProductsForCollection(slug);
  const title = getCollectionTitle(slug);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 py-10 w-full">
        <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1">
          {title}
        </h1>
        <p className="text-ink-soft font-body text-sm mb-8">
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>

        {products.length === 0 ? (
          <p className="text-ink-soft font-body py-12 text-center border border-dashed border-line">
            Nothing in this collection yet — check back soon, or{" "}
            <a href="/" className="text-coral underline">
              browse everything
            </a>
            .
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
