"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Search, ShoppingCart, UserRound, Syringe, LogOut, Menu, X } from "lucide-react";

type CurrentUser = { id: string; name?: string | null; email?: string | null; role?: string } | null;

async function getCartCount() {
  try {
    const res = await fetch("/api/cart/count", { cache: "no-store", credentials: "include" });
    const data = await res.json();
    return Number(data.count || 0);
  } catch { return 0; }
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser>(null);
  const [loaded, setLoaded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  async function loadMe() {
    const res = await fetch("/api/me", { cache: "no-store", credentials: "include" });
    const data = await res.json().catch(() => ({ user: null }));
    setUser(data.user || null);
    setLoaded(true);
  }
  async function refreshCart() { setCartCount(await getCartCount()); }

  useEffect(() => {
    loadMe().then(refreshCart);
    window.addEventListener("cart-updated", refreshCart);
    return () => window.removeEventListener("cart-updated", refreshCart);
  }, []);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.dispatchEvent(new Event("cart-updated"));
    window.location.href = "/";
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      setSearchOpen(false);
      setMobileOpen(false);
      router.push(`/products?q=${encodeURIComponent(q)}`);
    }
  }

  const isAdmin = user?.role === "ADMIN";
  const navClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    return active ? "text-blood" : "text-bone/80 hover:text-blood";
  };

  const links = (
    <>
      <Link className={navClass("/")} href="/" onClick={() => setMobileOpen(false)}>Home</Link>
      <Link className={navClass("/categories")} href="/categories" onClick={() => setMobileOpen(false)}>Categories</Link>
      <Link className={navClass("/products")} href="/products" onClick={() => setMobileOpen(false)}>Shop</Link>
      {user && <Link className={navClass("/account")} href="/account" onClick={() => setMobileOpen(false)}>Account</Link>}
      {!user && loaded && <Link className={navClass("/login")} href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>}
      {!user && loaded && <Link className={navClass("/signup")} href="/signup" onClick={() => setMobileOpen(false)}>Sign up</Link>}
      {isAdmin && <Link className={navClass("/admin")} href="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Syringe className="text-bone" size={34} />
          <div className="leading-none">
            <div className="text-2xl font-black tracking-[.22em] text-bone">INKED</div>
            <div className="text-[11px] font-black tracking-[.36em] text-blood">ANIME TATTOO STORE</div>
          </div>
        </Link>

        <nav className="hidden gap-5 text-sm font-semibold tracking-[.12em] md:flex">{links}</nav>

        <div className="flex items-center gap-4 text-bone">
          {searchOpen ? (
            <form onSubmit={submitSearch} className="absolute left-4 right-4 top-[78px] flex items-center gap-2 border border-line bg-black p-3 md:static md:border-0 md:p-0">
              <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder="Search products" className="w-full border border-line bg-black px-3 py-2 text-sm text-bone outline-none focus:border-blood md:w-48" />
              <button className="text-blood" type="submit"><Search size={21} /></button>
              <button type="button" onClick={() => setSearchOpen(false)} className="text-bone"><X size={20} /></button>
            </form>
          ) : <button onClick={() => setSearchOpen(true)} aria-label="Search products"><Search size={22} /></button>}
          <Link href="/cart" className="relative" aria-label="Open cart">
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className="absolute -right-3 -top-3 grid h-5 w-5 place-items-center rounded-full bg-blood text-[10px] font-bold">{cartCount}</span>}
          </Link>
          {user ? (
            <button onClick={signOut} className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-bone/80 hover:text-blood sm:flex" title="Sign out"><LogOut size={20} /> Sign out</button>
          ) : <Link href="/login" aria-label="Sign in"><UserRound size={23} /></Link>}
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={26} /></button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[9999] md:hidden"
          style={{ backgroundColor: "#000000", color: "#f4efe5" }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="flex min-h-screen w-screen flex-col px-7 py-6"
            style={{ backgroundColor: "#000000", color: "#f4efe5" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-5">
              <div>
                <div className="text-xl font-black uppercase tracking-[.25em] text-bone">INKED</div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[.28em] text-blood">Menu</div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-11 w-11 place-items-center border border-line bg-black text-bone"
                aria-label="Close menu"
              >
                <X size={26} />
              </button>
            </div>

            {user?.name && (
              <p className="mt-6 border border-line bg-[#111111] p-4 text-base text-smoke">
                Welcome <b className="text-bone">{user.name.split(" ")[0]}</b>
              </p>
            )}

            <nav className="mt-8 flex flex-1 flex-col gap-2 text-lg font-black uppercase tracking-[.16em]">
              <Link className={`${navClass("/")} block border-b border-line py-4`} href="/" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link className={`${navClass("/categories")} block border-b border-line py-4`} href="/categories" onClick={() => setMobileOpen(false)}>Categories</Link>
              <Link className={`${navClass("/products")} block border-b border-line py-4`} href="/products" onClick={() => setMobileOpen(false)}>Shop</Link>
              {user && <Link className={`${navClass("/account")} block border-b border-line py-4`} href="/account" onClick={() => setMobileOpen(false)}>Account</Link>}
              {!user && loaded && <Link className={`${navClass("/login")} block border-b border-line py-4`} href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>}
              {!user && loaded && <Link className={`${navClass("/signup")} block border-b border-line py-4`} href="/signup" onClick={() => setMobileOpen(false)}>Sign up</Link>}
              {isAdmin && <Link className={`${navClass("/admin")} block border-b border-line py-4`} href="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
            </nav>

            {user && (
              <button
                onClick={signOut}
                className="mb-4 flex w-full items-center justify-center gap-3 border border-blood bg-black px-5 py-4 text-sm font-black uppercase tracking-[.18em] text-blood"
              >
                <LogOut size={19}/> Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
