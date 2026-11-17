"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Check, HandCoins, Ticket, Wallet } from "lucide-react";
import { usd } from "@/lib/format";
import { AnimatedNumber } from "@/components/shared/kit";

const STEPS = [
  { icon: Wallet, label: "Personal funds", amount: 70, color: "bg-slate-400" },
  { icon: Ticket, label: "Exam hardship fee waiver", amount: 50, color: "bg-primary" },
  { icon: HandCoins, label: "Verified sponsor", amount: 60, color: "bg-emerald-400" },
];

export function HeroPreview() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? 3 : 0);
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setN((x) => (x >= 3 ? 0 : x + 1)), n === 3 ? 3800 : n === 0 ? 1200 : 1700);
    return () => clearTimeout(t);
  }, [n, reduce]);
  const applied = STEPS.slice(0, n);
  const gap = 180 - applied.reduce((a, s) => a + s.amount, 0);

  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-b from-primary/10 to-transparent blur-2xl" aria-hidden />
      <div className="rounded-2xl border bg-card p-5 shadow-elevated md:p-6" role="img" aria-label="Product preview: a $180 exam gap closing to $0 as personal funds, a fee waiver and a sponsor are applied">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Associate Data Analyst Certification</p>
            <p className="font-medium">Exam fee · due in 18 days</p>
          </div>
          <span className="rounded-md bg-primary-light px-2 py-1 text-xs font-medium text-primary">BridgeEngine</span>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Remaining financial gap</p>
            <p className={`text-4xl font-semibold tracking-tight ${gap === 0 ? "text-primary" : ""}`}>
              <AnimatedNumber value={gap} />
            </p>
          </div>
          <p className="text-sm text-muted-foreground">of {usd(180)}</p>
        </div>
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-secondary">
          {applied.map((s) => (
            <motion.div key={s.label} className={s.color} initial={{ width: 0 }} animate={{ width: `${(s.amount / 180) * 100}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
          ))}
        </div>
        <ul className="mt-5 space-y-2">
          {STEPS.map((s, i) => (
            <li key={s.label} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-opacity duration-500 ${i < n ? "opacity-100" : "opacity-40"}`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-md ${i < n ? "bg-primary-light text-primary" : "bg-muted text-muted-foreground"}`}>
                <s.icon className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1">{s.label}</span>
              <span className="tabular text-muted-foreground">−{usd(s.amount)}</span>
              {i < n && <Check className="h-4 w-4 text-primary" />}
            </li>
          ))}
        </ul>
        <AnimatePresence>
          {gap === 0 && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex items-center gap-2 rounded-lg bg-primary-light/70 px-3 py-2.5 text-sm font-medium text-primary">
              <BadgeCheck className="h-4 w-4" /> Fully funded — sponsor asked for $60, not $110
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Illustrative example with fictional data</p>
    </div>
  );
}
