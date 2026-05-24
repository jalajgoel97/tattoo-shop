import { NextResponse } from "next/server";
import { OTP_SESSION_COOKIE, OTP_SESSION_CLIENT_COOKIE } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(OTP_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(OTP_SESSION_CLIENT_COOKIE, "", { httpOnly: false, path: "/", maxAge: 0 });
  response.cookies.set("next-auth.session-token", "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set("__Secure-next-auth.session-token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
