"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { rupees } from "@/lib/format";
import { formatAddress } from "@/lib/address";

type LoadState = "loading" | "ready" | "unauthorized" | "error";

export default function AdminOrders() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/stats", { cache: "no-store", credentials: "include" }),
          fetch("/api/admin/orders", { cache: "no-store", credentials: "include" })
        ]);

        const statsData = await statsRes.json().catch(() => null);
        const ordersData = await ordersRes.json().catch(() => null);

        if (statsRes.status === 401 || ordersRes.status === 401) {
          setState("unauthorized");
          return;
        }

        if (!statsRes.ok || !ordersRes.ok) {
          setMessage(statsData?.error || ordersData?.error || "Could not load admin orders.");
          setState("error");
          return;
        }

        setStats(statsData || null);
        if (Array.isArray(ordersData)) setOrders(ordersData);
        else if (Array.isArray(ordersData?.orders)) setOrders(ordersData.orders);
        else setOrders([]);

        setState("ready");
      } catch {
        setMessage("Could not load admin orders.");
        setState("error");
      }
    }
    loadAdminData();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Owner panel</p>
      <h1 className="section-title mt-3">Sales dashboard</h1>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/admin" className="btn-outline">Admin Panel</Link>
        <Link href="/admin/manage-orders" className="btn-primary">Manage orders</Link>
        <Link href="/admin/products" className="btn-outline">Products</Link>
        <Link href="/admin/products/new" className="btn-outline">Add product</Link>
      </div>

      {state === "loading" && <p className="mt-8 text-smoke">Loading dashboard...</p>}

      {state === "unauthorized" && (
        <div className="mt-8 border border-line bg-panel p-6 shadow-card">
          <p className="text-smoke">Please login with the email set in <b>ADMIN_EMAIL</b> in your .env file.</p>
          <Link href="/login" className="btn-primary mt-5 inline-block">Admin login</Link>
        </div>
      )}

      {state === "error" && <p className="mt-8 text-smoke">{message}</p>}

      {state === "ready" && (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["Sales", rupees(stats?.salesPaise || 0)],
              ["Orders", stats?.orders || 0],
              ["Customers", stats?.customers || 0],
              ["Repeat customers", stats?.repeatCustomers || 0]
            ].map(([k, v]) => (
              <div key={String(k)} className="border border-line bg-panel p-5 shadow-card">
                <p className="text-sm text-smoke">{k}</p>
                <b className="mt-2 block text-2xl">{v}</b>
              </div>
            ))}
          </div>

          {orders.length === 0 ? (
            <div className="mt-8 border border-line bg-panel p-6 shadow-card">
              <p className="text-smoke">No orders have been placed yet.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="border border-line bg-panel p-4">
                  <div className="flex justify-between gap-4">
                    <b>{o.orderNumber || `Order ${String(o.id).slice(-6)}`} · {o.user?.email || "Customer"}</b>
                    <span className="text-blood">{o.status}</span>
                  </div>
                  <p className="text-sm text-smoke">{new Date(o.createdAt).toLocaleString()} · {rupees(o.totalPaise)}</p>
                  {o.addressSnapshot && <p className="text-xs leading-relaxed text-smoke">Delivery: {(() => { try { return formatAddress(JSON.parse(o.addressSnapshot)); } catch { return "Saved address"; } })()}</p>}
                  <p className="mt-2 text-sm">
                    {(Array.isArray(o.items) ? o.items : []).map((i: any) => `${i.product?.name || "Product"} x ${i.quantity}`).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
