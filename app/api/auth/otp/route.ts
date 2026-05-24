import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtp } from "@/lib/mailer";
import { normalizeCity } from "@/lib/address";

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const mode = body.mode === "signup" ? "signup" : "login";

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });

  if (mode === "login" && !existing) {
    return NextResponse.json({ error: "No account found for this email. Please sign up first.", signupRequired: true }, { status: 404 });
  }

  if (mode === "signup") {
    if (existing) return NextResponse.json({ error: "Account already exists. Please sign in instead." }, { status: 409 });
    const required = ["name", "phone", "line1", "state", "pincode"];
    const missing = required.filter((key) => !String(body[key] || "").trim());
    if (!normalizeCity(body)) missing.push("city");
    if (missing.length) return NextResponse.json({ error: "Name, phone and one full address are mandatory for signup." }, { status: 400 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.otpToken.create({
    data: {
      email,
      codeHash,
      userId: existing?.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  });

  await sendOtp(email, code);

  return NextResponse.json({ ok: true, message: "OTP sent" });
}
