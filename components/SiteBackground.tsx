import { getSiteBackground } from "@/lib/background";

export default async function SiteBackground() {
  const bg = await getSiteBackground();
  return <div className="site-bg" style={{ background: bg.css }} aria-hidden="true" />;
}
