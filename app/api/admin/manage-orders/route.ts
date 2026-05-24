import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

type OrderStatus = "PENDING" | "PAID" | "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PAID",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED"
];

function normalizeStatus(status: string | null): OrderStatus | null {
  const value = String(status || "").trim().toUpperCase() as OrderStatus;
  return STATUS_OPTIONS.includes(value) ? value : null;
}

function filterToWhere(filter: string) {
  const value = String(filter || "active").toLowerCase();
  if (value === "active") {
    return { status: { in: ["PENDING", "PAID", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"] as OrderStatus[] } };
  }
  if (value === "all") return {};
  const status = normalizeStatus(value);
  return status ? { status } : {};
}

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "active";
    const q = (searchParams.get("q") || "").trim();
    const baseWhere: any = filterToWhere(filter);
    const where = q
      ? {
          AND: [
            baseWhere,
            {
              OR: [
                { orderNumber: { contains: q } },
                { user: { is: { email: { contains: q } } } }
              ]
            }
          ]
        }
      : baseWhere;

    const orders = await prisma.order.findMany({
      where,
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ orders });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const orderId = String(body.orderId || "");
    const nextStatus = normalizeStatus(String(body.status || ""));

    if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    if (!nextStatus) return NextResponse.json({ error: "Invalid order status" }, { status: 400 });

    const existing = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const updated = await prisma.$transaction(async (tx) => {
      if (existing.status !== "CANCELLED" && nextStatus === "CANCELLED") {
        for (const item of existing.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
      }

      if (existing.status === "CANCELLED" && nextStatus !== "CANCELLED") {
        for (const item of existing.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < item.quantity) throw new Error(`Not enough stock to reactivate ${product?.name || "this product"}.`);
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: nextStatus },
        include: { user: true, items: { include: { product: true } } }
      });
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Could not update order" }, { status: 400 });
  }
}
