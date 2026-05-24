import Link from "next/link";
import { rupees } from "@/lib/format";
import { discountPercent, displayMrpPaise, finalUnitPricePaise, getProductImages } from "@/lib/pricing";
export default function ProductCard({ product }: { product: any }) {
  const images = getProductImages(product);
  const price = finalUnitPricePaise(product);
  const mrp = displayMrpPaise(product);
  const off = discountPercent(product);
  return <Link href={`/products/${product.slug}`} className="group block overflow-hidden border border-line flash-card shadow-card transition hover:-translate-y-1 hover:border-blood/80">
    <div className="product-image-shell aspect-[4/3]"><img src={images[0] || product.imageUrl} className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" alt={product.name}/></div>
    <div className="p-4">
      <p className="text-[11px] font-black uppercase tracking-[.24em] text-blood">{product.category}</p>
      <h3 className="mt-2 font-semibold tracking-wide text-bone">{product.name}</h3>
      <p className="mt-2 text-sm text-smoke line-clamp-2">{product.description}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          {off > 0 ? <div className="text-xs text-smoke"><span className="line-through">{rupees(mrp)}</span> <span className="font-bold text-blood">{off}% OFF</span></div> : null}
          <span className="text-xl font-black text-bone">{rupees(price)}</span>
          {product.buyOneGetOne && <p className="mt-1 text-xs font-bold uppercase tracking-[.14em] text-blood">BOGO</p>}
        </div>
        <span className="border border-blood px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-blood">View</span>
      </div>
    </div>
  </Link>
}
