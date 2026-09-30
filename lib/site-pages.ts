// Editable storefront pages (About Us, Contact Us).
//
// Page content is stored as plain text: paragraphs are separated by a
// blank line. Store owners edit it from Admin -> Pages; the storefront
// renders it as simple paragraphs. If a page was never edited, the
// defaults below are shown.

export const SITE_PAGE_SLUGS = ["about", "contact"] as const;
export type SitePageSlug = (typeof SITE_PAGE_SLUGS)[number];

export const SITE_PAGE_LABELS: Record<SitePageSlug, string> = {
  about: "About Us",
  contact: "Contact Us",
};

export function isSitePageSlug(slug: string): slug is SitePageSlug {
  return (SITE_PAGE_SLUGS as readonly string[]).includes(slug);
}

export const DEFAULT_SITE_PAGES: Record<SitePageSlug, { title: string; content: string }> = {
  about: {
    title: "About Us",
    content: [
      "Thundra International is a store for the things you didn't know you needed until you saw them — curated finds at honest prices, shipped to customers all over the world.",
      "We keep things simple: no markup games, no fake urgency, just products we'd actually want ourselves, at prices that make sense.",
    ].join("\n\n"),
  },
  contact: {
    title: "Contact Us",
    content: [
      "Got a question about an order, a product, or anything else? Reach us directly — we usually reply fastest on WhatsApp.",
    ].join("\n\n"),
  },
};

/** Split stored page content into paragraphs (blank line = new paragraph). */
export function pageContentToParagraphs(content: string): string[] {
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
