import AdminProductForm from "@/components/AdminProductForm";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Owner panel</p>
      <h1 className="section-title mt-3">Edit Product</h1>
      <AdminProductForm productId={params.id} />
    </main>
  );
}
