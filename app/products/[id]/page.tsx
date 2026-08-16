import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductHero from "@/components/ProductHero";
import { getProductById, getProductsByCategory } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "Product not found — Zelko" };

  const description =
    product.description ||
    `${product.name} — Rs ${product.price.toLocaleString()} at Zelko. Fast delivery across Pakistan, worldwide shipping.`;

  return {
    title: `${product.name} — Zelko`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: [{ url: product.image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const related = getProductsByCategory(product.category, product.id, 4);

  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(100 - (product.price / product.compareAt) * 100)
      : null;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <nav className="text-sm font-tag text-ink-soft/60 mb-8">
            <a href="/" className="focus-ring hover:text-coral">
              Home
            </a>
            {" / "}
            <a
              href={`/collections/${product.category.toLowerCase()}`}
              className="focus-ring hover:text-coral"
            >
              {product.category}
            </a>
            {" / "}
            <span className="text-ink">{product.name}</span>
          </nav>

          <ProductHero product={product} discount={discount} />

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl sm:text-3xl text-ink mb-6">
                You might also like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
