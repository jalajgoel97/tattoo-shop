import { prisma } from "@/lib/prisma";

export const BACKGROUNDS = [
  {
    id: "manga-flash-red",
    name: "Manga Flash Red",
    description: "Manga panels, tattoo flash symbols and red ink strokes.",
    css: `radial-gradient(circle at 78% 8%, rgba(197,22,34,.22), transparent 30%), radial-gradient(circle at 14% 0%, rgba(244,239,229,.06), transparent 24%), linear-gradient(125deg, rgba(255,255,255,.045) 0 1px, transparent 1px 130px), linear-gradient(35deg, rgba(197,22,34,.20) 0 2px, transparent 2px 135px), #050507`
  },
  {
    id: "tattoo-flash-wall",
    name: "Tattoo Flash Wall",
    description: "Subtle tattoo-shop flash-sheet grid with premium black base.",
    css: `radial-gradient(circle at 12% 20%, rgba(197,22,34,.16), transparent 30%), repeating-linear-gradient(90deg, rgba(244,239,229,.055) 0 1px, transparent 1px 190px), repeating-linear-gradient(0deg, rgba(244,239,229,.04) 0 1px, transparent 1px 150px), #070708`
  },
  {
    id: "red-ink-brush",
    name: "Red Ink Brush",
    description: "Cleanest option: red brush slash energy behind products.",
    css: `radial-gradient(ellipse at 24% 18%, rgba(197,22,34,.24), transparent 32%), linear-gradient(145deg, transparent 0 44%, rgba(197,22,34,.18) 44% 46%, transparent 46% 100%), linear-gradient(25deg, transparent 0 62%, rgba(197,22,34,.12) 62% 64%, transparent 64% 100%), #050507`
  },
  {
    id: "premium-plain-black",
    name: "Premium Plain Black",
    description: "Minimal matte black for product photography-led layouts.",
    css: `radial-gradient(circle at 50% -10%, rgba(244,239,229,.06), transparent 32%), #050507`
  }
] as const;

export type BackgroundId = typeof BACKGROUNDS[number]["id"];

export function getBackgroundById(id?: string | null) {
  return BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0];
}

export async function getSiteBackground() {
  try {
    const [choice, customUrl] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "backgroundChoice" } }),
      prisma.siteSetting.findUnique({ where: { key: "customBackgroundUrl" } })
    ]);
    if (choice?.value === "custom-image" && customUrl?.value) {
      return {
        id: "custom-image",
        name: "Custom image",
        description: "Owner uploaded / pasted background image URL.",
        css: `linear-gradient(90deg, rgba(0,0,0,.88), rgba(0,0,0,.62)), url("${customUrl.value}") center / cover fixed no-repeat`
      };
    }
    return getBackgroundById(choice?.value);
  } catch {
    return BACKGROUNDS[0];
  }
}
