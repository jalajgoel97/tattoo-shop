import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/format";

function parseImages(b: any) {
  const raw = Array.isArray(b.imageUrls) ? b.imageUrls : String(b.imageUrls || b.imageUrl || "").split(/\n|,/);
  const images = raw.map((x: any) => String(x || "").trim()).filter(Boolean);
  return images;
}

export async function GET() {
  return NextResponse.json(await prisma.product.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json();
    const images = parseImages(b);
    const p = await prisma.product.create({
      data: {
        name: b.name,
        slug: slugify(b.name),
        category: b.category,
        description: b.description,
        pricePaise: Number(b.pricePaise),
        mrpPaise: b.mrpPaise ? Number(b.mrpPaise) : null,
        imageUrl: images[0] || b.imageUrl || "",
        imageUrls: JSON.stringify(images),
        stock: Number(b.stock || 0),
        tags: b.tags || "",
        active: b.active !== false,
        discountPercent: Number(b.discountPercent || 0),
        discountPaise: Number(b.discountPaise || 0),
        buyOneGetOne: Boolean(b.buyOneGetOne)
      }
    });
    return NextResponse.json(p);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
