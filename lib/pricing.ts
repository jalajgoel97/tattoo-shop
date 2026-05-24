export function getProductImages(product: any): string[] {
  const fallback = product?.imageUrl ? [product.imageUrl] : [];
  try {
    const parsed = JSON.parse(product?.imageUrls || "[]");
    const images = Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
    return images.length ? images : fallback;
  } catch {
    return fallback;
  }
}

export function finalUnitPricePaise(product: any): number {
  const mrp = Number(product?.mrpPaise || product?.pricePaise || 0);
  let price = Number(product?.pricePaise || mrp || 0);
  const pct = Math.max(0, Math.min(95, Number(product?.discountPercent || 0)));
  const flat = Math.max(0, Number(product?.discountPaise || 0));
  if (pct > 0) price = Math.round(price * (100 - pct) / 100);
  if (flat > 0) price = Math.max(0, price - flat);
  return price;
}

export function displayMrpPaise(product: any): number {
  return Number(product?.mrpPaise || product?.pricePaise || 0);
}

export function discountPercent(product: any): number {
  const mrp = displayMrpPaise(product);
  const price = finalUnitPricePaise(product);
  if (!mrp || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function bogoChargeableQuantity(quantity: number, product: any): number {
  const q = Math.max(0, Number(quantity || 0));
  return product?.buyOneGetOne ? Math.ceil(q / 2) : q;
}

export function lineTotalPaise(item: any): number {
  const unit = finalUnitPricePaise(item.product || item);
  const chargeable = bogoChargeableQuantity(item.quantity, item.product || item);
  return unit * chargeable;
}

export function addressLabel(address: any): string {
  if (!address) return "";
  const line2 = address.line2 ? `, ${address.line2}` : "";
  return `${address.label || "Address"}: ${address.fullName}, ${address.phone} — ${address.line1}${line2}, ${address.city}, ${address.state} - ${address.pincode}`;
}
