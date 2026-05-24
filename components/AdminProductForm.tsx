"use client";

import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  category: "Temporary Tattoos",
  pricePaise: 29900,
  mrpPaise: "",
  stock: 10,
  imageUrls: "",
  description: "",
  tags: "",
  active: true,
  discountPercent: 0,
  discountPaise: 0,
  buyOneGetOne: false
};

function imagesToText(product: any) {
  try {
    const arr = JSON.parse(product.imageUrls || "[]");
    return Array.isArray(arr) && arr.length ? arr.join("\n") : product.imageUrl || "";
  } catch {
    return product.imageUrl || "";
  }
}

export default function AdminProductForm({ productId }: { productId?: string }) {
  const [form, setForm] = useState<any>(emptyForm);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!productId) return;
    async function loadProduct() {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}`, { cache: "no-store", credentials: "include" });
      const product = await res.json().catch(() => null);
      if (res.ok && product?.id) {
        setForm({
          name: product.name || "",
          category: product.category || "Temporary Tattoos",
          pricePaise: product.pricePaise || 0,
          mrpPaise: product.mrpPaise || "",
          stock: product.stock || 0,
          imageUrls: imagesToText(product),
          description: product.description || "",
          tags: product.tags || "",
          active: product.active !== false,
          discountPercent: product.discountPercent || 0,
          discountPaise: product.discountPaise || 0,
          buyOneGetOne: Boolean(product.buyOneGetOne)
        });
      }
      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  async function save() {
    setSaving(true);
    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return alert(data.error || "Unable to save product");
    alert(productId ? "Product updated" : "Product added");
    window.location.href = "/admin/products";
  }

  if (loading) return <div className="card mt-8 p-6 text-smoke">Loading product...</div>;

  return (
    <div className="mt-8 border border-line bg-panel p-5 shadow-card">
      <h2 className="text-xl font-black uppercase tracking-[.16em] text-bone">{productId ? "Edit existing product" : "Add new product"}</h2>
      <p className="mt-2 text-sm text-smoke">Paste multiple image URLs one per line. The first image becomes the main image.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <input className="input" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Temporary Tattoos</option><option>Chains</option><option>Rings</option>
        </select>
        <input className="input" placeholder="Selling price in paise e.g. 29900" value={form.pricePaise} onChange={(e) => setForm({ ...form, pricePaise: e.target.value })} />
        <input className="input" placeholder="MRP in paise e.g. 39900" value={form.mrpPaise} onChange={(e) => setForm({ ...form, mrpPaise: e.target.value })} />
        <input className="input" placeholder="Stock quantity visible only to admin" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input className="input" placeholder="Discount % e.g. 10" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} />
        <input className="input" placeholder="Flat discount in paise e.g. 5000 for ₹50" value={form.discountPaise} onChange={(e) => setForm({ ...form, discountPaise: e.target.value })} />
        <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-[.12em] text-smoke"><input type="checkbox" checked={form.buyOneGetOne} onChange={(e) => setForm({ ...form, buyOneGetOne: e.target.checked })} /> Buy 1 Get 1</label>
        <textarea className="input md:col-span-2" rows={5} placeholder="Multiple image URLs — one per line. First image becomes main image." value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} />
        <input className="input md:col-span-2" placeholder="Tags, comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <textarea className="input md:col-span-2" rows={4} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-[.12em] text-smoke"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active / visible in shop</label>
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Saving..." : productId ? "Save changes" : "Add product"}</button>
          <a href="/admin/products" className="btn-outline">Back to products</a>
        </div>
      </div>
    </div>
  );
}
