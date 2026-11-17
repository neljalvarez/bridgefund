"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Check, HandCoins, Package, School, Wallet } from "lucide-react";
import { aed } from "@/lib/format";
import { AnimatedNumber } from "@/components/shared/kit";

const TOTAL = 600;
const STEPS = [
  { icon: Wallet, label: "Her own savings", amount: 150, color: "bg-slate-400" },
  { icon: Package, label: "Borrowed STEM kit", amount: 200, color: "bg-emerald-200" },
  { icon: School, label: "School travel support", amount: 100, color: "bg-emerald-400" },
  { icon: HandCoins, label: "Verified sponsor", amount: 150, color: "bg-primary" },
];

export function HeroPreview() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? 4 : 0);
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setN((x) => (x >= 4 ? 0 : x + 1)), n === 4 ? 3800 : n === 0 ? 1200 : 1700);
    return () => clearTimeout(t);
  }, [n, reduce]);
  const applied = STEPS.slice(0, n);
  const gap = TOTAL - applied.reduce((a, s) => a + s.amount, 0);

  return (
    <div className="relative">
            <div className="rounded-2xl border bg-card p-5 shadow-elevated md:p-6" role="img" aria-label="Product preview: an AED 600 STEM competition cost closing to AED 0 as savings, a borrowed kit, school support and a sponsor are applied">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Mariam · Grade 11 · Abu Dhabi</p>
            <p className="font-medium">STEM competition · due in 21 days</p>
          </div>
          
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Still to cover</p>
            <p className={`text-4xl font-semibold tracking-tight ${gap === 0 ? "text-primary" : ""}`}>
              <AnimatedNumber value={gap} />
            </p>
          </div>
          <p className="text-sm text-muted-foreground">of {aed(TOTAL)}</p>
        </div>
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-secondary">
          {applied.map((s) => (
            <motion.div key={s.label} className={s.color} initial={{ width: 0 }} animate={{ width: `${(s.amount / TOTAL) * 100}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
          ))}
        </div>
        <ul className="mt-5 space-y-2">
          {STEPS.map((s, i) => (
            <li key={s.label} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-opacity duration-500 ${i < n ? "opacity-100" : "opacity-40"}`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-md ${i < n ? "bg-primary-light text-primary" : "bg-muted text-muted-foreground"}`}>
                <s.icon className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1">{s.label}</span>
              <span className="tabular text-muted-foreground">−{aed(s.amount)}</span>
              {i < n && <Check className="h-4 w-4 text-primary" />}
            </li>
          ))}
        </ul>
        <AnimatePresence>
          {gap === 0 && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 rounded-lg bg-primary-light/70 px-3 py-2.5 text-sm font-medium text-primary">
              <BadgeCheck className="h-4 w-4" /> Funded — sponsors asked for AED 150, not AED 450
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Fictional example</p>
    </div>
  );
}
