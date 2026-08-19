import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const products = await getAllProducts();

  const staticPages = [
    "",
    "/cart",
    "/track",
    "/shipping",
    "/returns",
    "/terms",
    "/privacy",
    "/contact",
    "/about",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const collectionSlugs = [
    "new-in",
    "trending-now",
    "gift-ideas",
    "tech",
    "home",
    "fashion",
  ];
  const collectionPages = collectionSlugs.map((slug) => ({
    url: `${base}/collections/${slug}`,
    lastModified: new Date(),
  }));

  const productPages = products.map((p) => ({
    url: `${base}/products/${p.id}`,
    lastModified: new Date(p.createdAt),
  }));

  return [...staticPages, ...collectionPages, ...productPages];
}
