import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json().catch(() => ({}));
    const code = String(b.code || "").trim().toUpperCase();
    if (!code) return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    const coupon = await prisma.coupon.upsert({
      where: { code },
      update: {
        type: b.type === "FIXED" ? "FIXED" : "PERCENT",
        value: Number(b.value || 0),
        minCartPaise: Number(b.minCartPaise || 0),
        maxDiscountPaise: b.maxDiscountPaise ? Number(b.maxDiscountPaise) : null,
        active: b.active !== false
      },
      create: {
        code,
        type: b.type === "FIXED" ? "FIXED" : "PERCENT",
        value: Number(b.value || 0),
        minCartPaise: Number(b.minCartPaise || 0),
        maxDiscountPaise: b.maxDiscountPaise ? Number(b.maxDiscountPaise) : null,
        active: b.active !== false
      }
    });
    return NextResponse.json(coupon);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
