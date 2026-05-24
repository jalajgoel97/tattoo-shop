"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { rupees } from "@/lib/format";
import { formatAddress } from "@/lib/address";

type LoadState = "loading" | "ready" | "unauthorized" | "error";

type Status = "PENDING" | "PAID" | "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

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

function displayStatus(status: Status) {
  return statusLabels[status] || status;
}

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("");
  const [canceling, setCanceling] = useState("");

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders", { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        setState("unauthorized");
        setOrders([]);
        return;
      }

      if (!res.ok) {
        setMessage(data?.error || "Could not load orders.");
        setState("error");
        return;
      }

      if (Array.isArray(data)) setOrders(data);
      else if (Array.isArray(data?.orders)) setOrders(data.orders);
      else setOrders([]);

      setState("ready");
    } catch {
      setMessage("Could not load orders.");
      setState("error");
    }
  }

  useEffect(() => { loadOrders(); }, []);

  async function cancelOrder(orderId: string) {
    const ok = window.confirm("Cancel this confirmed order? This cannot be undone by the customer.");
    if (!ok) return;
    setCanceling(orderId);
    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "PATCH", credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setCanceling("");
    if (!res.ok) return alert(data.error || "Could not cancel order.");
    await loadOrders();
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Customer account</p>
      <h1 className="section-title mt-3">My orders</h1>

      {state === "loading" && <p className="mt-8 text-smoke">Loading orders...</p>}

      {state === "unauthorized" && (
        <div className="mt-8 border border-line bg-panel p-6 shadow-card">
          <p className="text-smoke">Please login or sign up to view your order history.</p>
          <div className="mt-5 flex gap-3">
            <Link href="/login" className="btn-primary">Login</Link>
            <Link href="/signup" className="btn-outline">Sign up</Link>
          </div>
        </div>
      )}

      {state === "error" && <p className="mt-8 text-smoke">{message}</p>}

      {state === "ready" && orders.length === 0 && (
        <div className="mt-8 border border-line bg-panel p-6 shadow-card">
          <p className="text-smoke">No orders yet. Once you place an order, it will appear here.</p>
          <Link href="/products" className="btn-primary mt-5 inline-block">Shop now</Link>
        </div>
      )}

      {state === "ready" && orders.length > 0 && (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-line bg-panel p-5 shadow-card">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <b>Order #{o.orderNumber || String(o.id).slice(-6)}</b>
                  <p className="mt-2 text-sm text-smoke">{new Date(o.createdAt).toLocaleDateString()} · {rupees(o.totalPaise)}</p>
                </div>
                <span className="w-fit border border-blood px-2 py-1 text-xs font-black uppercase tracking-[.14em] text-blood">{displayStatus(o.status)}</span>
              </div>
              {o.addressSnapshot && <p className="mt-2 text-xs leading-relaxed text-smoke">Delivery: {(() => { try { return formatAddress(JSON.parse(o.addressSnapshot)); } catch { return "Saved address"; } })()}</p>}
              <div className="mt-3 space-y-1">
                {(Array.isArray(o.items) ? o.items : []).map((i: any) => (
                  <p key={i.id} className="text-sm">{i.product?.name || "Product"} x {i.quantity}</p>
                ))}
              </div>

              {o.status === "CONFIRMED" && (
                <button
                  onClick={() => cancelOrder(o.id)}
                  disabled={canceling === o.id}
                  className="mt-5 border border-blood px-4 py-2 text-xs font-black uppercase tracking-[.14em] text-blood disabled:opacity-50"
                >
                  {canceling === o.id ? "Cancelling..." : "Cancel order"}
                </button>
              )}
              {o.status !== "CONFIRMED" && o.status !== "CANCELLED" && (
                <p className="mt-4 text-xs text-smoke">Cancellation is available only when the order status is Confirmed.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
