"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import type { SitePageRow } from "@/lib/db";
import { SITE_PAGE_SLUGS, SITE_PAGE_LABELS, type SitePageSlug } from "@/lib/site-pages";

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Record<string, SitePageRow>>({});
  const [active, setActive] = useState<SitePageSlug>("about");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/pages");
    if (res.ok) {
      const rows: SitePageRow[] = await res.json();
      const bySlug: Record<string, SitePageRow> = {};
      rows.forEach((p) => (bySlug[p.slug] = p));
      setPages(bySlug);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Load the selected page into the form.
  useEffect(() => {
    const page = pages[active];
    if (page) {
      setTitle(page.title);
      setContent(page.content);
    }
    setMessage("");
  }, [active, pages]);

  async function handleSave() {
    setMessage("");
    if (!title.trim()) {
      setMessage("Please give the page a title.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/pages/${active}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      const updated: SitePageRow = await res.json();
      setPages((prev) => ({ ...prev, [active]: updated }));
      setMessage("Page saved ✓ — it's live on the store now.");
    } else {
      setMessage("Something went wrong — please try again.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 4000);
  }

  const inputClass =
    "focus-ring w-full bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-coral placeholder:text-white/25";

  const current = pages[active];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Pages</h1>
          <p className="text-white/40 text-sm">
            Write and manage the content of your store&apos;s About Us and
            Contact Us pages. Changes go live as soon as you save.
          </p>
        </div>
        <a
          href={`/${active}`}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring flex items-center gap-2 text-sm text-white/50 hover:text-white border border-white/10 rounded-lg px-3 py-2 hover:border-white/30 transition-colors"
        >
          <ExternalLink size={14} />
          View page
        </a>
      </div>

      {/* Page picker */}
      <div className="flex gap-2 mb-6">
        {SITE_PAGE_SLUGS.map((slug) => (
          <button
            key={slug}
            onClick={() => setActive(slug)}
            className={`focus-ring px-4 py-2.5 rounded-lg text-sm border transition-colors ${
              active === slug
                ? "bg-gradient-to-r from-coral/20 to-transparent text-white border-coral/30"
                : "text-white/50 hover:text-white hover:bg-white/[0.04] border-white/10"
            }`}
          >
            {SITE_PAGE_LABELS[slug]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : (
        <div className="bg-[#12121C] border border-white/[0.06] rounded-xl p-6">
          <div className="grid gap-4">
            <label className="block">
              <span className="text-xs text-white/40 mb-1.5 block">Page title</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={SITE_PAGE_LABELS[active]}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="text-xs text-white/40 mb-1.5 block">
                Page content
              </span>
              <textarea
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the page content here…"
                className={`${inputClass} resize-y leading-relaxed`}
              />
              <span className="text-[11px] text-white/30 mt-1.5 block">
                Leave a blank line between paragraphs — each block shows up as
                its own paragraph on the store page.
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="focus-ring flex items-center gap-2 bg-coral text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-coral-dim transition-colors disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? "Saving…" : "Save changes"}
            </button>
            {current?.updatedAt && (
              <span className="text-xs text-white/30">
                Last updated{" "}
                {new Date(current.updatedAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            )}
          </div>

          {message && <p className="text-sm text-coral mt-3">{message}</p>}
        </div>
      )}

      <p className="text-white/30 text-xs mt-6 max-w-2xl">
        Note: the Contact Us page always shows your store&apos;s WhatsApp
        number and email below the content you write here. Set them in your
        environment variables (
        <code className="font-tag">NEXT_PUBLIC_STORE_WHATSAPP</code> and{" "}
        <code className="font-tag">NEXT_PUBLIC_STORE_EMAIL</code>) — see{" "}
        <code className="font-tag">.env.local.example</code>.
      </p>
    </div>
  );
}
