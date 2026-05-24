import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        charcoal: "#111111",
        panel: "#171717",
        blood: "#b5121b",
        bloodDark: "#7a0d13",
        bone: "#f3f0ea",
        smoke: "#b8b8b8",
        line: "#2a2a2a"
      },
      boxShadow: {
        glow: "0 20px 70px rgba(181,18,27,.22)",
        card: "0 18px 55px rgba(0,0,0,.45)"
      },
      fontFamily: {
        display: ["Impact", "Anton", "Arial Black", "sans-serif"]
      }
    }
  },
  plugins: []
};
export default config;
