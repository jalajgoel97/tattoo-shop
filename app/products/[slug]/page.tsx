import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { rupees } from "@/lib/format";
import AddToCart from "@/components/AddToCart";
import AnimeTattooBackdrop from "@/components/AnimeTattooBackdrop";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import { discountPercent, displayMrpPaise, finalUnitPricePaise, getProductImages } from "@/lib/pricing";

export default async function Product({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findFirst({ where: { slug: params.slug, active: true } });
  if (!p) notFound();

  const images = getProductImages(p);
  const price = finalUnitPricePaise(p);
  const mrp = displayMrpPaise(p);
  const off = discountPercent(p);

  const cartProduct = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.description,
    pricePaise: price,
    imageUrl: images[0],
    stock: p.stock
  };

  return (
    <main className="relative overflow-hidden">
      <AnimeTattooBackdrop variant="full" />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.05fr_.95fr]">
        <ProductImageCarousel images={images} name={p.name} />
        <div className="border border-line bg-panel/95 p-8 shadow-card backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">{p.category}</p>
          <h1 className="section-title mt-4">{p.name}</h1>
          <p className="mt-5 text-lg leading-relaxed text-smoke">{p.description}</p>
          <div className="mt-8">
            {off > 0 ? (
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="text-lg text-smoke line-through">{rupees(mrp)}</span>
                <span className="border border-blood px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-blood">{off}% off</span>
              </div>
            ) : null}
            <p className="text-4xl font-black text-bone">{rupees(price)}</p>
            {p.buyOneGetOne && <p className="mt-3 inline-block border border-blood px-3 py-2 text-xs font-black uppercase tracking-[.18em] text-blood">Buy 1 Get 1 offer active</p>}
          </div>
          <div className="mt-8"><AddToCart product={cartProduct} /></div>
          <div className="mt-8 border-t border-line pt-6 text-sm text-smoke">
            <p>Skin-safe temporary tattoo / accessory styling. Best for reels, cosplay shoots, concerts and weekend fits.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
