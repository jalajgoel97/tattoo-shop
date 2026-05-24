"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AddressForm from "@/components/AddressForm";
import Toast from "@/components/Toast";
import { formatAddress } from "@/lib/address";

const blank = { country: "India", label: "Home", state: "", city: "" };

export default function Addresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "unauthorized">("loading");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [f, setF] = useState<any>(blank);
  const [toast, setToast] = useState("");

  async function load() {
    const r = await fetch("/api/addresses", { cache: "no-store", credentials: "include" });
    if (r.status === 401) {
      setState("unauthorized");
      return;
    }
    const data = await r.json().catch(() => []);
    setAddresses(Array.isArray(data) ? data : []);
    setState("ready");
  }

  useEffect(() => { load(); }, []);

  function addNew() {
    setEditingId(null);
    setF(blank);
    setFormOpen(true);
  }

  function editAddress(a: any) {
    setEditingId(a.id);
    setF({ ...a });
    setFormOpen(true);
  }

  async function save() {
    setToast("");
    const method = editingId ? "PATCH" : "POST";
    const body = editingId ? { ...f, id: editingId } : f;
    const r = await fetch("/api/addresses", { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return setToast(data.error || "Could not save address");
    setF(blank);
    setEditingId(null);
    setFormOpen(false);
    await load();
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <Toast message={toast} onClose={() => setToast("")} />
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Customer account</p>
          <h1 className="section-title mt-3">Saved addresses</h1>
          <p className="mt-3 text-smoke">You can save up to 5 delivery addresses.</p>
        </div>
        {state === "ready" && <button className="btn-primary" onClick={addNew}>Add new address</button>}
      </div>

      {state === "loading" && <p className="mt-8 text-smoke">Loading addresses...</p>}
      {state === "unauthorized" && <div className="mt-8 border border-line bg-panel p-6 shadow-card"><p className="text-smoke">Please sign in to manage saved addresses.</p><Link href="/login" className="btn-primary mt-5 inline-block">Sign in</Link></div>}

      {state === "ready" && (
        <>
          {formOpen && (
            <div className="mt-8 border border-line bg-panel p-5 shadow-card">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-black uppercase tracking-[.12em] text-bone">{editingId ? "Edit address" : "Add address"}</h2>
                <button className="text-sm font-bold uppercase tracking-[.15em] text-smoke hover:text-blood" onClick={() => { setFormOpen(false); setEditingId(null); setF(blank); }}>Cancel</button>
              </div>
              <AddressForm value={f} onChange={setF} />
              <button className="btn-primary mt-4 w-full" onClick={save}>{editingId ? "Update address" : "Save address"}</button>
            </div>
          )}

          {addresses.length === 0 ? (
            <div className="mt-8 border border-line bg-panel p-6 shadow-card">
              <p className="text-smoke">No saved addresses yet.</p>
              <button className="btn-primary mt-5" onClick={addNew}>Add your first address</button>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {addresses.map((a) => (
                <div key={a.id} className="border border-line bg-panel p-5 shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <b className="text-xl text-bone">{a.label}</b>
                    <button className="border border-blood px-3 py-1 text-xs font-bold uppercase tracking-[.14em] text-blood" onClick={() => editAddress(a)}>Edit</button>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-smoke">{formatAddress(a)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
