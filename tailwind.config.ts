import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const c = (v: string) => `hsl(var(--${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        border: c("border"),
        input: c("input"),
        ring: c("ring"),
        background: c("background"),
        foreground: c("foreground"),
        primary: { DEFAULT: c("primary"), foreground: c("primary-foreground"), dark: c("primary-dark"), light: c("primary-light") },
        secondary: { DEFAULT: c("secondary"), foreground: c("secondary-foreground") },
        muted: { DEFAULT: c("muted"), foreground: c("muted-foreground") },
        accent: { DEFAULT: c("accent"), foreground: c("accent-foreground") },
        destructive: { DEFAULT: c("destructive"), foreground: c("destructive-foreground") },
        warning: { DEFAULT: c("warning"), foreground: c("warning-foreground") },
        card: { DEFAULT: c("card"), foreground: c("card-foreground") },
        popover: { DEFAULT: c("popover"), foreground: c("popover-foreground") },
        chart: { 1: c("chart-1"), 2: c("chart-2"), 3: c("chart-3"), 4: c("chart-4"), 5: c("chart-5") },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "\"Noto Sans Arabic\"", "\"Segoe UI\"", "Tahoma", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.04)",
        elevated: "0 12px 32px -12px rgb(16 24 40 / 0.18), 0 2px 6px -2px rgb(16 24 40 / 0.06)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: { "accordion-down": "accordion-down 0.2s ease-out", "accordion-up": "accordion-up 0.2s ease-out" },
    },
  },
  plugins: [animate],
};

export default config;
