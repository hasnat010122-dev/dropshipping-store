"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Trash2, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatUSD } from "@/lib/currency";

type Address = {
  id: string;
  label: string;
  address: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone: string;
};
type User = { id: string; name: string; email: string; addresses: Address[] };
type OrderItem = { id: string; name: string; price: number; qty: number; color?: string | null };
type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    address: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user) {
          router.push("/account/login");
          return;
        }
        setUser(meData.user);

        const ordersRes = await fetch("/api/account/orders");
        if (ordersRes.ok) setOrders(await ordersRes.json());
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });
    if (res.ok && user) {
      const addresses = await res.json();
      setUser({ ...user, addresses });
      setAddressForm({ label: "Home", address: "", addressLine2: "", city: "", state: "", postalCode: "", country: "", phone: "" });
      setShowAddressForm(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (res.ok && user) {
      const addresses = await res.json();
      setUser({ ...user, addresses });
    }
  }

  if (loading || (!user && !loadError)) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 py-16 w-full">
          <p className="text-ink-soft font-body">Loading…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (loadError || !user) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 py-16 w-full text-center">
          <p className="text-ink-soft font-body mb-4">
            Something went wrong loading your account.
          </p>
          <a
            href="/account/login"
            className="focus-ring inline-block bg-ink text-paper px-6 py-3 font-body font-medium hover:bg-coral transition-colors"
          >
            Sign in again
          </a>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-5 sm:px-8 py-14 w-full">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="font-display text-3xl text-ink mb-1">
              Hi, {user.name}
            </h1>
            <p className="text-ink-soft font-body text-sm">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="focus-ring flex items-center gap-1.5 text-sm text-ink-soft hover:text-coral"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>

        {/* Addresses */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-ink">Saved addresses</h2>
            <button
              onClick={() => setShowAddressForm((s) => !s)}
              className="focus-ring flex items-center gap-1 text-sm text-coral hover:underline"
            >
              <Plus size={14} /> Add address
            </button>
          </div>

          {showAddressForm && (
            <form
              onSubmit={handleAddAddress}
              className="border border-line bg-paper-dim p-5 mb-4 grid sm:grid-cols-2 gap-3"
            >
              <input
                required
                placeholder="Label (e.g. Home, Office)"
                value={addressForm.label}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                className="focus-ring border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink sm:col-span-2"
              />
              <input required autoComplete="country-name" placeholder="Country / Region" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="focus-ring border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink sm:col-span-2" />
              <input required autoComplete="address-line1" placeholder="Street address" value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} className="focus-ring border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink sm:col-span-2" />
              <input autoComplete="address-line2" placeholder="Apartment, suite, unit (optional)" value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })} className="focus-ring border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink sm:col-span-2" />
              <input required autoComplete="address-level2" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="focus-ring border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              <input required autoComplete="address-level1" placeholder="State / Province / Region" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="focus-ring border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              <input required autoComplete="postal-code" placeholder="Postal / ZIP code" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="focus-ring border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              <input required autoComplete="tel" placeholder="Phone number" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="focus-ring border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              <button
                type="submit"
                className="focus-ring sm:col-span-2 bg-ink text-paper py-2.5 text-sm font-body font-medium hover:bg-coral transition-colors"
              >
                Save address
              </button>
            </form>
          )}

          {user.addresses.length === 0 ? (
            <p className="text-sm text-ink-soft/60 font-body">
              No saved addresses yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {user.addresses.map((a) => (
                <div key={a.id} className="border border-line bg-white p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-display text-ink flex items-center gap-1.5">
                      <MapPin size={14} className="text-coral" /> {a.label}
                    </p>
                    <button
                      onClick={() => handleDeleteAddress(a.id)}
                      className="focus-ring text-ink-soft/40 hover:text-coral"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-sm text-ink-soft font-body">
                    {[a.address, a.addressLine2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs text-ink-soft/50 font-tag mt-1">{a.phone}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order history */}
        <section>
          <h2 className="font-display text-xl text-ink mb-4">Your orders</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-ink-soft/60 font-body">
              No orders yet —{" "}
              <a href="/" className="text-coral underline">
                start shopping
              </a>
              .
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <a
                  key={o.id}
                  href={`/track?order=${o.id}`}
                  className="focus-ring block border border-line bg-white p-4 hover:border-ink transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-tag text-sm text-ink">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs font-tag uppercase bg-paper-dim px-2 py-0.5 rounded-full text-ink-soft">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft font-body mb-1">
                    {o.items.map((i) => `${i.name}${i.color ? ` (${i.color})` : ""}`).join(", ")}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink-soft/50 font-tag">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-display text-ink">
                      {formatUSD(o.total)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
