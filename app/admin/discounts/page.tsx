"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { rupees } from "@/lib/format";

function mrpOf(p: any) { return Number(p.mrpPaise || p.pricePaise || 0); }
function currentSellingOf(p: any) { return Number(p.pricePaise || p.mrpPaise || 0); }
function sellingAfterPercent(p: any, pct: number) { return Math.max(0, Math.round(mrpOf(p) * (100 - Math.max(0, Math.min(95, pct))) / 100)); }

export default function AdminDiscountsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [newPriceRupees, setNewPriceRupees] = useState("");
  const [buyOneGetOne, setBuyOneGetOne] = useState(false);

  async function load() {
    const data = await (await fetch("/api/products", { cache: "no-store", credentials: "include" })).json();
    setProducts(Array.isArray(data) ? data : []);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? products.filter((p) => [p.name, p.category, p.tags].filter(Boolean).join(" ").toLowerCase().includes(q)) : products;
  }, [products, search]);

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
  const singleSelected = selectedProducts.length === 1 ? selectedProducts[0] : null;
  const singleNewPricePaise = newPriceRupees.trim() ? Math.round(Number(newPriceRupees) * 100) : null;

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setNewPriceRupees("");
      return next;
    });
  }

  async function applyDiscount() {
    if (!selectedIds.length) return alert("Please select at least one product.");
    const body: any = { productIds: selectedIds, buyOneGetOne };
    if (selectedIds.length === 1) {
      if (!newPriceRupees.trim()) return alert("Enter the new selling price for the selected product.");
      body.newPricePaise = Math.round(Number(newPriceRupees) * 100);
    } else {
      if (!Number(discountPercent || 0)) return alert("Enter a discount percentage for the selected products.");
      body.discountPercent = Number(discountPercent || 0);
    }
    const res = await fetch("/api/admin/discounts", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.error || "Could not apply discount");
    alert("Discount updated. Previous product discounts were overwritten.");
    setSelectedIds([]); setNewPriceRupees(""); setDiscountPercent(0); setBuyOneGetOne(false); load();
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Owner panel</p>
      <h1 className="section-title mt-3">Discounts</h1>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/admin" className="btn-outline">Admin panel</Link>
        <Link href="/admin/products" className="btn-outline">Existing products</Link>
        <Link href="/admin/coupons" className="btn-outline">Manage coupons</Link>
      </div>

      <section className="mt-8 border border-line bg-panel p-5 shadow-card">
        <h2 className="text-xl font-black uppercase tracking-[.16em] text-bone">Discount setup</h2>
        <p className="mt-2 text-sm text-smoke">
          Select one product to set a direct new selling price. Select multiple products to apply one discount percentage to all selected products.
          Any earlier discount percent/flat discount on those products will be overwritten.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {selectedIds.length === 1 ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-[.18em] text-smoke">New selling price for selected product</label>
              <input className="input mt-2" placeholder="Enter new selling price in ₹, e.g. 249" value={newPriceRupees} onChange={(e) => setNewPriceRupees(e.target.value)} />
              {singleSelected && singleNewPricePaise !== null && <p className="mt-2 text-sm text-smoke">Preview: MRP {rupees(mrpOf(singleSelected))} → New selling price <b className="text-bone">{rupees(singleNewPricePaise)}</b></p>}
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold uppercase tracking-[.18em] text-smoke">Discount percentage for selected products</label>
              <input className="input mt-2" placeholder="Enter discount percent, e.g. 10" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value || 0))} />
              {selectedIds.length > 1 && Number(discountPercent) > 0 && <p className="mt-2 text-sm text-smoke">Preview shown below for each selected product.</p>}
            </div>
          )}
          <label className="flex items-center gap-2 border border-line bg-black/30 px-4 py-3 text-sm text-smoke"><input type="checkbox" checked={buyOneGetOne} onChange={(e) => setBuyOneGetOne(e.target.checked)} /> Enable Buy 1 Get 1</label>
        </div>
        <button onClick={applyDiscount} className="btn-primary mt-5">Apply to {selectedIds.length} selected</button>
      </section>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-black uppercase tracking-[.16em] text-bone">Select products</h2>
        <input className="input max-w-sm" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="mt-6 space-y-3">
        {filtered.map((p) => {
          const selected = selectedIds.includes(p.id);
          const preview = selected && selectedIds.length > 1 && Number(discountPercent) > 0 ? sellingAfterPercent(p, Number(discountPercent)) : null;
          return (
            <label key={p.id} className="flex cursor-pointer gap-4 border border-line bg-panel p-4 hover:border-blood/60">
              <input type="checkbox" checked={selected} onChange={() => toggle(p.id)} className="mt-8" />
              <img src={p.imageUrl} alt="" className="h-20 w-20 object-cover" />
              <div>
                <b>{p.name}</b>
                <p className="text-sm text-smoke">{p.category} · Stock {p.stock}</p>
                <p className="text-xs text-blood">MRP {rupees(mrpOf(p))} · Current selling {rupees(currentSellingOf(p))} · {p.buyOneGetOne ? "BOGO on" : "BOGO off"}</p>
                {preview !== null && <p className="mt-1 text-xs text-bone">After {discountPercent}% discount: <b>{rupees(preview)}</b></p>}
              </div>
            </label>
          );
        })}
        {filtered.length === 0 && <p className="text-smoke">No products match your search.</p>}
      </div>
    </main>
  );
}
