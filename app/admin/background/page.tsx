"use client";
import { useEffect, useState } from "react";

type Bg = { id: string; name: string; description: string; css: string };

export default function AdminBackground() {
  const [backgrounds, setBackgrounds] = useState<Bg[]>([]);
  const [selected, setSelected] = useState("manga-flash-red");
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/background", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Admin login required");
        return r.json();
      })
      .then((data) => {
        setBackgrounds(data.backgrounds);
        setSelected(data.selected);
        setCustomBackgroundUrl(data.customBackgroundUrl || "");
      })
      .catch((e) => setMessage(e.message));
  }, []);

  async function save() {
    const r = await fetch("/api/admin/background", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected, customBackgroundUrl })
    });
    const data = await r.json();
    if (!r.ok) return setMessage(data.error || "Could not save background");
    setMessage("Background updated. Refresh the storefront to see it live.");
  }

  return <main className="mx-auto max-w-6xl px-5 py-12">
    <p className="text-sm font-bold uppercase tracking-[.35em] text-blood">Owner panel</p>
    <h1 className="section-title mt-3">Change website background</h1>
    <p className="mt-3 max-w-3xl text-smoke">Choose a creative anime/tattoo background style for the full website. You can also paste a custom image URL for campaigns or new drops.</p>
    {message && <div className="mt-6 border border-blood/60 bg-blood/10 p-4 text-sm text-bone">{message}</div>}

    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {backgrounds.map((bg) => <button key={bg.id} onClick={() => setSelected(bg.id)} className={`text-left border p-5 transition ${selected === bg.id ? "border-blood bg-blood/10" : "border-line bg-panel/90 hover:border-blood/60"}`}>
        <div className="h-36 border border-line" style={{ background: bg.css }} />
        <h2 className="mt-4 text-xl font-black uppercase tracking-[.08em] text-bone">{bg.name}</h2>
        <p className="mt-2 text-sm text-smoke">{bg.description}</p>
      </button>)}

      <button onClick={() => setSelected("custom-image")} className={`text-left border p-5 transition ${selected === "custom-image" ? "border-blood bg-blood/10" : "border-line bg-panel/90 hover:border-blood/60"}`}>
        <div className="grid h-36 place-items-center border border-line bg-black/70 text-sm uppercase tracking-[.18em] text-smoke">Custom image URL</div>
        <h2 className="mt-4 text-xl font-black uppercase tracking-[.08em] text-bone">Custom campaign image</h2>
        <p className="mt-2 text-sm text-smoke">Paste a hosted image URL, such as Cloudinary/S3/Shopify CDN.</p>
      </button>
    </div>

    <div className="mt-6 border border-line bg-panel p-5 shadow-card">
      <label className="text-sm font-bold uppercase tracking-[.18em] text-smoke">Custom background image URL</label>
      <input className="input mt-3" placeholder="https://.../anime-tattoo-campaign.jpg" value={customBackgroundUrl} onChange={(e) => setCustomBackgroundUrl(e.target.value)} />
      <p className="mt-2 text-xs text-smoke/70">Use this only after selecting “Custom campaign image”. For launch, Cloudinary is easiest for owner-managed images.</p>
      <button className="btn-primary mt-5" onClick={save}>Save background</button>
    </div>
  </main>;
}
