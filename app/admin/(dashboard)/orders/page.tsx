"use client";

import { useEffect, useState } from "react";
import { Truck, ExternalLink, MessageCircle, Mail, Package } from "lucide-react";
import type { OrderRow, SupplierRow, ProductRow, FulfillmentStatus } from "@/lib/db";
import { BRAND } from "@/lib/brand";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const FULFILLMENT_STATUSES: { value: FulfillmentStatus; label: string }[] = [
  { value: "not_ordered", label: "Not ordered from supplier" },
  { value: "ordered_from_supplier", label: "Ordered from supplier" },
  { value: "shipped_by_supplier", label: "Shipped by supplier" },
  { value: "delivered", label: "Delivered to customer" },
];

const fulfillmentColor: Record<string, string> = {
  not_ordered: "text-white/40 bg-white/5",
  ordered_from_supplier: "text-blue-300 bg-blue-400/10",
  shipped_by_supplier: "text-purple-300 bg-purple-400/10",
  delivered: "text-emerald-300 bg-emerald-400/10",
};

function whatsappLink(phone: string, message: string) {
  let digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("0")) digits = "92" + digits.slice(1);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

type SupplierGroup = {
  supplier: SupplierRow;
  items: { name: string; qty: number; color?: string | null }[];
};

// Groups an order's line items by which supplier each product is sourced
// from, so the admin can see — and act on — exactly who needs this order.
function getSupplierGroups(
  order: OrderRow,
  products: ProductRow[],
  suppliers: SupplierRow[]
): { groups: SupplierGroup[]; unassignedCount: number } {
  const groups = new Map<string, SupplierGroup>();
  let unassignedCount = 0;

  for (const item of order.items) {
    const product = products.find((p) => p.id === item.id);
    const supplier = product?.supplierId
      ? suppliers.find((s) => s.id === product.supplierId)
      : undefined;

    if (!supplier) {
      unassignedCount += 1;
      continue;
    }

    if (!groups.has(supplier.id)) {
      groups.set(supplier.id, { supplier, items: [] });
    }
    groups.get(supplier.id)!.items.push({ name: item.name, qty: item.qty, color: item.color });
  }

  return { groups: Array.from(groups.values()), unassignedCount };
}

