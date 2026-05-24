"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { rupees } from "@/lib/format";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  async function load() {
    const data = await (await fetch("/api/products", { cache: "no-store", credentials: "include" })).json();
    setProducts(Array.isArray(data) ? data : []);
  }

  useEffect(() => { load(); }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => [p.name, p.category, p.description, p.tags].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [products, search]);

  async function hide(id: string) {
    if (!confirm("Hide this product from shop?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE", credentials: "include" });
    load();
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Owner panel</p>
      <h1 className="section-title mt-3">Products</h1>
      <p className="mt-3 max-w-2xl text-smoke">Use this page to search and edit existing products. Adding products, bulk discounts and coupons are now separate admin pages.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="btn-primary">Add new product</Link>
        <Link href="/admin/discounts" className="btn-outline">Bulk discounts</Link>
        <Link href="/admin/coupons" className="btn-outline">Manage coupons</Link>
        <Link href="/admin/orders" className="btn-outline">Sales dashboard</Link>
        <Link href="/admin/background" className="btn-outline">Change background</Link>
      </div>

      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-xl font-black uppercase tracking-[.16em] text-bone">Existing products</h2>
        <input className="input max-w-sm" placeholder="Search products by name, category, tags" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-6 space-y-3">
        {filteredProducts.map((p) => (
          <div key={p.id} className="flex flex-col gap-4 border border-line bg-panel p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <img src={p.imageUrl} alt="" className="h-20 w-20 object-cover" />
              <div>
                <b>{p.name}</b>
                <p className="text-sm text-smoke">{p.category} · Stock {p.stock} · {p.active ? "Active" : "Hidden"}</p>
                <p className="text-xs text-blood">MRP {rupees(p.mrpPaise || p.pricePaise)} · Selling {rupees(p.pricePaise)} · Discount {p.discountPercent || 0}% · Flat {rupees(p.discountPaise || 0)} · {p.buyOneGetOne ? "BOGO on" : "BOGO off"}</p>
                <p className="mt-1 max-w-xl text-xs text-smoke">{p.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="btn-outline" href={`/admin/products/${p.id}`}>Edit</Link>
              <button className="border border-blood px-4 py-2 text-sm font-bold uppercase tracking-[.12em] text-blood" onClick={() => hide(p.id)}>Hide</button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && <p className="text-smoke">No products match your search.</p>}
      </div>
    </main>
  );
}
