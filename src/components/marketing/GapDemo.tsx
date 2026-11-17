"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { aed } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AnimatedNumber, DemoBadge } from "@/components/shared/kit";

const TOTAL = 700;
const PERSONAL = 100;
const SOURCES = [
  { id: "nol", label: "Student nol card — 50% off fares", kind: "Discount (Dubai)", amount: 60 },
  { id: "books", label: "Borrow books from MAKTABA", kind: "Free alternative (Abu Dhabi)", amount: 80 },
  { id: "kit", label: "Borrow the school's robotics kit", kind: "Equipment borrowing", amount: 300 },
  { id: "travel", label: "School travel support", kind: "Institutional (example)", amount: 100 },
  { id: "grant", label: "Parent association microgrant", kind: "Grant (example)", amount: 60 },
];

export function GapDemo() {
  const [on, setOn] = useState<Record<string, boolean>>({ nol: true, books: true, kit: false, travel: false, grant: false });
  const reduced = SOURCES.filter((s) => on[s.id]).reduce((a, s) => a + s.amount, 0);
  const gap = TOTAL - PERSONAL - reduced;
  return (
    <Card className="grid overflow-hidden md:grid-cols-[1.1fr_1fr]">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">Robotics club regional event</p>
          <DemoBadge>Example</DemoBadge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Costs {aed(TOTAL)}. The student has {aed(PERSONAL)}.</p>
        <ul className="mt-6 space-y-2.5">
          {SOURCES.map((s) => (
            <li key={s.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary-light/40">
                <Switch checked={!!on[s.id]} onCheckedChange={(v) => setOn({ ...on, [s.id]: v })} aria-label={s.label} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{s.label}</span>
                  <span className="block text-xs text-muted-foreground">{s.kind}</span>
                </span>
                <span className="text-sm text-primary tabular">−{aed(s.amount)}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col justify-center gap-6 border-t bg-muted/30 p-6 md:border-s md:border-t-0 md:p-8">
        <div>
          <p className="text-sm text-muted-foreground">Sponsors are asked for</p>
          <p className="text-5xl font-semibold tracking-tight">
            <AnimatedNumber value={gap} />
          </p>
        </div>
        <div>
          <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
            <div className="bg-slate-400" style={{ width: `${(PERSONAL / TOTAL) * 100}%` }} />
            <motion.div className="bg-primary" animate={{ width: `${(reduced / TOTAL) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Personal {aed(PERSONAL)} · reduced {aed(reduced)}</span>
            <span>Total {aed(TOTAL)}</span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Crowdfunding ask</dt>
            <dd className="text-lg font-semibold tabular">{aed(TOTAL - PERSONAL)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">With BridgeFund</dt>
            <dd className="text-lg font-semibold text-primary tabular">{aed(gap)}</dd>
          </div>
        </dl>
              </div>
    </Card>
  );
}
