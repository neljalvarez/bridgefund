import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        raised: token("raised"),
        ink: token("text"),
        muted: token("muted"),
        line: token("line"),
        forest: token("forest"),
        gold: token("gold"),
        terra: token("terra"),
        terraink: token("terra-ink"),
        sage: token("sage"),
        onforest: token("on-forest"),
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        pixel: ["'BF Pixel'", "var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        offset: "4px 4px 0 0 rgb(var(--c-shadow))",
        "offset-sm": "2px 2px 0 0 rgb(var(--c-shadow))",
        "offset-lg": "6px 6px 0 0 rgb(var(--c-shadow))",
      },
      keyframes: {
        blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-3px)" } },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        float: "float 2.4s steps(4) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
