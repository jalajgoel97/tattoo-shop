import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: { productId: string } }) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const quantity = Math.max(1, Number(body.quantity || 1));
    const item = await prisma.cartItem.findUnique({ where: { userId_productId: { userId: user.id, productId: params.productId } }, include: { product: true } });
    if (!item) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    if (quantity > item.product.stock) return NextResponse.json({ error: `Only ${item.product.stock} item(s) available in stock.` }, { status: 400 });
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Login required" }, { status: 401 });
  }
}

export async function DELETE(_: Request, { params }: { params: { productId: string } }) {
  try {
    const user = await requireUser();
    await prisma.cartItem.deleteMany({ where: { userId: user.id, productId: params.productId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Login required" }, { status: 401 });
  }
}
