"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Check, HandCoins, Package, School, Wallet } from "lucide-react";
import { aed } from "@/lib/format";
import { AnimatedNumber } from "@/components/shared/kit";

const TOTAL = 600;
const STEPS = [
  { icon: Wallet, label: "Her own savings", amount: 150, color: "bg-stone" },
  { icon: Package, label: "Borrowed STEM kit", amount: 200, color: "bg-sage" },
  { icon: School, label: "School travel support", amount: 100, color: "bg-sage-deep" },
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
            <div className="relative rounded-lg border border-foreground/20 bg-card p-5 md:p-7" role="img" aria-label="Product preview: an AED 600 STEM competition cost closing to AED 0 as savings, a borrowed kit, school support and a sponsor are applied">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow text-muted-foreground">Mariam · Grade 11 · Abu Dhabi</p>
            <p className="mt-1.5 font-display text-xl">STEM competition</p>
          </div>
          <p className="eyebrow text-end text-muted-foreground">
            Due in
            <span className="tabular block text-sm normal-case tracking-normal text-foreground">21 days</span>
          </p>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="eyebrow text-muted-foreground">Still to cover</p>
            <p className={`mt-2 text-[2.75rem] font-medium leading-none ${gap === 0 ? "text-primary" : ""}`}>
              <AnimatedNumber value={gap} />
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            of <span className="tabular">{aed(TOTAL)}</span>
          </p>
        </div>
        <div className="mt-5 flex h-2 overflow-hidden rounded-sm bg-secondary">
          {applied.map((s) => (
            <motion.div key={s.label} className={s.color} initial={{ width: 0 }} animate={{ width: `${(s.amount / TOTAL) * 100}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
          ))}
        </div>
        <ul className="mt-6 divide-y border-y">
          {STEPS.map((s, i) => (
            <li key={s.label} className={`flex items-center gap-3 py-2.5 text-sm transition-colors duration-500 ${i < n ? "" : "text-muted-foreground"}`}>
              <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${i < n ? s.color : "border border-dashed border-muted-foreground"}`} aria-hidden />
              <s.icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.6} />
              <span className="flex-1">{s.label}</span>
              <span className={`tabular ${i < n ? "font-medium text-primary" : "text-muted-foreground"}`}>−{aed(s.amount)}</span>
              {i < n && <Check className="h-4 w-4 text-success" />}
            </li>
          ))}
        </ul>
        <AnimatePresence>
          {gap === 0 && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 rounded-md bg-success-soft px-3 py-2.5 text-sm font-medium text-success">
              <BadgeCheck className="h-4 w-4" /> Funded — sponsors asked for AED 150, not AED 450
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <p className="eyebrow mt-3 text-end text-muted-foreground">Fig. 1 — Fictional example</p>
    </div>
  );
}
