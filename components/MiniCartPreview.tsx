"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rupees } from "@/lib/format";

export default function MiniCartPreview() {
  const [items, setItems] = useState<any[]>([]);
  const [loggedOut, setLoggedOut] = useState(false);

  async function load() {
    const res = await fetch("/api/cart", { cache: "no-store", credentials: "include" });
    const data = await res.json().catch(() => ({ items: [] }));
    setItems(Array.isArray(data.items) ? data.items : []);
    setLoggedOut(!res.ok);
  }

  useEffect(() => {
    load();
    window.addEventListener("cart-updated", load);
    return () => window.removeEventListener("cart-updated", load);
  }, []);

  const previewItems = items.slice(0, 3);
  const count = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
  const total = items.reduce((s, i) => s + Number(i.lineTotalPaise ?? (Number(i.pricePaise || 0) * Number(i.quantity || 0))), 0);

  return (
    <aside className="hidden border border-line bg-[#111113]/95 p-6 shadow-glow backdrop-blur md:block">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-[.14em]">Your cart <span className="text-sm text-smoke">({count})</span></h2>
        <span className="text-2xl text-bone/70">×</span>
      </div>

      {loggedOut ? (
        <div className="border border-line bg-black/40 p-5 text-sm text-smoke">
          Sign in to view your personal cart.
          <Link className="btn-primary mt-4 block text-center" href="/login">Sign in</Link>
        </div>
      ) : previewItems.length === 0 ? (
        <div className="border border-line bg-black/40 p-5 text-sm text-smoke">
          Your cart is empty. Add tattoos, chains or rings from the shop.
        </div>
      ) : (
        previewItems.map((p) => (
          <div key={p.id} className="flex gap-4 border-b border-line py-4">
            <div className="h-20 w-20 bg-black"><img className="h-full w-full object-cover" src={p.imageUrl} alt="" /></div>
            <div className="flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="mt-2 text-sm text-smoke">Qty: {p.quantity}</p>
              <p className="mt-1 text-bone">{rupees(p.lineTotalPaise ?? (p.pricePaise * p.quantity))}</p>
            </div>
          </div>
        ))
      )}

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{rupees(total)}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>₹0</span></div>
        <div className="flex justify-between border-t border-line pt-4 text-xl font-black"><span>Total</span><span className="text-blood">{rupees(total)}</span></div>
      </div>
      <Link className="btn-primary mt-6 w-full" href="/cart">Proceed to checkout</Link>
    </aside>
  );
}
