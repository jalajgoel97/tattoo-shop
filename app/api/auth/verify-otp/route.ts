import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { OTP_SESSION_COOKIE, OTP_SESSION_CLIENT_COOKIE } from "@/lib/session";
import { normalizeCity } from "@/lib/address";

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { code } = body;
  const email = normalizeEmail(body.email);
  const mode = body.mode === "signup" ? "signup" : "login";

  if (!email || !code) return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (mode === "login" && !existing) {
    return NextResponse.json({ error: "No account found for this email. Please sign up first.", signupRequired: true }, { status: 404 });
  }
  if (mode === "signup" && existing) {
    return NextResponse.json({ error: "Account already exists. Please sign in instead." }, { status: 409 });
  }

  const token = await prisma.otpToken.findFirst({
    where: { email, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" }
  });
  if (!token || token.attempts >= 5) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });

  const ok = await bcrypt.compare(String(code), token.codeHash);
  await prisma.otpToken.update({ where: { id: token.id }, data: { attempts: { increment: 1 }, consumed: ok } });
  if (!ok) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

  const shouldBeAdmin = Boolean(process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase());

  let user = existing;
  if (mode === "signup") {
    const required = ["name", "phone", "line1", "state", "pincode"];
    const missing = required.filter((key) => !String(body[key] || "").trim());
    if (!normalizeCity(body)) missing.push("city");
    if (missing.length) return NextResponse.json({ error: "Name, phone and one full address are mandatory for signup." }, { status: 400 });

    user = await prisma.user.create({
      data: {
        email,
        name: String(body.name).trim(),
        phone: String(body.phone).trim(),
        emailVerified: new Date(),
        role: shouldBeAdmin ? "ADMIN" : "USER",
        addresses: {
          create: {
            label: body.label || "Home",
            fullName: String(body.name).trim(),
            phone: String(body.phone).trim(),
            line1: String(body.line1).trim(),
            line2: body.line2 ? String(body.line2).trim() : null,
            city: normalizeCity(body),
            state: String(body.state).trim(),
            pincode: String(body.pincode).trim(),
            country: "India"
          }
        }
      }
    });
  } else if (existing) {
    user = await prisma.user.update({
      where: { id: existing.id },
      data: { emailVerified: new Date(), ...(shouldBeAdmin ? { role: "ADMIN" as const } : {}) }
    });
  }

  if (!user) return NextResponse.json({ error: "Could not create session" }, { status: 500 });

  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { sessionToken, userId: user.id, expires } });

  const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  const cookieOptions = {
    path: "/",
    sameSite: "lax" as const,
    secure: false,
    expires,
    maxAge: 30 * 24 * 60 * 60
  };
  response.cookies.set(OTP_SESSION_COOKIE, sessionToken, { ...cookieOptions, httpOnly: true });
  // A non-httpOnly mirror is used only to make local/mobile checkout calls more reliable during development.
  // Server APIs still validate it against the real Session table before accepting it.
  response.cookies.set(OTP_SESSION_CLIENT_COOKIE, sessionToken, { ...cookieOptions, httpOnly: false });
  return response;
}
