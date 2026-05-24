import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { lineTotalPaise } from "@/lib/pricing";

function couponDiscount(coupon: any, subtotal: number) {
  if (!coupon || !coupon.active) return 0;
  if (subtotal < Number(coupon.minCartPaise || 0)) return 0;
  let discount = coupon.type === "PERCENT" ? Math.round(subtotal * Number(coupon.value || 0) / 100) : Number(coupon.value || 0);
  if (coupon.maxDiscountPaise) discount = Math.min(discount, Number(coupon.maxDiscountPaise));
  return Math.max(0, Math.min(discount, subtotal));
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { code } = await req.json().catch(() => ({}));
    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized) return NextResponse.json({ error: "Enter coupon code" }, { status: 400 });
    const items = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
    const subtotal = items.reduce((sum, item) => sum + lineTotalPaise(item), 0);
    const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });
    if (!coupon || !coupon.active) return NextResponse.json({ error: "Invalid or inactive coupon" }, { status: 404 });
    if (subtotal < coupon.minCartPaise) return NextResponse.json({ error: `Minimum cart value is ₹${Math.round(coupon.minCartPaise / 100)}` }, { status: 400 });
    const discountPaise = couponDiscount(coupon, subtotal);
    return NextResponse.json({ ok: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value }, subtotalPaise: subtotal, discountPaise, totalPaise: subtotal - discountPaise });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Login required" }, { status: 401 });
  }
}
