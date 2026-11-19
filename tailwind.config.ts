import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/** Every colour resolves to a CSS variable defined in src/app/globals.css (light + dark). */
const c = (v: string) => `hsl(var(--${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1280px" } },
    // Architectural restraint: corners never exceed 8px; "full" only for dots and avatars.
    borderRadius: { none: "0", sm: "2px", DEFAULT: "4px", md: "4px", lg: "var(--radius)", xl: "8px", "2xl": "8px", "3xl": "8px", full: "9999px" },
    // No soft drop shadows — surfaces separate by hairlines. Floating layers get one quiet shadow.
    boxShadow: {
      none: "none",
      sm: "none",
      DEFAULT: "none",
      md: "none",
      inner: "none",
      card: "none",
      lg: "0 18px 40px -24px rgb(36 30 28 / 0.35)",
      xl: "0 18px 40px -24px rgb(36 30 28 / 0.35)",
      elevated: "0 18px 40px -24px rgb(36 30 28 / 0.35)",
    },
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
        destructive: { DEFAULT: c("destructive"), foreground: c("destructive-foreground"), soft: c("destructive-soft") },
        warning: { DEFAULT: c("warning"), foreground: c("warning-foreground"), soft: c("warning-soft") },
        success: { DEFAULT: c("success"), soft: c("success-soft") },
        info: { DEFAULT: c("info"), soft: c("info-soft") },
        sage: { DEFAULT: c("sage"), foreground: c("sage-foreground"), deep: c("sage-deep") },
        stone: c("stone"),
        sand: c("sand"),
        card: { DEFAULT: c("card"), foreground: c("card-foreground") },
        popover: { DEFAULT: c("popover"), foreground: c("popover-foreground") },
        chart: { 1: c("chart-1"), 2: c("chart-2"), 3: c("chart-3"), 4: c("chart-4"), 5: c("chart-5"), 6: c("chart-6") },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        display: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
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
