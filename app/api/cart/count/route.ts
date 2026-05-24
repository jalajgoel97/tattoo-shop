import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";

export async function GET() {
  const user = await currentUser();
  if (!user?.id) return NextResponse.json({ count: 0 });
  const items = await prisma.cartItem.findMany({ where: { userId: user.id }, select: { quantity: true } });
  return NextResponse.json({ count: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) });
}
