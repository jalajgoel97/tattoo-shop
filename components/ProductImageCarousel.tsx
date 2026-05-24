"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductImageCarousel({ images, name }: { images: string[]; name: string }) {
  const clean = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const current = clean[index] || clean[0] || "";

  function next() { setIndex((i) => (i + 1) % clean.length); }
  function prev() { setIndex((i) => (i - 1 + clean.length) % clean.length); }

  return (
    <div className="border border-line bg-black shadow-card">
      <div className="relative overflow-hidden">
        {current ? <img src={current} alt={name} className="h-[420px] w-full object-cover sm:h-[560px]" /> : <div className="h-[420px] bg-panel" />}
        {clean.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-bone hover:text-blood" aria-label="Previous image"><ChevronLeft size={22} /></button>
            <button onClick={next} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-bone hover:text-blood" aria-label="Next image"><ChevronRight size={22} /></button>
          </>
        )}
      </div>
      {clean.length > 1 && (
        <div className="flex gap-3 overflow-x-auto border-t border-line p-3">
          {clean.map((src, i) => (
            <button key={src + i} onClick={() => setIndex(i)} className={`h-20 w-20 shrink-0 overflow-hidden border ${index === i ? "border-blood" : "border-line"}`}>
              <img src={src} alt={`${name} image ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
