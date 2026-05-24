import "./globals.css";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import SiteBackground from "@/components/SiteBackground";
export const metadata: Metadata = { title: "Inked Anime | Anime Tattoos & Accessories", description: "Anime temporary tattoos, rings and chains with a tattoo flash store aesthetic." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="min-h-screen"><SiteBackground /><Nav />{children}</body></html>;
}
