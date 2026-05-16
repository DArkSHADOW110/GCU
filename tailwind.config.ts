import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d9f1ff",
          200: "#bce7ff",
          300: "#8ed8ff",
          400: "#59c0ff",
          500: "#33a1ff",
          600: "#1a80f5",
          700: "#1368e1",
          800: "#1654b6",
          900: "#18498f",
          950: "#132d57",
        },
        surface: {
          DEFAULT: "#0b1220",
          card: "#111a2e",
          muted: "#1a2740",
          border: "#243352",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(51, 161, 255, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
