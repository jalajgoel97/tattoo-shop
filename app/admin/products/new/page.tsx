import AdminProductForm from "@/components/AdminProductForm";

export default function NewProductPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Owner panel</p>
      <h1 className="section-title mt-3">Add Product</h1>
      <AdminProductForm />
    </main>
  );
}
