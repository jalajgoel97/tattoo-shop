"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rupees } from "@/lib/format";

const emptyCoupon = { code: "", type: "PERCENT", value: 10, minCartPaise: 0, maxDiscountPaise: "", active: true };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [coupon, setCoupon] = useState<any>(emptyCoupon);

  async function load() {
    const data = await (await fetch("/api/admin/coupons", { cache: "no-store", credentials: "include" })).json().catch(() => []);
    setCoupons(Array.isArray(data) ? data : []);
  }
  useEffect(() => { load(); }, []);

  async function saveCoupon() {
    const res = await fetch("/api/admin/coupons", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(coupon) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.error || "Could not save coupon");
    setCoupon(emptyCoupon); load();
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Remove this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE", credentials: "include" });
    load();
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Owner panel</p>
      <h1 className="section-title mt-3">Coupon Codes</h1>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/admin/products" className="btn-outline">Existing products</Link>
        <Link href="/admin/products/new" className="btn-outline">Add new product</Link>
        <Link href="/admin/discounts" className="btn-outline">Bulk discounts</Link>
      </div>

      <section className="mt-8 border border-line bg-panel p-5 shadow-card">
        <h2 className="text-xl font-black uppercase tracking-[.16em] text-bone">Create or update coupon</h2>
        <p className="mt-2 text-sm text-smoke">Use the same code again to update an existing coupon.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Coupon code e.g. ANIME10" value={coupon.code} onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })} />
          <select className="input" value={coupon.type} onChange={(e) => setCoupon({ ...coupon, type: e.target.value })}>
            <option value="PERCENT">Percent discount</option>
            <option value="FIXED">Fixed amount discount</option>
          </select>
          <input className="input" placeholder={coupon.type === "PERCENT" ? "Discount percent e.g. 10" : "Discount amount in paise e.g. 10000 for ₹100"} value={coupon.value} onChange={(e) => setCoupon({ ...coupon, value: e.target.value })} />
          <input className="input" placeholder="Minimum cart in paise, e.g. 99900" value={coupon.minCartPaise} onChange={(e) => setCoupon({ ...coupon, minCartPaise: e.target.value })} />
          <input className="input" placeholder="Max discount in paise, optional" value={coupon.maxDiscountPaise} onChange={(e) => setCoupon({ ...coupon, maxDiscountPaise: e.target.value })} />
          <label className="flex items-center gap-2 border border-line bg-black/30 px-4 py-3 text-sm text-smoke"><input type="checkbox" checked={coupon.active} onChange={(e) => setCoupon({ ...coupon, active: e.target.checked })} /> Active coupon</label>
        </div>
        <button onClick={saveCoupon} className="btn-primary mt-4">Save coupon</button>
      </section>

      <section className="mt-8 border border-line bg-panel p-5 shadow-card">
        <h2 className="text-xl font-black uppercase tracking-[.16em] text-bone">Existing coupons</h2>
        <div className="mt-5 space-y-2">
          {coupons.map((c) => <div key={c.id} className="flex flex-col gap-3 border border-line p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span><b>{c.code}</b> · {c.type === "PERCENT" ? `${c.value}%` : rupees(c.value)} · Min {rupees(c.minCartPaise || 0)} · {c.active ? "Active" : "Inactive"}</span><button onClick={() => deleteCoupon(c.id)} className="text-left font-bold text-blood sm:text-right">Remove</button></div>)}
          {coupons.length === 0 && <p className="text-smoke">No coupons created yet.</p>}
        </div>
      </section>
    </main>
  );
}
