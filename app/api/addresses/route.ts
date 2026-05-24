import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { INDIAN_STATE_CITIES } from "@/lib/india";
import { clean, normalizeCity } from "@/lib/address";

function validateAddress(body: any) {
  const city = normalizeCity(body);
  const required = ["label", "fullName", "phone", "line1", "state", "pincode"];
  const missing = required.filter((key) => !clean(body[key]));
  if (!city) missing.push("city");
  if (missing.length) return { error: "Please fill all mandatory address fields." };
  const knownCities = INDIAN_STATE_CITIES[clean(body.state)] || [];
  if (!knownCities.length) return { error: "Please select a valid Indian state/UT." };
  return null;
}

function addressData(userId: string, b: any) {
  return {
    userId,
    label: clean(b.label),
    fullName: clean(b.fullName),
    phone: clean(b.phone),
    line1: clean(b.line1),
    line2: clean(b.line2) || null,
    city: normalizeCity(b),
    state: clean(b.state),
    pincode: clean(b.pincode),
    country: "India"
  };
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json([], { status: 401 });
  return NextResponse.json(await prisma.address.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }));
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const count = await prisma.address.count({ where: { userId: user.id } });
  if (count >= 5) return NextResponse.json({ error: "Maximum 5 saved addresses allowed" }, { status: 400 });
  const b = await req.json().catch(() => ({}));
  const invalid = validateAddress(b);
  if (invalid) return NextResponse.json(invalid, { status: 400 });
  const address = await prisma.address.create({ data: addressData(user.id, b) });
  return NextResponse.json(address);
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const id = clean(b.id);
  if (!id) return NextResponse.json({ error: "Address id required" }, { status: 400 });
  const invalid = validateAddress(b);
  if (invalid) return NextResponse.json(invalid, { status: 400 });
  const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });
  const { userId, ...data } = addressData(user.id, b);
  const updated = await prisma.address.update({ where: { id }, data });
  return NextResponse.json(updated);
}
