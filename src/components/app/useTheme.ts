"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    // Cross-fade colours between modes, unless the user prefers reduced motion.
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animate) root.classList.add("theme-transition");
    root.classList.toggle("dark", next);
    if (animate) window.setTimeout(() => root.classList.remove("theme-transition"), 380);
    try {
      localStorage.setItem("bf-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };
  return { dark, toggle };
}
