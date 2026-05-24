export function formatAddress(a: any) {
  if (!a) return "";
  const line2 = a.line2 ? `, ${a.line2}` : "";
  return `${a.label || "Address"}: ${a.fullName || ""}, ${a.phone || ""} — ${a.line1 || ""}${line2}, ${a.city || ""}, ${a.state || ""} - ${a.pincode || ""}`.replace(/\s+/g, " ").trim();
}

export function clean(v: any) {
  return String(v || "").trim();
}

export function normalizeCity(body: any) {
  const city = clean(body.city);
  if (city === "__OTHER__") return clean(body.cityOther);
  return city;
}
