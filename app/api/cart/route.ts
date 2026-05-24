import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { finalUnitPricePaise, getProductImages, lineTotalPaise } from "@/lib/pricing";

function cartPayload(items: any[]) {
  return items.map((item) => {
    const images = getProductImages(item.product);
    return {
      id: item.product.id,
      productId: item.product.id,
      cartItemId: item.id,
      name: item.product.name,
      slug: item.product.slug,
      category: item.product.category,
      description: item.product.description,
      mrpPaise: item.product.mrpPaise || item.product.pricePaise,
      pricePaise: finalUnitPricePaise(item.product),
      originalPricePaise: item.product.pricePaise,
      stock: item.product.stock,
      buyOneGetOne: item.product.buyOneGetOne,
      imageUrl: images[0] || item.product.imageUrl,
      imageUrls: images,
      quantity: item.quantity,
      lineTotalPaise: lineTotalPaise(item)
    };
  });
}

export async function GET() {
  try {
    const user = await requireUser();
    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { updatedAt: "desc" }
    });
    return NextResponse.json({ items: cartPayload(items) });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const productId = String(body.productId || body.id || "");
    const quantity = Math.max(1, Number(body.quantity || 1));

    const product = await prisma.product.findFirst({ where: { id: productId, active: true } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (product.stock <= 0) return NextResponse.json({ error: "This product is out of stock" }, { status: 400 });

    const existing = await prisma.cartItem.findUnique({ where: { userId_productId: { userId: user.id, productId } } });
    const newQuantity = (existing?.quantity || 0) + quantity;
    if (newQuantity > product.stock) return NextResponse.json({ error: `Only ${product.stock} item(s) available in stock.` }, { status: 400 });

    await prisma.cartItem.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: { quantity: newQuantity },
      create: { userId: user.id, productId, quantity }
    });

    const items = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true }, orderBy: { updatedAt: "desc" } });
    return NextResponse.json({ ok: true, items: cartPayload(items) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Login required" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ ok: true, items: [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Login required" }, { status: 401 });
  }
}
