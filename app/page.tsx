import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import ProductCard from "@/components/ProductCard";
import AnimeTattooBackdrop from "@/components/AnimeTattooBackdrop";
import MiniCartPreview from "@/components/MiniCartPreview";

export default async function Home() {
  const [products, user] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 4 }),
    currentUser()
  ]);
  return (
    <main>
      <section className="relative overflow-hidden border-b border-line">
        <AnimeTattooBackdrop />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_380px]">
          <div className="max-w-3xl">
            {user?.name && <p className="mb-5 text-lg font-bold text-bone">Welcome {user.name.split(" ")[0]}</p>}
            <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Anime tattoo accessories</p>
            <h1 className="mt-5 text-5xl font-black uppercase tracking-tight text-bone sm:text-7xl">Wear your <span className="text-blood">fandom</span> like ink</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-smoke">Temporary tattoo packs, anime rings and dark chains made for cosplay, concerts, reels and everyday streetwear.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="btn-primary" href="/products">Shop now</Link>
              <Link className="btn-outline" href="/categories">Browse categories</Link>
            </div>
          </div>
          <MiniCartPreview />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <h2 className="section-title">Featured anime tattoo drops</h2>
        <p className="mt-3 max-w-2xl text-smoke">Tattoo flash aesthetics + anime symbols, built as wearable accessories.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
    </main>
  );
}
