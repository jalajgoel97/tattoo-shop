import Link from "next/link";

export default function AccountHome() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Customer account</p>
      <h1 className="section-title mt-3">My account</h1>
      <p className="mt-3 text-smoke">View your order history and manage saved delivery addresses.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Link href="/account/orders" className="border border-line bg-panel p-6 shadow-card hover:border-blood">
          <h2 className="text-2xl font-black uppercase tracking-[.08em] text-bone">Order history</h2>
          <p className="mt-3 text-smoke">Track previous purchases and payment status.</p>
        </Link>
        <Link href="/account/addresses" className="border border-line bg-panel p-6 shadow-card hover:border-blood">
          <h2 className="text-2xl font-black uppercase tracking-[.08em] text-bone">Saved addresses</h2>
          <p className="mt-3 text-smoke">Save up to 5 delivery addresses for faster checkout.</p>
        </Link>
      </div>
    </main>
  );
}
