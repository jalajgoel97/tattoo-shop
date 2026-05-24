import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // Make the configured owner email an admin automatically on Google login too.
      if (user.email && process.env.ADMIN_EMAIL && user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: { role: Role.ADMIN, emailVerified: new Date(), name: user.name || undefined, image: user.image || undefined },
          create: { email: user.email, role: Role.ADMIN, emailVerified: new Date(), name: user.name || undefined, image: user.image || undefined }
        });
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    }
  },
  pages: { signIn: "/login" }
};
