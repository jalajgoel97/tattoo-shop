import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { BACKGROUNDS } from "@/lib/background";

export async function GET() {
  try {
    await requireAdmin();
    const [choice, customUrl] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "backgroundChoice" } }),
      prisma.siteSetting.findUnique({ where: { key: "customBackgroundUrl" } })
    ]);
    return NextResponse.json({
      backgrounds: BACKGROUNDS,
      selected: choice?.value || BACKGROUNDS[0].id,
      customBackgroundUrl: customUrl?.value || ""
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const allowed = [...BACKGROUNDS.map((b) => b.id), "custom-image"];
    if (!allowed.includes(body.selected)) {
      return NextResponse.json({ error: "Invalid background choice" }, { status: 400 });
    }
    if (body.selected === "custom-image" && !body.customBackgroundUrl) {
      return NextResponse.json({ error: "Custom background URL is required" }, { status: 400 });
    }
    await prisma.siteSetting.upsert({
      where: { key: "backgroundChoice" },
      update: { value: body.selected },
      create: { key: "backgroundChoice", value: body.selected }
    });
    if (body.customBackgroundUrl !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: "customBackgroundUrl" },
        update: { value: body.customBackgroundUrl },
        create: { key: "customBackgroundUrl", value: body.customBackgroundUrl }
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
