import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const OTP_SESSION_COOKIE = "inked_session";
export const OTP_SESSION_CLIENT_COOKIE = "inked_session_client";

export async function currentUserFromToken(sessionToken?: string | null) {
  if (!sessionToken) return null;
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  });
  if (session && session.expires >= new Date()) return session.user as any;
  return null;
}

export async function currentUserFromRequest(req: Request) {
  const headerToken = req.headers.get("x-inked-session");
  const cookieHeader = req.headers.get("cookie") || "";
  const readCookie = (name: string) => {
    const raw = cookieHeader
      .split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith(`${name}=`))
      ?.split("=")
      .slice(1)
      .join("=");
    return raw ? decodeURIComponent(raw) : "";
  };
  const serverCookieToken = readCookie(OTP_SESSION_COOKIE);
  const clientCookieToken = readCookie(OTP_SESSION_CLIENT_COOKIE);
  return currentUserFromToken(headerToken || serverCookieToken || clientCookieToken || null);
}

export async function currentUser() {
  // Email OTP login / signup session first. This avoids NextAuth cookie confusion.
  const sessionToken = cookies().get(OTP_SESSION_COOKIE)?.value || cookies().get(OTP_SESSION_CLIENT_COOKIE)?.value;
  const otpUser = await currentUserFromToken(sessionToken);
  if (otpUser) return otpUser;

  // Google login / NextAuth session
  const nextAuthSession = await getServerSession(authOptions);
  if (nextAuthSession?.user) return nextAuthSession.user as any;

  return null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user?.id) throw new Error("Login required");
  return user;
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}
