import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import AnimeTattooBackdrop from "@/components/AnimeTattooBackdrop";

const cats = ["Temporary Tattoos", "Rings", "Chains"];

export default async function Products({ searchParams }: { searchParams?: { category?: string; q?: string } }) {
  const selected = searchParams?.category;
  const q = String(searchParams?.q || "").trim();
  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(selected ? { category: selected } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { category: { contains: q } },
              { description: { contains: q } },
              { tags: { contains: q } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="relative overflow-hidden">
      <AnimeTattooBackdrop variant="full" />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Shop by vibe</p>
        <h1 className="section-title mt-3">Tattoo flash × anime streetwear</h1>
        <p className="mt-3 max-w-3xl text-smoke">Browse anime temporary tattoos, rings and chains. Choose a category or search the full drop.</p>

        {q && <p className="mt-5 text-sm text-smoke">Search results for <b className="text-bone">{q}</b></p>}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={q ? `/products?q=${encodeURIComponent(q)}` : "/products"} className={`border px-5 py-3 text-sm font-bold uppercase tracking-[.14em] ${!selected ? "border-blood text-blood" : "border-line bg-black/40 text-bone"}`}>All</Link>
          {cats.map((c) => (
            <Link key={c} href={`/products?category=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`border px-5 py-3 text-sm font-bold uppercase tracking-[.14em] ${selected === c ? "border-blood text-blood" : "border-line bg-black/40 text-bone"}`}>{c}</Link>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="mt-10 border border-line bg-panel p-6 shadow-card text-smoke">No products found. Try another keyword or category.</div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </section>
    </main>
  );
}
