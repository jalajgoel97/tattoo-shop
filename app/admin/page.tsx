import Link from "next/link";

const cards = [
  { href: "/admin/orders", title: "Sales dashboard", desc: "View sales, customers and repeat customers." },
  { href: "/admin/manage-orders", title: "Manage orders", desc: "Search orders and update status: confirmed, shipped, out for delivery, delivered or cancelled." },
  { href: "/admin/products", title: "Edit existing products", desc: "Search, edit, hide and review stock for products." },
  { href: "/admin/products/new", title: "Add new product", desc: "Create tattoos, chains and rings with multiple images." },
  { href: "/admin/discounts", title: "Discounts", desc: "Apply single-product selling prices or bulk percentage discounts." },
  { href: "/admin/coupons", title: "Coupons", desc: "Create, update and remove customer coupon codes." },
  { href: "/admin/background", title: "Website background", desc: "Change the anime/tattoo background theme or campaign image." },
];

export default function AdminPanel() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Owner panel</p>
      <h1 className="section-title mt-3">Admin Panel</h1>
      <p className="mt-3 max-w-3xl text-smoke">Manage products, orders, discounts, coupons and storefront background from one place.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="border border-line bg-panel p-6 shadow-card transition hover:-translate-y-1 hover:border-blood/70">
            <h2 className="text-xl font-black uppercase tracking-[.12em] text-bone">{card.title}</h2>
            <p className="mt-3 text-sm text-smoke">{card.desc}</p>
            <span className="mt-6 inline-block text-sm font-bold uppercase tracking-[.16em] text-blood">Open →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
