"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Pencil, Trash2, X, Plus } from "lucide-react";
import type { ProductRow, SupplierRow } from "@/lib/db";
import { formatUSD, pkrToUsd, usdToPkr } from "@/lib/currency";

const CATEGORIES = ["Tech", "Home", "Fashion", "Beauty", "Other"];
const BADGES = ["None", "New", "Trending", "Bestseller"];

type ProductForm = {
  name: string;
  price: string;
  compareAt: string;
  category: string;
  badge: string;
  image: string;
  images: string[];
  colors: string[];
  colorImages: Record<string, string>;
  description: string;
  stock: string;
  supplierId: string;
  supplierProductUrl: string;
  supplierCost: string;
};

const emptyForm: ProductForm = {
  name: "",
  price: "",
  compareAt: "",
  category: "Tech",
  badge: "None",
  image: "",
  images: [],
  colors: [],
  colorImages: {},
  description: "",
  stock: "10",
  supplierId: "",
  supplierProductUrl: "",
  supplierCost: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newColor, setNewColor] = useState("");
  const formTopRef = useRef<HTMLDivElement>(null);

  async function loadAll() {
    setLoading(true);
    const [pRes, sRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/suppliers"),
    ]);
    setProducts(await pRes.json());
    if (sRes.ok) setSuppliers(await sRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(p: ProductRow) {
    setForm({
      name: p.name,
      price: pkrToUsd(p.price).toFixed(2),
      compareAt: p.compareAt ? pkrToUsd(p.compareAt).toFixed(2) : "",
      category: p.category,
      badge: p.badge || "None",
      image: p.image,
      images: p.images?.length ? p.images : [p.image],
      colors: p.colors || [],
      colorImages: p.colorImages || {},
      description: p.description || "",
      stock: String(p.stock),
      supplierId: p.supplierId || "",
      supplierProductUrl: p.supplierProductUrl || "",
      supplierCost: p.supplierCost ? pkrToUsd(p.supplierCost).toFixed(2) : "",
    });
    setEditingId(p.id);
    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, Math.max(0, 12 - form.images.length));
    if (!files.length) return;
    setUploading(true);
    setMessage("");
    const uploaded: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || `Could not upload ${file.name}.`);
        continue;
      }
      uploaded.push(data.url);
    }
    if (uploaded.length) {
      setForm((f) => {
        const images = [...f.images, ...uploaded].slice(0, 12);
        return { ...f, images, image: images[0] || "" };
      });
    }
    e.target.value = "";
    setUploading(false);
  }

  function removeImage(url: string) {
    setForm((f) => {
      const images = f.images.filter((image) => image !== url);
      return { ...f, images, image: images[0] || "" };
    });
  }

  function makeCover(url: string) {
    setForm((f) => {
      const images = [url, ...f.images.filter((image) => image !== url)];
      return { ...f, images, image: url };
    });
  }

  function addColor() {
    const color = newColor.trim();
    if (!color || form.colors.some((item) => item.toLowerCase() === color.toLowerCase())) return;
    setForm((current) => ({ ...current, colors: [...current.colors, color] }));
    setNewColor("");
  }

  function removeColor(color: string) {
    setForm((current) => {
      const colorImages = { ...current.colorImages };
      delete colorImages[color];
      return { ...current, colors: current.colors.filter((item) => item !== color), colorImages };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!form.name || !form.price || !form.image) {
      setMessage("Please fill in a name, price, and photo before saving.");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      price: usdToPkr(Number(form.price)),
      compareAt: form.compareAt ? usdToPkr(Number(form.compareAt)) : null,
      category: form.category,
      badge: form.badge === "None" ? null : form.badge,
      image: form.images[0] || form.image,
      images: form.images,
      colors: form.colors,
      colorImages: Object.fromEntries(Object.entries(form.colorImages).filter(([color, url]) => form.colors.includes(color) && url)),
      description: form.description,
      stock: Number(form.stock),
      supplierId: form.supplierId || null,
      supplierProductUrl: form.supplierProductUrl || null,
      supplierCost: form.supplierCost ? usdToPkr(Number(form.supplierCost)) : null,
    };

    try {
      const res = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        // Vercel may return plain text for an unexpected server error.
      }
      if (!res.ok) {
        throw new Error(data.error || `Product could not be saved (HTTP ${res.status}).`);
      }
      setMessage(editingId ? "Product updated ✓" : "Product added ✓");
      resetForm();
      await loadAll();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function changePublication(id: string, publicationStatus: "draft" | "approved" | "published") {
    setMessage("");
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicationStatus }),
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Publication status could not be changed.");
    else setMessage(publicationStatus === "published" ? "Product published ✓" : publicationStatus === "approved" ? "Product approved ✓" : "Product moved to draft");
    await loadAll();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove "${name}" from the store? This can't be undone.`))
      return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadAll();
  }

  const inputClass =
    "focus-ring w-full bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-coral placeholder:text-white/25";
  const labelClass = "text-xs text-white/40 mb-1.5 block";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white mb-1">Products</h1>
        <p className="text-white/40 text-sm">
          Add products and optionally link them to a supplier for fulfillment.
        </p>
      </div>

      <div
        ref={formTopRef}
        className="bg-[#12121C] border border-white/[0.06] rounded-xl p-6 mb-8"
      >
        <h2 className="font-display text-xl text-white mb-5">
          {editingId ? "Edit product" : "Add a new product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <span className={labelClass}>Product photos (up to 12)</span>
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                {form.images.map((url, index) => (
                  <div key={url} className="relative aspect-square bg-[#0A0A10] border border-white/10 rounded-lg overflow-hidden group">
                    <Image src={url} alt={`Product photo ${index + 1}`} fill sizes="120px" className="object-cover" />
                    <button type="button" onClick={() => removeImage(url)} aria-label="Remove photo" className="absolute top-1 right-1 bg-black/75 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <X size={13} />
                    </button>
                    <button type="button" onClick={() => makeCover(url)} className={`absolute bottom-0 inset-x-0 text-[10px] py-1 ${index === 0 ? "bg-coral text-white" : "bg-black/75 text-white/80 opacity-0 group-hover:opacity-100 focus:opacity-100"}`}>
                      {index === 0 ? "Cover" : "Make cover"}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="focus-ring inline-flex cursor-pointer bg-coral text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-coral-dim transition-colors">
              {uploading ? "Uploading…" : form.images.length ? "Add more photos" : "Choose photos"}
              <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading || form.images.length >= 12} className="hidden" />
            </label>
            <p className="text-xs text-white/30 mt-2">The first photo is the cover. Click another photo to make it the cover.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block sm:col-span-2">
              <span className={labelClass}>Product name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Aurora Cloud Night Lamp"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Selling price (USD)</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="18.00"
                className={`${inputClass} font-tag`}
              />
            </label>

            <label className="block">
              <span className={labelClass}>
                Original price (USD){" "}
                <span className="text-white/25">(optional)</span>
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.compareAt}
                onChange={(e) =>
                  setForm({ ...form, compareAt: e.target.value })
                }
                placeholder="25.00"
                className={`${inputClass} font-tag`}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Category</span>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>Tag / badge</span>
              <select
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className={inputClass}
              >
                {BADGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>Stock quantity</span>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className={`${inputClass} font-tag`}
              />
            </label>

            <div className="sm:col-span-2">
              <span className={labelClass}>Available colors <span className="text-white/25">(optional)</span></span>
              <div className="flex gap-2">
                <input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
                  placeholder="Enter one color, e.g. Black"
                  className={inputClass}
                />
                <button type="button" onClick={addColor} className="focus-ring shrink-0 border border-white/15 px-4 rounded-lg text-white/80 hover:border-coral hover:text-coral">
                  <Plus size={16} />
                </button>
              </div>
              {form.colors.length > 0 && (
                <div className="space-y-3 mt-4">
                  {form.colors.map((color) => (
                    <div key={color} className="grid sm:grid-cols-[auto_1fr_auto] items-center gap-3 border border-white/10 rounded-lg p-3">
                      <span className="text-sm text-white font-medium min-w-20">{color}</span>
                      <select
                        value={form.colorImages[color] || ""}
                        onChange={(e) => setForm((current) => ({ ...current, colorImages: { ...current.colorImages, [color]: e.target.value } }))}
                        className={inputClass}
                      >
                        <option value="">Use cover image</option>
                        {form.images.map((url, index) => <option key={url} value={url}>Photo {index + 1}{index === 0 ? " (cover)" : ""}</option>)}
                      </select>
                      <button type="button" onClick={() => removeColor(color)} aria-label={`Remove ${color}`} className="text-white/40 hover:text-coral p-2"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-white/30 mt-2">Add each color separately, then optionally assign one of the uploaded photos. Without an assigned photo, the cover image is used.</p>
            </div>

            <label className="block sm:col-span-2">
              <span className={labelClass}>
                Description <span className="text-white/25">(optional)</span>
              </span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="A short note about why it's worth buying"
                className={`${inputClass} resize-none`}
              />
            </label>
          </div>

          <div className="border-t border-white/[0.06] pt-5">
            <p className="text-sm font-medium text-white/70 mb-3">
              Supplier sourcing{" "}
              <span className="text-white/30 font-normal">(optional)</span>
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={labelClass}>Supplier</span>
                <select
                  value={form.supplierId}
                  onChange={(e) =>
                    setForm({ ...form, supplierId: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">— Not sourced yet —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Your cost from supplier (USD)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.supplierCost}
                  onChange={(e) =>
                    setForm({ ...form, supplierCost: e.target.value })
                  }
                  placeholder="8.00"
                  className={`${inputClass} font-tag`}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClass}>Supplier product link</span>
                <input
                  value={form.supplierProductUrl}
                  onChange={(e) =>
                    setForm({ ...form, supplierProductUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          {message && <p className="text-sm text-coral">{message}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="focus-ring bg-coral text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-coral-dim transition-colors disabled:opacity-50"
            >
              {saving
                ? "Saving…"
                : editingId
                ? "Update product"
                : "Save product"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="focus-ring border border-white/15 px-6 py-3 rounded-lg text-sm text-white/70 hover:border-white/30 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2 className="font-display text-xl text-white mb-4">
        Your products {products.length > 0 && `(${products.length})`}
      </h2>

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-white/40 text-sm">
          Nothing here yet — add your first product above.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const supplier = suppliers.find((s) => s.id === p.supplierId);
            return (
              <div
                key={p.id}
                className="bg-[#12121C] border border-white/[0.06] rounded-xl p-3"
              >
                <div className="relative aspect-square bg-[#0A0A10] rounded-lg mb-3 overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                  {p.stock <= 0 && (
                    <span className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-tag px-2 py-1 rounded">
                      OUT OF STOCK
                    </span>
                  )}
                  <span className={`absolute top-2 right-2 text-[10px] font-tag px-2 py-1 rounded uppercase ${
                    (p.publicationStatus || "published") === "published"
                      ? "bg-emerald-500/90 text-white"
                      : (p.publicationStatus || "published") === "approved"
                      ? "bg-blue-500/90 text-white"
                      : "bg-amber-400/90 text-black"
                  }`}>
                    {p.publicationStatus || "published"}
                  </span>
                </div>
                <p className="text-white text-sm leading-snug mb-1 truncate">
                  {p.name}
                </p>
                <p className="font-tag text-xs text-white/40 mb-1">
                  {formatUSD(p.price)} · {p.stock} in stock
                </p>
                <p className="text-xs text-white/30 mb-3">
                  {supplier ? `📦 ${supplier.name}` : "No supplier linked"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="focus-ring flex-1 border border-white/10 rounded-lg py-2 text-xs text-white/70 hover:border-white/30 flex items-center justify-center gap-1.5"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="focus-ring flex-1 border border-white/10 rounded-lg py-2 text-xs text-coral hover:border-coral flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {(p.publicationStatus || "published") === "draft" && (
                    <button onClick={() => changePublication(p.id, "approved")} className="focus-ring flex-1 bg-blue-500/15 border border-blue-400/30 rounded-lg py-2 text-xs text-blue-200 hover:bg-blue-500/25">
                      Approve product
                    </button>
                  )}
                  {(p.publicationStatus || "published") === "approved" && (
                    <button onClick={() => changePublication(p.id, "published")} className="focus-ring flex-1 bg-emerald-500/15 border border-emerald-400/30 rounded-lg py-2 text-xs text-emerald-200 hover:bg-emerald-500/25">
                      Publish to store
                    </button>
                  )}
                  {(p.publicationStatus || "published") === "published" && (
                    <button onClick={() => changePublication(p.id, "approved")} className="focus-ring flex-1 border border-amber-400/30 rounded-lg py-2 text-xs text-amber-200 hover:bg-amber-500/10">
                      Unpublish
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