function buildSupplierMessage(order: OrderRow, group: SupplierGroup) {
  const itemLines = group.items.map((i) => `• ${i.name}${i.color ? ` (${i.color})` : ""} × ${i.qty}`).join("\n");
  return `New order from ${BRAND.name} — please ship directly to the customer below.

Order ref: ${order.id.slice(0, 8).toUpperCase()}

Items:
${itemLines}

Ship to:
${order.customerName}
${order.address}, ${order.city}
${order.phone}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [oRes, sRes, pRes] = await Promise.all([
      fetch("/api/orders"),
      fetch("/api/suppliers"),
      fetch("/api/products"),
    ]);
    if (oRes.ok) setOrders(await oRes.json());
    if (sRes.ok) setSuppliers(await sRes.json());
    if (pRes.ok) setProducts(await pRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function patchOrder(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Order could not be updated.");
      await load();
      return false;
    }
    setOrders((prev) => prev.map((order) => (order.id === id ? data : order)));
    return true;
  }

  function markSentToSupplier(order: OrderRow, group: SupplierGroup, via: string) {
    if ((order.approvalStatus || "pending") !== "approved") {
      alert("Approve this order before forwarding it to a supplier.");
      return;
    }
    patchOrder(order.id, {
      supplierId: group.supplier.id,
      fulfillmentStatus: "ordered_from_supplier",
      fulfillmentNotes: `${order.fulfillmentNotes ? order.fulfillmentNotes + "\n" : ""}Sent to ${group.supplier.name} via ${via} on ${new Date().toLocaleString()}`,
    });
  }

  const inputClass =
    "focus-ring bg-[#0A0A10] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-coral";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white mb-1">Orders</h1>
        <p className="text-white/40 text-sm">
          Track customer orders and send them straight to the right supplier.
        </p>
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-white/40 text-sm">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const { groups, unassignedCount } = getSupplierGroups(o, products, suppliers);
            const isOpen = expanded === o.id;
            const activeSupplier = suppliers.find((s) => s.id === o.supplierId);

            return (
              <div
                key={o.id}
                className="bg-[#12121C] border border-white/[0.06] rounded-xl p-5"
              >
                <div className="flex flex-wrap justify-between gap-3 mb-3">
                  <div>
                    <p className="text-white font-medium">{o.customerName}</p>
                    <p className="text-sm text-white/40 flex items-center gap-2">
                      {o.phone} · {o.city}
                      <a
                        href={whatsappLink(
                          o.phone,
                          `Hi ${o.customerName}, this is ${BRAND.name} regarding your order #${o.id
                            .slice(0, 8)
                            .toUpperCase()}. `
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        title="Message customer on WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-tag px-2 py-1 rounded-full uppercase ${
                        fulfillmentColor[o.fulfillmentStatus]
                      }`}
                    >
                      {FULFILLMENT_STATUSES.find(
                        (f) => f.value === o.fulfillmentStatus
                      )?.label}
                    </span>
                    <select
                      value={o.status}
                      onChange={(e) =>
                        patchOrder(o.id, { status: e.target.value })
                      }
                      className={`${inputClass} capitalize py-1.5`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`mb-3 rounded-lg border px-3 py-2.5 flex flex-wrap items-center gap-2 ${
                  (o.approvalStatus || "pending") === "approved"
                    ? "border-emerald-400/25 bg-emerald-400/5"
                    : (o.approvalStatus || "pending") === "rejected"
                    ? "border-red-400/25 bg-red-400/5"
                    : "border-amber-400/25 bg-amber-400/5"
                }`}>
                  <span className="text-xs text-white/60">
                    Owner approval: <b className="uppercase text-white">{o.approvalStatus || "pending"}</b>
                  </span>
                  <span className="flex-1" />
                  {(o.approvalStatus || "pending") !== "approved" && (
                    <button onClick={() => patchOrder(o.id, { approvalStatus: "approved" })} className="focus-ring text-xs rounded-md bg-emerald-500 px-3 py-1.5 text-white hover:bg-emerald-400">
                      Approve order
                    </button>
                  )}
                  {(o.approvalStatus || "pending") === "pending" && (
                    <button onClick={() => patchOrder(o.id, { approvalStatus: "rejected" })} className="focus-ring text-xs rounded-md border border-red-400/30 px-3 py-1.5 text-red-200 hover:bg-red-400/10">
                      Reject
                    </button>
                  )}
                </div>

                {/* Which supplier owns this order — always visible, not tucked away */}
                <div className="flex items-center gap-1.5 text-xs text-white/50 mb-3">
                  <Package size={13} />
                  {activeSupplier ? (
                    <span>
                      Assigned to <span className="text-white/80">{activeSupplier.name}</span> ({activeSupplier.platform})
                    </span>
                  ) : groups.length > 0 ? (
                    <span className="text-amber-300">
                      {groups.length} supplier{groups.length > 1 ? "s" : ""} detected — not yet sent
                    </span>
                  ) : (
                    <span>No supplier linked to these products yet</span>
                  )}
                </div>

                <p className="text-sm text-white/40 mb-3">{o.address}</p>

                <div className="border-t border-white/[0.06] pt-3 space-y-1 mb-3">
                  {o.items.map((i) => (
                    <div
                      key={i.id}
                      className="flex justify-between text-sm text-white/60"
                    >
                      <span>
                        {i.name}{i.color ? ` — ${i.color}` : ""} × {i.qty}
                      </span>
                      <span className="font-tag">
                        Rs {(i.price * i.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-white/[0.06] pt-3">
                  <span className="text-xs font-tag text-white/30 uppercase">
                    {o.paymentMethod} · {new Date(o.createdAt).toLocaleString()}
                  </span>
                  <span className="font-display text-white">
                    Rs {o.total.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  className="focus-ring mt-4 flex items-center gap-1.5 text-xs text-coral hover:underline"
                >
                  <Truck size={13} />
                  {isOpen ? "Hide fulfillment" : "Send to supplier / fulfillment tracking"}
                </button>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-5">
                    {/* Detected supplier groups — the main "send to supplier" action */}
                    {groups.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-white/40 uppercase tracking-wide font-tag">
                          Send this order to
                        </p>
                        {groups.map((group) => (
                          <div
                            key={group.supplier.id}
                            className="bg-[#0A0A10] border border-white/10 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-white font-medium">
                                  {group.supplier.name}
                                </p>
                                <p className="text-xs text-white/40">
                                  {group.supplier.platform}
                                </p>
                              </div>
                              {o.supplierId === group.supplier.id &&
                                o.fulfillmentStatus !== "not_ordered" && (
                                  <span className="text-[10px] font-tag uppercase text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                    Sent
                                  </span>
                                )}
                            </div>
                            <ul className="text-xs text-white/60 mb-3 space-y-0.5">
                              {group.items.map((i) => (
                                <li key={i.name}>
                                  • {i.name}{i.color ? ` — ${i.color}` : ""} × {i.qty}
                                </li>
                              ))}
                            </ul>
                            {(o.approvalStatus || "pending") === "approved" ? (
                              <div className="flex gap-2">
                                {group.supplier.email ? (
                                  <a href={`mailto:${group.supplier.email}?subject=${encodeURIComponent(`New order — ${BRAND.name} #${o.id.slice(0, 8).toUpperCase()}`)}&body=${encodeURIComponent(buildSupplierMessage(o, group))}`} onClick={() => markSentToSupplier(o, group, "email")} className="focus-ring flex items-center gap-1.5 text-xs border border-white/10 rounded-lg px-3 py-2 text-white/70 hover:border-coral hover:text-coral transition-colors">
                                    <Mail size={13} /> Email order
                                  </a>
                                ) : <span className="text-xs text-white/25 px-3 py-2">No supplier email on file</span>}
                                {group.supplier.phone ? (
                                  <a href={whatsappLink(group.supplier.phone, buildSupplierMessage(o, group))} target="_blank" rel="noopener noreferrer" onClick={() => markSentToSupplier(o, group, "WhatsApp")} className="focus-ring flex items-center gap-1.5 text-xs border border-white/10 rounded-lg px-3 py-2 text-white/70 hover:border-emerald-400 hover:text-emerald-400 transition-colors">
                                    <MessageCircle size={13} /> WhatsApp order
                                  </a>
                                ) : <span className="text-xs text-white/25 px-3 py-2">No supplier phone on file</span>}
                              </div>
                            ) : (
                              <p className="text-xs text-amber-200 border border-amber-400/20 bg-amber-400/5 rounded-lg px-3 py-2">Approve this order above before supplier forwarding controls are enabled.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {unassignedCount > 0 && (
                      <p className="text-xs text-amber-300/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
                        {unassignedCount} item{unassignedCount > 1 ? "s" : ""} in
                        this order {unassignedCount > 1 ? "aren't" : "isn't"}{" "}
                        linked to a supplier yet — add one from the Products
                        tab so it shows up here.
                      </p>
                    )}

                    {/* Manual override / status tracking */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-1">
                      <label className="block">
                        <span className="text-xs text-white/40 mb-1.5 block">
                          Supplier on record
                        </span>
                        <select
                          value={o.supplierId || ""}
                          onChange={(e) =>
                            patchOrder(o.id, { supplierId: e.target.value || null })
                          }
                          className={`${inputClass} w-full`}
                        >
                          <option value="">— No supplier selected —</option>
                          {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-xs text-white/40 mb-1.5 block">
                          Fulfillment status
                        </span>
                        <select
                          value={o.fulfillmentStatus}
                          disabled={(o.approvalStatus || "pending") !== "approved"}
                          onChange={(e) =>
                            patchOrder(o.id, {
                              fulfillmentStatus: e.target.value,
                            })
                          }
                          className={`${inputClass} w-full disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {FULFILLMENT_STATUSES.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-xs text-white/40 mb-1.5 block">
                          Supplier tracking number
                        </span>
                        <input
                          defaultValue={o.supplierTrackingNumber || ""}
                          onBlur={(e) =>
                            patchOrder(o.id, {
                              supplierTrackingNumber: e.target.value,
                            })
                          }
                          placeholder="e.g. LY1234567890CN"
                          className={`${inputClass} w-full`}
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs text-white/40 mb-1.5 block">
                          Tracking link
                        </span>
                        <div className="flex gap-2">
                          <input
                            defaultValue={o.supplierTrackingUrl || ""}
                            onBlur={(e) =>
                              patchOrder(o.id, {
                                supplierTrackingUrl: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            className={`${inputClass} flex-1`}
                          />
                          {o.supplierTrackingUrl && (
                            <a
                              href={o.supplierTrackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="focus-ring shrink-0 border border-white/10 rounded-lg px-3 flex items-center hover:border-coral"
                            >
                              <ExternalLink size={14} className="text-white/60" />
                            </a>
                          )}
                        </div>
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="text-xs text-white/40 mb-1.5 block">
                          Fulfillment notes
                        </span>
                        <textarea
                          rows={2}
                          defaultValue={o.fulfillmentNotes || ""}
                          onBlur={(e) =>
                            patchOrder(o.id, { fulfillmentNotes: e.target.value })
                          }
                          placeholder="Any notes about this order's fulfillment"
                          className={`${inputClass} w-full resize-none`}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
