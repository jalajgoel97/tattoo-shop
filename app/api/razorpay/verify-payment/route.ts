import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { currentUserFromRequest, requireUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const user = (await currentUserFromRequest(req)) || (await requireUser());
    const b = await req.json().catch(() => ({}));
    const order = await prisma.order.findFirst({ where: { id: String(b.orderId || ""), userId: user.id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (secret && b.razorpay_order_id && b.razorpay_payment_id && b.razorpay_signature) {
      const expected = crypto.createHmac("sha256", secret).update(`${b.razorpay_order_id}|${b.razorpay_payment_id}`).digest("hex");
      if (expected !== b.razorpay_signature) return NextResponse.json({ error: "Payment signature mismatch" }, { status: 400 });
    }

    await prisma.order.update({ where: { id: order.id }, data: { status: "PAID", razorpayPaymentId: String(b.razorpay_payment_id || "") } });
    for (const item of order.items) await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Login required" }, { status: 401 });
  }
}
