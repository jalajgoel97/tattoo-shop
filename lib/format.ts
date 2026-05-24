export function rupees(paise: number) { return `₹${(paise / 100).toLocaleString("en-IN")}`; }
export function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
