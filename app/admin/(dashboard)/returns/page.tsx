"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { ReturnRequestRow, ReturnRequestStatus } from "@/lib/db";

const STATUSES: ReturnRequestStatus[] = [
  "requested",
  "approved",
  "rejected",
  "refunded",
];

const statusColor: Record<string, string> = {
  requested: "text-amber-300 bg-amber-400/10",
  approved: "text-blue-300 bg-blue-400/10",
  rejected: "text-coral bg-coral/10",
  refunded: "text-emerald-300 bg-emerald-400/10",
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/returns");
    if (res.ok) setReturns(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: status as ReturnRequestStatus } : r))
    );
    await fetch(`/api/returns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white mb-1">
          Return Requests
        </h1>
        <p className="text-white/40 text-sm">
          Customer-submitted returns and exchanges, newest first.
        </p>
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : returns.length === 0 ? (
        <div className="bg-[#12121C] border border-white/[0.06] rounded-xl p-10 text-center">
          <RotateCcw size={24} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            No return requests yet — they&apos;ll show up here as customers
            submit them from the Returns page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((r) => (
            <div
              key={r.id}
              className="bg-[#12121C] border border-white/[0.06] rounded-xl p-5"
            >
              <div className="flex flex-wrap justify-between gap-3 mb-3">
                <div>
                  <p className="text-white font-medium">{r.customerName}</p>
                  <p className="text-sm text-white/40">{r.phone}</p>
                </div>
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="focus-ring bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-coral capitalize h-fit"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[11px] font-tag px-2 py-1 rounded-full uppercase ${statusColor[r.status]}`}
                >
                  {r.status}
                </span>
                <span className="text-[11px] font-tag px-2 py-1 rounded-full uppercase text-white/40 bg-white/5 capitalize">
                  {r.requestType}
                </span>
              </div>

              <p className="text-sm text-white/70 mb-1">
                <span className="text-white/40">Item: </span>
                {r.itemName}
              </p>
              <p className="text-sm text-white/70 mb-1">
                <span className="text-white/40">Reason: </span>
                {r.reason}
              </p>
              {r.comments && (
                <p className="text-sm text-white/50 mb-1 italic">
                  &ldquo;{r.comments}&rdquo;
                </p>
              )}

              <div className="flex justify-between items-center border-t border-white/[0.06] pt-3 mt-3">
                <span className="text-xs font-tag text-white/30">
                  Order #{r.orderId.slice(0, 8).toUpperCase()} ·{" "}
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
