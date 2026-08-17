import { getRecentActivity } from "@/lib/db";

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

export default async function AdminActivityPage() {
  const activity = await getRecentActivity(200);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white mb-1">
          Activity Log
        </h1>
        <p className="text-white/40 text-sm">
          Every action taken on your store, most recent first.
        </p>
      </div>

      <div className="bg-[#12121C] border border-white/[0.06] rounded-xl p-6">
        {activity.length === 0 ? (
          <p className="text-white/40 text-sm">
            Nothing yet — activity will show up here as your store gets used.
          </p>
        ) : (
          <div className="space-y-4">
            {activity.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 pb-4 border-b border-white/[0.04] last:border-0 last:pb-0"
              >
                <span className="text-base leading-none mt-0.5">
                  {activityIcons[a.type] || "•"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80">{a.message}</p>
                  <p className="text-xs text-white/25 font-tag mt-0.5">
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
