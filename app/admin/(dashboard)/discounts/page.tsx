"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Tag } from "lucide-react";
import type { CouponRow } from "@/lib/db";

const emptyForm = {
  code: "",
  type: "percent" as "percent" | "fixed",
  value: "",
  active: true,
  usageLimit: "",
  expiresAt: "",
};

export default function AdminDiscountsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/coupons");
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(c: CouponRow) {
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      active: c.active,
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    });
    setEditingId(c.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!form.code || !form.value) {
      setMessage("Please enter a code and a value.");
      return;
    }
    setSaving(true);
    const res = await fetch(
      editingId ? `/api/coupons/${editingId}` : "/api/coupons",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          usageLimit: form.usageLimit || null,
          expiresAt: form.expiresAt || null,
        }),
      }
    );
    if (res.ok) {
      setMessage(editingId ? "Coupon updated ✓" : "Coupon created ✓");
      resetForm();
      load();
    } else {
      const data = await res.json();
      setMessage(data.error || "Something went wrong.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    load();
  }

  const inputClass =
    "focus-ring w-full bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-coral placeholder:text-white/25";
  const labelClass = "text-xs text-white/40 mb-1.5 block";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white mb-1">
          Discount Codes
        </h1>
        <p className="text-white/40 text-sm">
          Create coupon codes customers can apply at checkout.
        </p>
      </div>

      <div className="bg-[#12121C] border border-white/[0.06] rounded-xl p-6 mb-8">
        <h2 className="font-display text-xl text-white mb-5">
          {editingId ? "Edit code" : "Create a code"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className={labelClass}>Code</span>
              <input
                required
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="e.g. WELCOME10"
                className={`${inputClass} font-tag uppercase`}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Type</span>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as "percent" | "fixed" })
                }
                className={inputClass}
              >
                <option value="percent">Percentage off</option>
                <option value="fixed">Fixed amount off (Rs)</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>
                Value {form.type === "percent" ? "(%)" : "(Rs)"}
              </span>
              <input
                required
                type="number"
                min="0"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={form.type === "percent" ? "10" : "500"}
                className={`${inputClass} font-tag`}
              />
            </label>
            <label className="block">
              <span className={labelClass}>
                Usage limit <span className="text-white/25">(optional)</span>
              </span>
              <input
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) =>
                  setForm({ ...form, usageLimit: e.target.value })
                }
                placeholder="Unlimited"
                className={`${inputClass} font-tag`}
              />
            </label>
            <label className="block">
              <span className={labelClass}>
                Expires on <span className="text-white/25">(optional)</span>
              </span>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
                className="accent-coral w-4 h-4"
              />
              <span className="text-sm text-white/70">Active</span>
            </label>
          </div>

          {message && <p className="text-sm text-coral">{message}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="focus-ring bg-coral text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-coral-dim transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId ? "Update code" : "Create code"}
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
        Your codes {coupons.length > 0 && `(${coupons.length})`}
      </h2>

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : coupons.length === 0 ? (
        <div className="bg-[#12121C] border border-white/[0.06] rounded-xl p-10 text-center">
          <Tag size={24} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            No discount codes yet — create one above.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {coupons.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const limitReached =
              c.usageLimit !== null && c.usedCount >= c.usageLimit;
            const isLive = c.active && !expired && !limitReached;
            return (
              <div
                key={c.id}
                className="bg-[#12121C] border border-white/[0.06] rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-tag text-lg text-white">{c.code}</p>
                    <p className="text-sm text-white/50">
                      {c.type === "percent" ? `${c.value}% off` : `Rs ${c.value} off`}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => startEdit(c)}
                      className="focus-ring p-2 rounded-lg border border-white/10 text-white/60 hover:border-white/30"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      className="focus-ring p-2 rounded-lg border border-white/10 text-coral hover:border-coral"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-tag px-2 py-0.5 rounded-full uppercase ${
                      isLive
                        ? "text-emerald-300 bg-emerald-400/10"
                        : "text-white/40 bg-white/5"
                    }`}
                  >
                    {isLive ? "Live" : expired ? "Expired" : limitReached ? "Limit reached" : "Inactive"}
                  </span>
                  <span className="text-[11px] font-tag px-2 py-0.5 rounded-full text-white/40 bg-white/5">
                    Used {c.usedCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </span>
                  {c.expiresAt && (
                    <span className="text-[11px] font-tag px-2 py-0.5 rounded-full text-white/40 bg-white/5">
                      Expires {new Date(c.expiresAt).toLocaleDateString()}
                    </span>
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
