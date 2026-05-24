import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const order = await prisma.order.findFirst({ where: { id: params.id, userId: user.id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "CONFIRMED") {
      return NextResponse.json({ error: "You can cancel an order only after it is confirmed and before it is shipped." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const message = e.message || "Login required";
    return NextResponse.json({ error: message }, { status: message === "Login required" ? 401 : 400 });
  }
}
