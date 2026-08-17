import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Truck,
  RotateCcw,
  AlertTriangle,
  Package,
  ArrowUpRight,
} from "lucide-react";
import { getDashboardStats, getRecentActivity } from "@/lib/db";
import RevenueChart from "@/components/admin/RevenueChart";

export const dynamic = "force-dynamic";

const activityIcons: Record<string, string> = {
  order_placed: "🛒",
  order_status_changed: "📦",
  order_fulfillment_updated: "🚚",
  product_added: "✨",
  product_updated: "✏️",
  product_deleted: "🗑️",
  supplier_added: "🤝",
  supplier_updated: "✏️",
  supplier_deleted: "🗑️",
  admin_login: "🔐",
  return_requested: "↩️",
  return_status_changed: "🔄",
  coupon_added: "🏷️",
  coupon_updated: "🏷️",
  coupon_deleted: "🏷️",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([getDashboardStats(), getRecentActivity(8)]);

  const cards = [
    {
      label: "Total Revenue",
      value: `Rs ${stats.totalRevenue.toLocaleString()}`,
      sub: `Rs ${stats.revenueToday.toLocaleString()} today`,
      icon: DollarSign,
      color: "text-coral",
      bg: "bg-coral/10",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      sub: `${stats.ordersToday} today`,
      icon: ShoppingBag,
      color: "text-marigold",
      bg: "bg-marigold/10",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      sub: "need your attention",
      icon: Clock,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Awaiting Supplier",
      value: stats.awaitingSupplierOrder,
      sub: "not ordered yet",
      icon: Truck,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Pending Returns",
      value: stats.pendingReturns,
      sub: "need review",
      icon: RotateCcw,
      color: "text-amber-300",
      bg: "bg-amber-300/10",
    },
    {
      label: "Low / Out of Stock",
      value: stats.lowStock + stats.outOfStock,
      sub: `${stats.outOfStock} out of stock`,
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Products & Suppliers",
      value: stats.totalProducts,
      sub: `${stats.totalSuppliers} suppliers connected`,
      icon: Package,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white mb-1">Dashboard</h1>
        <p className="text-white/40 text-sm">
          Here&apos;s what&apos;s happening in your store right now.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-[#12121C] border border-white/[0.06] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`p-2 rounded-lg ${c.bg}`}>
                  <Icon size={18} className={c.color} strokeWidth={2} />
                </span>
              </div>
              <p className="font-tag text-2xl text-white mb-1">{c.value}</p>
              <p className="text-xs text-white/40">{c.label}</p>
              <p className="text-[11px] text-white/25 mt-0.5">{c.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#12121C] border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-white">
              Revenue — last 7 days
            </h2>
          </div>
          <RevenueChart data={stats.chartData} />
        </div>

        {/* Top products */}
        <div className="bg-[#12121C] border border-white/[0.06] rounded-xl p-6">
          <h2 className="font-display text-lg text-white mb-4">
            Top products
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-white/30">
              No sales yet — once orders come in, your bestsellers show up
              here.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/[0.06] text-xs flex items-center justify-center text-white/50 font-tag shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{p.name}</p>
                    <p className="text-xs text-white/30">{p.qty} sold</p>
                  </div>
                  <span className="font-tag text-sm text-coral shrink-0">
                    Rs {p.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 bg-[#12121C] border border-white/[0.06] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-white">Recent activity</h2>
          <Link
            href="/admin/activity"
            className="focus-ring text-xs text-coral hover:underline flex items-center gap-1"
          >
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        {activity.length === 0 ? (
          <p className="text-sm text-white/30">
            Nothing yet — activity will show up here as your store gets used.
          </p>
        ) : (
          <div className="space-y-3">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <span className="text-base leading-none mt-0.5">
                  {activityIcons[a.type] || "•"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80">{a.message}</p>
                </div>
                <span className="text-xs text-white/25 font-tag shrink-0">
                  {timeAgo(a.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
