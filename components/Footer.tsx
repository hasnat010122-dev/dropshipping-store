import Link from "next/link";
import { BRAND } from "@/lib/brand";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "New In", href: "/collections/new-in" },
      { label: "Trending", href: "/collections/trending-now" },
      { label: "Tech", href: "/collections/tech" },
      { label: "Home", href: "/collections/home" },
      { label: "Fashion", href: "/collections/fashion" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track Order", href: "/track" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: BRAND.name,
    links: [
      { label: "About", href: "/about" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <p className="font-display text-2xl mb-3">
            {BRAND.name}<span className="text-coral">.</span>
          </p>
          <p className="text-sm text-paper/60 max-w-xs font-body">
            Great finds, everyday prices. Delivered to customers all over the
            world.
          </p>
          <div className="flex gap-3 mt-5 font-tag text-xs flex-wrap">
            <span className="border border-paper/20 px-2 py-1">Bank account transfer</span>
          </div>
          <div className="mt-4 space-y-1 text-xs text-paper/60 font-body">
            <p>Phone / WhatsApp: <a className="hover:text-marigold" href="https://wa.me/923086177169">03086177169</a></p>
            <p>Email: <a className="hover:text-marigold" href="mailto:fetchwow1@gmail.com">fetchwow1@gmail.com</a></p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-tag text-xs uppercase tracking-wide text-paper/40 mb-4">
              {col.title}
            </p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="focus-ring text-sm text-paper/80 hover:text-marigold font-body"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-paper/10 py-5 text-center text-xs text-paper/40 font-tag">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
