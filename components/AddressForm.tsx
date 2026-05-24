"use client";

import { useMemo } from "react";
import { INDIAN_STATES, OTHER_CITY_VALUE, cityOptionsForState } from "@/lib/india";

export default function AddressForm({ value, onChange, disabled = false, showFullName = true }: { value: any; onChange: (next: any) => void; disabled?: boolean; showFullName?: boolean }) {
  const cities = useMemo(() => value.state ? cityOptionsForState(value.state).filter((c) => c !== "My city/town is not listed") : [], [value.state]);
  const cityIsOther = value.city === OTHER_CITY_VALUE;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <input className="input" placeholder="Address label e.g. Home" value={value.label || ""} onChange={(e) => onChange({ ...value, label: e.target.value })} disabled={disabled} />
      {showFullName && <input className="input" placeholder="Full name" value={value.fullName || value.name || ""} onChange={(e) => onChange({ ...value, fullName: e.target.value })} disabled={disabled} />}
      <input className="input" placeholder="Phone number" value={value.phone || ""} onChange={(e) => onChange({ ...value, phone: e.target.value })} disabled={disabled} />
      <input className="input" placeholder="Address line 1" value={value.line1 || ""} onChange={(e) => onChange({ ...value, line1: e.target.value })} disabled={disabled} />
      <input className="input md:col-span-2" placeholder="Address line 2 optional" value={value.line2 || ""} onChange={(e) => onChange({ ...value, line2: e.target.value })} disabled={disabled} />
      <select className="input" value={value.state || ""} onChange={(e) => onChange({ ...value, state: e.target.value, city: "", cityOther: "" })} disabled={disabled}>
        <option value="">Select state / union territory</option>
        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="input" value={value.city || ""} onChange={(e) => onChange({ ...value, city: e.target.value, cityOther: "" })} disabled={disabled || !value.state}>
        <option value="">{value.state ? "Select city / town" : "Select state first"}</option>
        {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        {value.state && <option value={OTHER_CITY_VALUE}>My city/town is not listed</option>}
      </select>
      {cityIsOther && <input className="input" placeholder="Enter your city / town" value={value.cityOther || ""} onChange={(e) => onChange({ ...value, cityOther: e.target.value })} disabled={disabled} />}
      <input className="input" placeholder="Pincode" value={value.pincode || ""} onChange={(e) => onChange({ ...value, pincode: e.target.value })} disabled={disabled} />
    </div>
  );
}
