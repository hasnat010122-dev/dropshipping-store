"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Camera, Pencil, Trash2 } from "lucide-react";
import type { ProductRow, SupplierRow } from "@/lib/db";

const CATEGORIES = ["Tech", "Home", "Fashion", "Beauty", "Other"];
const BADGES = ["None", "New", "Trending", "Bestseller"];

const emptyForm = {
  name: "",
  price: "",
  compareAt: "",
  category: "Tech",
  badge: "None",
  image: "",
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
      price: String(p.price),
      compareAt: p.compareAt ? String(p.compareAt) : "",
      category: p.category,
      badge: p.badge || "None",
      image: p.image,
      description: p.description || "",
      stock: String(p.stock),
      supplierId: p.supplierId || "",
      supplierProductUrl: p.supplierProductUrl || "",
      supplierCost: p.supplierCost ? String(p.supplierCost) : "",
    });
    setEditingId(p.id);
    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({ ...f, image: data.url }));
    } else {
      setMessage(data.error || "Photo upload failed — try a different photo.");
    }
    setUploading(false);
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
      price: Number(form.price),
      compareAt: form.compareAt ? Number(form.compareAt) : null,
      category: form.category,
      badge: form.badge === "None" ? null : form.badge,
      image: form.image,
      description: form.description,
      stock: Number(form.stock),
      supplierId: form.supplierId || null,
      supplierProductUrl: form.supplierProductUrl || null,
      supplierCost: form.supplierCost ? Number(form.supplierCost) : null,
    };

    const res = await fetch(
      editingId ? `/api/products/${editingId}` : "/api/products",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      setMessage(editingId ? "Product updated ✓" : "Product added ✓");
      resetForm();
      loadAll();
    } else {
      const data = await res.json();
      setMessage(data.error || "Something went wrong — please try again.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
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
            <span className={labelClass}>Photo</span>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 bg-[#0A0A10] border border-dashed border-white/15 rounded-lg shrink-0 overflow-hidden">
                {form.image ? (
                  <Image
                    src={form.image}
                    alt="Preview"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-white/20">
                    <Camera size={20} />
                  </span>
                )}
              </div>
              <label className="focus-ring cursor-pointer bg-coral text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-coral-dim transition-colors">
                {uploading ? "Uploading…" : "Choose photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
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
              <span className={labelClass}>Selling price (Rs)</span>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="2499"
                className={`${inputClass} font-tag`}
              />
            </label>

            <label className="block">
              <span className={labelClass}>
                Original price{" "}
                <span className="text-white/25">(optional)</span>
              </span>
              <input
                type="number"
                min="0"
                value={form.compareAt}
                onChange={(e) =>
                  setForm({ ...form, compareAt: e.target.value })
                }
                placeholder="3999"
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
                <span className={labelClass}>Your cost from supplier (Rs)</span>
                <input
                  type="number"
                  min="0"
                  value={form.supplierCost}
                  onChange={(e) =>
                    setForm({ ...form, supplierCost: e.target.value })
                  }
                  placeholder="1200"
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
                  Rs {p.price.toLocaleString()} · {p.stock} in stock
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
