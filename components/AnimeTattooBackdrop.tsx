export default function AnimeTattooBackdrop({ variant = "full" }: { variant?: "full" | "hero" }) {
  return <div className={`anime-tattoo-backdrop ${variant}`} aria-hidden="true">
    <div className="manga-panel panel-a"><span className="anime-eye"/><span className="anime-eye right"/><span className="slash"/></div>
    <div className="manga-panel panel-b"><span className="tattoo-symbol seal"/></div>
    <div className="manga-panel panel-c"><span className="tattoo-symbol cloud"/></div>
    <div className="manga-panel panel-d"><span className="tattoo-symbol katana"/></div>
    <div className="red-brush brush-one"/>
    <div className="red-brush brush-two"/>
    <div className="halftone"/>
  </div>;
}
