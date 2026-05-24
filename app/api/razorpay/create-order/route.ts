import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { getRazorpayClient } from "@/lib/razorpay";
import { lineTotalPaise } from "@/lib/pricing";

async function nextOrderNumber() {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INK-${Date.now().toString().slice(-6)}-${suffix}`;
}

function couponDiscount(coupon: any, subtotal: number) {
  if (!coupon || !coupon.active || subtotal < Number(coupon.minCartPaise || 0)) return 0;
  let discount = coupon.type === "PERCENT" ? Math.round(subtotal * Number(coupon.value || 0) / 100) : Number(coupon.value || 0);
  if (coupon.maxDiscountPaise) discount = Math.min(discount, Number(coupon.maxDiscountPaise));
  return Math.max(0, Math.min(discount, subtotal));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // Use currentUser() which reads from Next.js cookies() store — reliable in App Router
    // Route Handlers regardless of mobile, IP-based access, or SameSite cookie policy.
    const user = await currentUser();
    const addressId = String(body.addressId || "");

    if (!user?.id) throw new Error("Login required");
    const couponCode = String(body.couponCode || "").trim().toUpperCase();

    const cartItems = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
    const activeItems = cartItems.filter((item) => item.product.active && item.quantity > 0);
    if (!activeItems.length) return NextResponse.json({ error: "Cart empty" }, { status: 400 });
    if (!addressId) return NextResponse.json({ error: "Select delivery address first" }, { status: 400 });

    for (const item of activeItems) {
      if (item.quantity > item.product.stock) {
        return NextResponse.json({ error: `${item.product.name} has only ${item.product.stock} item(s) available.` }, { status: 400 });
      }
    }

    const address = await prisma.address.findFirst({ where: { id: addressId, userId: user.id } });
    if (!address) return NextResponse.json({ error: "Selected delivery address was not found" }, { status: 400 });

    const subtotal = activeItems.reduce((sum, item) => sum + lineTotalPaise(item), 0);
    const coupon = couponCode ? await prisma.coupon.findUnique({ where: { code: couponCode } }) : null;
    if (couponCode && (!coupon || !coupon.active)) return NextResponse.json({ error: "Invalid or inactive coupon" }, { status: 400 });
    if (coupon && subtotal < coupon.minCartPaise) return NextResponse.json({ error: `Minimum cart value is ₹${Math.round(coupon.minCartPaise / 100)}` }, { status: 400 });
    const discountPaise = couponDiscount(coupon, subtotal);
    const total = Math.max(0, subtotal - discountPaise);
    const orderNumber = await nextOrderNumber();

    const itemData = activeItems.map((item) => ({ productId: item.productId, quantity: item.quantity, pricePaise: lineTotalPaise(item) }));

    const razorpay = getRazorpayClient();
    const hasRazorpayKeys = Boolean(razorpay && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

    if (!hasRazorpayKeys || !razorpay) {
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          orderNumber,
          status: "PAID",
          subtotalPaise: subtotal,
          discountPaise,
          totalPaise: total,
          couponId: coupon?.id || null,
          couponCode: coupon?.code || null,
          addressSnapshot: JSON.stringify(address),
          razorpayOrderId: `demo_${orderNumber}`,
          items: { create: itemData }
        }
      });
      for (const item of activeItems) await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      await prisma.cartItem.deleteMany({ where: { userId: user.id } });
      return NextResponse.json({ demo: true, orderId: order.id, orderNumber: order.orderNumber, amount: total });
    }

    const rz = await razorpay.orders.create({ amount: total, currency: "INR", receipt: orderNumber });
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber,
        subtotalPaise: subtotal,
        discountPaise,
        totalPaise: total,
        couponId: coupon?.id || null,
        couponCode: coupon?.code || null,
        addressSnapshot: JSON.stringify(address),
        razorpayOrderId: rz.id,
        items: { create: itemData }
      }
    });

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber, razorpayOrderId: rz.id, amount: total });
  } catch (e: any) {
    const message = e.message || "Login required";
    const status = message === "Login required" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
