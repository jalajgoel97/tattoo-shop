"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { rupees } from "@/lib/format";
import { formatAddress } from "@/lib/address";

type CheckoutMode = "idle" | "creating";

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  return document.cookie.split(";").map((x) => x.trim()).find((x) => x.startsWith(`${name}=`))?.split("=").slice(1).join("=") || "";
}

export default function Cart() {
  const [items, setItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("idle");
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [discountPaise, setDiscountPaise] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  async function load() {
    setLoading(true);
    const [cartRes, addressRes, meRes] = await Promise.all([
      fetch("/api/cart", { cache: "no-store", credentials: "include" }),
      fetch("/api/addresses", { cache: "no-store", credentials: "include" }),
      fetch("/api/me", { cache: "no-store", credentials: "include" })
    ]);
    const cartData = await cartRes.json().catch(() => ({ items: [] }));
    const addressData = await addressRes.json().catch(() => []);
    const meData = await meRes.json().catch(() => ({ user: null }));
    setCurrentUserId(meData?.user?.id || "");
    setItems(Array.isArray(cartData.items) ? cartData.items : []);
    const loadedAddresses = Array.isArray(addressData) ? addressData : [];
    setAddresses(loadedAddresses);
    setSelectedAddressId((current) => current || loadedAddresses[0]?.id || "");
    setLoggedOut(!cartRes.ok);
    setLoading(false);
    window.dispatchEvent(new Event("cart-updated"));
  }

  useEffect(() => { load(); }, []);

  async function setQuantity(id: string, quantity: number, stock: number) {
    const next = Math.min(Math.max(1, quantity), Math.max(1, Number(stock || 1)));
    const res = await fetch(`/api/cart/${id}`, {
      credentials: "include",
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: next })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) alert(data.error || "Could not update quantity");
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/cart/${id}`, { credentials: "include", method: "DELETE" });
    load();
  }

  async function applyCoupon() {
    setCouponMessage("");
    setDiscountPaise(0);
    setAppliedCoupon("");
    const res = await fetch("/api/coupons/validate", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponCode }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setCouponMessage(data.error || "Invalid coupon");
    setDiscountPaise(Number(data.discountPaise || 0));
    setAppliedCoupon(data.coupon?.code || couponCode.toUpperCase());
    setCouponMessage(`Coupon ${data.coupon?.code || couponCode.toUpperCase()} applied.`);
  }

  const subtotal = items.reduce((s, i) => s + Number(i.lineTotalPaise ?? (Number(i.pricePaise || 0) * Number(i.quantity || 0))), 0);
  const total = Math.max(0, subtotal - discountPaise);

  async function checkout() {
    if (!items.length) return alert("Your cart is empty.");
    if (!selectedAddressId) return alert("Please select or add a delivery address before checkout.");
    setCheckoutMode("creating");
    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "x-inked-session": readCookie("inked_session_client") },
      body: JSON.stringify({ addressId: selectedAddressId, couponCode: appliedCoupon, userId: currentUserId })
    });
    const data = await res.json().catch(() => ({}));
    setCheckoutMode("idle");

    if (!res.ok || (!data.razorpayOrderId && !data.demo)) {
      alert(data.error || "Could not create order. Please login again and check your delivery address.");
      if (res.status === 401) location.href = `/login?redirect=${encodeURIComponent("/cart")}`;
      return;
    }

    if (data.demo) {
      window.dispatchEvent(new Event("cart-updated"));
      location.href = `/account/orders?placed=${encodeURIComponent(data.orderNumber || data.orderId || "")}`;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const rz = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Inked Store",
        description: "Tattoo and anime accessories",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json", "x-inked-session": readCookie("inked_session_client") },
            body: JSON.stringify({ ...response, orderId: data.orderId })
          });
          window.dispatchEvent(new Event("cart-updated"));
          location.href = `/account/orders?placed=${encodeURIComponent(data.orderNumber || data.orderId)}`;
        }
      });
      rz.open();
    };
    script.onerror = () => alert("Could not load Razorpay checkout. Check internet connection or Razorpay keys.");
    document.body.appendChild(script);
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="section-title">Your Cart</h1>

      {loading ? (
        <div className="mt-8 border border-line bg-panel p-6 shadow-card"><p className="text-smoke">Loading your cart...</p></div>
      ) : loggedOut ? (
        <div className="mt-8 border border-line bg-panel p-6 shadow-card">
          <p className="text-smoke">Please sign in to view and manage your personal cart.</p>
          <Link href={`/login?redirect=${encodeURIComponent("/cart")}`} className="btn-primary mt-5 inline-block">Sign in</Link>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 border border-line bg-panel p-6 shadow-card">
          <p className="text-smoke">Your cart is empty. Start with tattoos, chains or rings.</p>
          <Link href="/categories" className="btn-primary mt-5 inline-block">Browse categories</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_390px]">
          <div className="space-y-4">
            {items.map((i) => (
              <div key={i.id} className="flex flex-col gap-4 border border-line bg-panel p-4 shadow-card sm:flex-row">
                <img src={i.imageUrl} className="h-28 w-28 object-cover" alt={i.name} />
                <div className="flex-1">
                  <h2 className="font-semibold text-bone">{i.name}</h2>
                  <p className="mt-1 text-sm text-smoke">{i.category}</p>
                  {i.buyOneGetOne && <p className="mt-2 text-xs font-bold uppercase tracking-[.14em] text-blood">Buy 1 Get 1 applied</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button onClick={() => setQuantity(i.id, Number(i.quantity || 1) - 1, i.stock)} className="grid h-9 w-9 place-items-center border border-line text-bone hover:border-blood"><Minus size={16} /></button>
                    <span className="min-w-8 text-center font-bold">{i.quantity}</span>
                    <button onClick={() => setQuantity(i.id, Number(i.quantity || 1) + 1, i.stock)} className="grid h-9 w-9 place-items-center border border-line text-bone hover:border-blood"><Plus size={16} /></button>
                    <button onClick={() => remove(i.id)} className="ml-0 flex items-center gap-2 border border-blood px-3 py-2 text-xs font-bold uppercase tracking-[.14em] text-blood sm:ml-3"><Trash2 size={15} /> Remove</button>
                  </div>
                </div>
                <b>{rupees(Number(i.lineTotalPaise ?? (i.pricePaise * i.quantity)))}</b>
              </div>
            ))}
          </div>

          <div className="h-fit border border-line bg-panel p-6 shadow-card">
            <h2 className="text-lg font-black uppercase tracking-[.14em] text-bone">Delivery address</h2>
            {addresses.length === 0 ? (
              <div className="mt-4 border border-line bg-black/30 p-4">
                <p className="text-sm text-smoke">No saved address found. Add one before checkout.</p>
                <Link href="/account/addresses" className="btn-outline mt-4 inline-block">Add address</Link>
              </div>
            ) : (
              <select className="input mt-4" value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                {addresses.map((a) => <option key={a.id} value={a.id}>{formatAddress(a)}</option>)}
              </select>
            )}

            <div className="mt-6 border-t border-line pt-5">
              <h3 className="text-sm font-black uppercase tracking-[.16em] text-bone">Coupon</h3>
              <div className="mt-3 flex gap-2">
                <input className="input" placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                <button onClick={applyCoupon} className="btn-outline shrink-0">Apply</button>
              </div>
              {couponMessage && <p className={`mt-2 text-xs ${appliedCoupon ? "text-bone" : "text-blood"}`}>{couponMessage}</p>}
            </div>

            <div className="mt-6 flex justify-between text-lg"><span>Subtotal</span><b>{rupees(subtotal)}</b></div>
            {discountPaise > 0 && <div className="mt-4 flex justify-between text-sm text-blood"><span>Coupon discount</span><span>-{rupees(discountPaise)}</span></div>}
            <div className="mt-4 flex justify-between text-sm text-smoke"><span>Shipping</span><span>₹0</span></div>
            <div className="mt-5 flex justify-between border-t border-line pt-5 text-2xl font-black"><span>Total</span><span className="text-blood">{rupees(total)}</span></div>
            <button onClick={checkout} disabled={checkoutMode === "creating" || !selectedAddressId} className="btn-primary mt-6 w-full">{checkoutMode === "creating" ? "Creating order..." : "Proceed to checkout"}</button>
            <p className="mt-4 text-xs text-smoke">You can select one of your saved addresses for this order.</p>
          </div>
        </div>
      )}
    </main>
  );
}
