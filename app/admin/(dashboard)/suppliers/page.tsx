"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Globe, Phone, Mail } from "lucide-react";
import type { SupplierRow } from "@/lib/db";

const PLATFORMS = [
  "AliExpress",
  "CJ Dropshipping",
  "Local Wholesaler",
  "Alibaba",
  "Zendrop",
  "Other",
];

const emptyForm = {
  name: "",
  platform: "AliExpress",
  contactName: "",
  phone: "",
  email: "",
  website: "",
  notes: "",
};

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/suppliers");
    if (res.ok) setSuppliers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(s: SupplierRow) {
    setForm({
      name: s.name,
      platform: s.platform,
      contactName: s.contactName || "",
      phone: s.phone || "",
      email: s.email || "",
      website: s.website || "",
      notes: s.notes || "",
    });
    setEditingId(s.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!form.name) {
      setMessage("Please give the supplier a name.");
      return;
    }
    setSaving(true);
    const res = await fetch(
      editingId ? `/api/suppliers/${editingId}` : "/api/suppliers",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    if (res.ok) {
      setMessage(editingId ? "Supplier updated ✓" : "Supplier added ✓");
      resetForm();
      load();
    } else {
      setMessage("Something went wrong — please try again.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Remove "${name}"? Products linked to this supplier will keep their data, but the link will need reassigning.`
      )
    )
      return;
    await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    load();
  }

  const inputClass =
    "focus-ring w-full bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-coral placeholder:text-white/25";
  const labelClass = "text-xs text-white/40 mb-1.5 block";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white mb-1">Suppliers</h1>
        <p className="text-white/40 text-sm">
          Keep track of who you source products from and how to reach them.
        </p>
      </div>

      <div className="bg-[#12121C] border border-white/[0.06] rounded-xl p-6 mb-8">
        <h2 className="font-display text-xl text-white mb-5">
          {editingId ? "Edit supplier" : "Add a supplier"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className={labelClass}>Supplier name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Shenzhen Gadget Co."
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Platform</span>
              <select
                value={form.platform}
                onChange={(e) =>
                  setForm({ ...form, platform: e.target.value })
                }
                className={inputClass}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Contact person</span>
              <input
                value={form.contactName}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
                placeholder="Optional"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Phone / WhatsApp</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Optional"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Optional"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Website / store link</span>
              <input
                value={form.website}
                onChange={(e) =>
                  setForm({ ...form, website: e.target.value })
                }
                placeholder="https://..."
                className={inputClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Notes</span>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Shipping times, minimum orders, reliability notes…"
                className={`${inputClass} resize-none`}
              />
            </label>
          </div>

          {message && <p className="text-sm text-coral">{message}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="focus-ring bg-coral text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-coral-dim transition-colors disabled:opacity-50"
            >
              {saving
                ? "Saving…"
                : editingId
                ? "Update supplier"
                : "Add supplier"}
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
        Your suppliers {suppliers.length > 0 && `(${suppliers.length})`}
      </h2>

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : suppliers.length === 0 ? (
        <p className="text-white/40 text-sm">
          No suppliers yet — add one above so you can link products to it.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-[#12121C] border border-white/[0.06] rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-medium">{s.name}</p>
                  <span className="text-[11px] font-tag uppercase text-coral bg-coral/10 px-2 py-0.5 rounded-full">
                    {s.platform}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => startEdit(s)}
                    className="focus-ring p-2 rounded-lg border border-white/10 text-white/60 hover:border-white/30"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="focus-ring p-2 rounded-lg border border-white/10 text-coral hover:border-coral"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 mt-3 text-xs text-white/50">
                {s.contactName && <p>👤 {s.contactName}</p>}
                {s.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone size={12} /> {s.phone}
                  </p>
                )}
                {s.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail size={12} /> {s.email}
                  </p>
                )}
                {s.website && (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-coral hover:underline w-fit"
                  >
                    <Globe size={12} /> Visit store
                  </a>
                )}
                {s.notes && (
                  <p className="text-white/30 pt-1 border-t border-white/[0.06] mt-2">
                    {s.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
