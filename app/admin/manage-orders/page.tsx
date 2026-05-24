"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, RefreshCcw } from "lucide-react";
import { rupees } from "@/lib/format";
import { formatAddress } from "@/lib/address";

type Status = "PENDING" | "PAID" | "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
type Filter = "active" | "all" | Status;

const filters: { label: string; value: Filter }[] = [
  { label: "Active orders", value: "active" },
  { label: "All", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Packed", value: "PACKED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Out for delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" }
];

const statusLabels: Record<Status, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
};

const actionFlow: { label: string; status: Status }[] = [
  { label: "Confirm order", status: "CONFIRMED" },
  { label: "Mark packed", status: "PACKED" },
  { label: "Mark shipped", status: "SHIPPED" },
  { label: "Out for delivery", status: "OUT_FOR_DELIVERY" },
  { label: "Delivered", status: "DELIVERED" },
  { label: "Cancel", status: "CANCELLED" }
];

function shortStatus(status: Status) {
  return statusLabels[status] || status;
}

function addressText(snapshot: string) {
  if (!snapshot) return "No address saved";
  try { return formatAddress(JSON.parse(snapshot)); } catch { return "Saved address"; }
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>("active");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState("");

  const totalActiveValue = useMemo(
    () => orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + Number(o.totalPaise || 0), 0),
    [orders]
  );

  async function loadOrders(nextFilter = filter, nextQuery = query) {
    setLoading(true);
    setMessage("");
    const params = new URLSearchParams({ filter: nextFilter });
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    const res = await fetch(`/api/admin/manage-orders?${params.toString()}`, { cache: "no-store", credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error || "Could not load orders.");
      setOrders([]);
    } else {
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    }
    setLoading(false);
  }

  useEffect(() => { loadOrders(); }, [filter]);

  async function updateStatus(orderId: string, status: Status) {
    setUpdating(orderId + status);
    setMessage("");
    const res = await fetch("/api/admin/manage-orders", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status })
    });
    const data = await res.json().catch(() => ({}));
    setUpdating("");
    if (!res.ok) {
      setMessage(data.error || "Could not update order.");
      return;
    }
    await loadOrders();
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    loadOrders(filter, query);
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Owner panel</p>
          <h1 className="section-title mt-3">Manage Orders</h1>
          <p className="mt-3 max-w-3xl text-smoke">Search customer orders, filter by fulfilment stage and update delivery status from one place.</p>
        </div>
        <Link href="/admin" className="btn-outline w-fit">Back to Admin Panel</Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="border border-line bg-panel p-5 shadow-card">
          <p className="text-sm text-smoke">Visible orders</p>
          <b className="mt-2 block text-2xl">{orders.length}</b>
        </div>
        <div className="border border-line bg-panel p-5 shadow-card">
          <p className="text-sm text-smoke">Visible sales value</p>
          <b className="mt-2 block text-2xl">{rupees(totalActiveValue)}</b>
          <p className="mt-1 text-xs text-smoke">Cancelled orders are excluded.</p>
        </div>
        <div className="border border-line bg-panel p-5 shadow-card">
          <p className="text-sm text-smoke">Filter</p>
          <b className="mt-2 block text-2xl">{filters.find((f) => f.value === filter)?.label}</b>
        </div>
      </div>

      <div className="mt-8 border border-line bg-panel p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`border px-3 py-2 text-xs font-black uppercase tracking-[.12em] ${filter === f.value ? "border-blood bg-blood text-bone" : "border-line bg-black/30 text-bone hover:border-blood"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <form onSubmit={submitSearch} className="flex min-w-full gap-2 lg:min-w-[430px]">
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order number or customer email"
            />
            <button className="btn-primary flex items-center gap-2" type="submit"><Search size={17} /> Search</button>
            <button className="btn-outline" type="button" onClick={() => { setQuery(""); loadOrders(filter, ""); }}><RefreshCcw size={17} /></button>
          </form>
        </div>
      </div>

      {message && <div className="mt-5 border border-blood bg-blood/15 p-4 text-sm text-bone">{message}</div>}
      {loading && <p className="mt-8 text-smoke">Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <div className="mt-8 border border-line bg-panel p-6 shadow-card">
          <p className="text-smoke">No orders found for this filter/search.</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-line bg-panel p-5 shadow-card">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <b className="text-lg">#{o.orderNumber || String(o.id).slice(-6)}</b>
                    <span className="border border-blood px-2 py-1 text-xs font-black uppercase tracking-[.14em] text-blood">{shortStatus(o.status)}</span>
                  </div>
                  <p className="mt-2 text-sm text-smoke">{o.user?.email || "Customer"} · {new Date(o.createdAt).toLocaleString()}</p>
                  <p className="mt-1 text-sm text-bone">{rupees(o.totalPaise)}</p>
                </div>
                <select
                  className="input md:w-64"
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value as Status)}
                  disabled={Boolean(updating)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.2fr]">
                <div className="border border-line bg-black/25 p-4">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-smoke">Products</p>
                  <div className="mt-3 space-y-1">
                    {(Array.isArray(o.items) ? o.items : []).map((i: any) => (
                      <p key={i.id} className="text-sm text-bone">{i.product?.name || "Product"} x {i.quantity}</p>
                    ))}
                  </div>
                </div>
                <div className="border border-line bg-black/25 p-4">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-smoke">Delivery address</p>
                  <p className="mt-3 text-sm leading-relaxed text-bone">{addressText(o.addressSnapshot)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {actionFlow.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => updateStatus(o.id, action.status)}
                    disabled={updating === o.id + action.status || o.status === action.status}
                    className={`border px-3 py-2 text-xs font-black uppercase tracking-[.12em] ${action.status === "CANCELLED" ? "border-blood text-blood" : "border-line text-bone hover:border-blood"} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {updating === o.id + action.status ? "Updating..." : action.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
