import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name || null,
      email: user.email || null,
      role: user.role || "USER"
    }
  });
}
