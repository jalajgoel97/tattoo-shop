import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/format";


export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

function parseImages(b: any, fallback = "") {
  const raw = Array.isArray(b.imageUrls) ? b.imageUrls : String(b.imageUrls || b.imageUrl || fallback || "").split(/\n|,/);
  return raw.map((x: any) => String(x || "").trim()).filter(Boolean);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const b = await req.json();
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const images = parseImages(b, existing.imageUrl);

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: b.name ?? existing.name,
        slug: b.name ? slugify(b.name) : existing.slug,
        category: b.category ?? existing.category,
        description: b.description ?? existing.description,
        pricePaise: b.pricePaise !== undefined ? Number(b.pricePaise) : existing.pricePaise,
        mrpPaise: b.mrpPaise ? Number(b.mrpPaise) : null,
        imageUrl: images[0] || existing.imageUrl,
        imageUrls: JSON.stringify(images),
        stock: b.stock !== undefined ? Number(b.stock) : existing.stock,
        tags: b.tags ?? existing.tags,
        active: b.active !== undefined ? Boolean(b.active) : existing.active,
        discountPercent: b.discountPercent !== undefined ? Number(b.discountPercent) : existing.discountPercent,
        discountPaise: b.discountPaise !== undefined ? Number(b.discountPaise) : existing.discountPaise,
        buyOneGetOne: b.buyOneGetOne !== undefined ? Boolean(b.buyOneGetOne) : existing.buyOneGetOne
      }
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.product.update({ where: { id: params.id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
