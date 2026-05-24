"use client";

import { X } from "lucide-react";

export default function Toast({ message, tone = "error", onClose }: { message: string; tone?: "error" | "success"; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className={`fixed right-5 top-24 z-50 w-[min(420px,calc(100vw-2.5rem))] border p-4 shadow-card ${tone === "error" ? "border-blood bg-[#24090c] text-bone" : "border-green-700 bg-[#08210d] text-bone"}`}>
      <div className="flex items-start gap-3">
        <p className="flex-1 text-sm font-semibold leading-relaxed">{message}</p>
        <button onClick={onClose} aria-label="Close alert" className="grid h-7 w-7 place-items-center border border-bone/20 hover:border-bone/60">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
