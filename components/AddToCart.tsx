"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export default function AddToCart({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const stock = Number(product.stock || 0);

  function setSafeQuantity(next: number) {
    const capped = Math.min(Math.max(1, next), Math.max(1, stock));
    setQuantity(capped);
  }

  async function add() {
    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      alert(data.error || "Please sign in before adding items to cart.");
      if (res.status === 401) window.location.href = `/login?redirect=${encodeURIComponent(`/products/${product.slug}`)}`;
      return;
    }
    window.dispatchEvent(new Event("cart-updated"));
    alert(`${quantity} item${quantity > 1 ? "s" : ""} added to cart`);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-[.16em] text-smoke">Quantity</p>
        <div className="inline-flex items-center border border-line bg-black/40">
          <button type="button" onClick={() => setSafeQuantity(quantity - 1)} className="grid h-11 w-11 place-items-center text-bone hover:text-blood"><Minus size={16} /></button>
          <input className="h-11 w-16 bg-transparent text-center font-bold text-bone outline-none" value={quantity} onChange={(e) => setSafeQuantity(Number(e.target.value) || 1)} />
          <button type="button" onClick={() => setSafeQuantity(quantity + 1)} className="grid h-11 w-11 place-items-center text-bone hover:text-blood"><Plus size={16} /></button>
        </div>
        {stock > 0 && <p className="mt-2 text-xs text-smoke">Quantity will be limited to available stock.</p>}
      </div>
      <button onClick={add} disabled={loading || stock <= 0} className="btn-primary w-full">{stock <= 0 ? "Out of stock" : loading ? "Adding..." : "Add to cart"}</button>
    </div>
  );
}
