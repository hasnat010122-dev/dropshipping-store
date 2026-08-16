"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  RotateCcw,
  Tag,
  Activity,
  LogOut,
  ExternalLink,
} from "lucide-react";

const tabs = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/discounts", label: "Discounts", icon: Tag },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/suppliers", label: "Suppliers", icon: Truck },
  { href: "/admin/activity", label: "Activity Log", icon: Activity },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin-login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0A0A10] text-[#E8E8ED] font-body flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#0E0E16] border-r border-white/[0.06] flex flex-col fixed inset-y-0">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.06]">
          <p className="font-display text-xl text-white">
            Zelko<span className="text-coral">.</span>
          </p>
          <span className="ml-2 text-[10px] font-tag uppercase tracking-widest text-white/30 border border-white/10 rounded px-1.5 py-0.5">
            Admin
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {tabs.map((t) => {
            const active =
              t.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`focus-ring flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-gradient-to-r from-coral/20 to-transparent text-white border border-coral/30"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.04]"
          >
            <ExternalLink size={17} strokeWidth={2} />
            View store
          </a>
          <button
            onClick={handleLogout}
            className="focus-ring w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-coral hover:bg-white/[0.04]"
          >
            <LogOut size={17} strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        <main className="max-w-6xl mx-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
