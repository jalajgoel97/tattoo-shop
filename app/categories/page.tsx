import Link from "next/link";
import AnimeTattooBackdrop from "@/components/AnimeTattooBackdrop";

const categories = [
  {
    name: "Temporary Tattoos",
    href: "/products?category=Temporary%20Tattoos",
    title: "Anime tattoo packs",
    copy: "Cursed marks, manga panels, katana seals and wearable flash sheets for cosplay, reels and concerts."
  },
  {
    name: "Chains",
    href: "/products?category=Chains",
    title: "Dark anime chains",
    copy: "Layered chains, pendants and streetwear pieces inspired by anime symbols and tattoo-shop styling."
  },
  {
    name: "Rings",
    href: "/products?category=Rings",
    title: "Statement rings",
    copy: "Spinner rings, red moon pieces and subtle anime-coded accessories for everyday fits."
  }
];

export default function Categories() {
  return (
    <main className="relative overflow-hidden">
      <AnimeTattooBackdrop variant="full" />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Choose your drop</p>
        <h1 className="section-title mt-3">Shop by category</h1>
        <p className="mt-3 max-w-3xl text-smoke">Start with the product type you want: tattoos, chains or rings.</p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href} className="group border border-line bg-panel/90 p-7 shadow-card transition hover:-translate-y-1 hover:border-blood/80">
              <div className="grid h-40 place-items-center border border-line bg-black/70 text-center">
                <span className="text-2xl font-black uppercase tracking-[.18em] text-bone group-hover:text-blood">{cat.name}</span>
              </div>
              <h2 className="mt-6 text-2xl font-black uppercase tracking-[.08em] text-bone">{cat.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-smoke">{cat.copy}</p>
              <span className="mt-6 inline-block border border-blood px-5 py-3 text-xs font-bold uppercase tracking-[.16em] text-blood">Shop {cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
