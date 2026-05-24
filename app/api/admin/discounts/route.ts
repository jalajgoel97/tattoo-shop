import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

function clampPercent(value: any) {
  return Math.max(0, Math.min(95, Number(value || 0)));
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json().catch(() => ({}));
    const productIds = Array.isArray(b.productIds) ? b.productIds.map(String) : [];
    if (!productIds.length) return NextResponse.json({ error: "Select at least one product" }, { status: 400 });

    if (productIds.length === 1 && b.newPricePaise !== undefined && b.newPricePaise !== "") {
      const product = await prisma.product.findUnique({ where: { id: productIds[0] } });
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      const mrp = product.mrpPaise || product.pricePaise;
      const newPricePaise = Math.max(0, Number(b.newPricePaise));
      if (newPricePaise > mrp) return NextResponse.json({ error: "New selling price cannot be higher than MRP" }, { status: 400 });
      await prisma.product.update({
        where: { id: product.id },
        data: { pricePaise: newPricePaise, mrpPaise: mrp, discountPaise: 0, discountPercent: 0, buyOneGetOne: Boolean(b.buyOneGetOne) }
      });
      return NextResponse.json({ ok: true });
    }

    if (productIds.length > 1) {
      const pct = clampPercent(b.discountPercent);
      if (!pct) return NextResponse.json({ error: "Enter a discount percentage for multiple products" }, { status: 400 });
      const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
      await prisma.$transaction(products.map((product) => {
        const mrp = product.mrpPaise || product.pricePaise;
        const newPricePaise = Math.round(mrp * (100 - pct) / 100);
        return prisma.product.update({
          where: { id: product.id },
          data: { mrpPaise: mrp, pricePaise: newPricePaise, discountPaise: 0, discountPercent: 0, buyOneGetOne: Boolean(b.buyOneGetOne) }
        });
      }));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "For a single product, enter a new selling price." }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
