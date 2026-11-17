"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usd } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AnimatedNumber, DemoBadge } from "@/components/shared/kit";

const TOTAL = 175;
const PERSONAL = 20;
const SOURCES = [
  { id: "discount", label: "Early-registration student discount", kind: "Discount", amount: 10 },
  { id: "meals", label: "Event-provided meals instead of buying lunch", kind: "Free alternative", amount: 15 },
  { id: "kit", label: "Borrow the school's robotics kit", kind: "Equipment borrowing", amount: 85 },
  { id: "travel", label: "School travel support fund", kind: "Institutional", amount: 25 },
  { id: "grant", label: "Community microgrant for bus fare", kind: "Grant", amount: 10 },
];

export function GapDemo() {
  const [on, setOn] = useState<Record<string, boolean>>({ discount: true, meals: true, kit: false, travel: false, grant: false });
  const reduced = SOURCES.filter((s) => on[s.id]).reduce((a, s) => a + s.amount, 0);
  const gap = TOTAL - PERSONAL - reduced;
  return (
    <Card className="grid overflow-hidden md:grid-cols-[1.1fr_1fr]">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">Regional Robotics Challenge</p>
          <DemoBadge>Example</DemoBadge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Costs {usd(TOTAL)}. The student has {usd(PERSONAL)}.</p>
        <ul className="mt-6 space-y-2.5">
          {SOURCES.map((s) => (
            <li key={s.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary-light/40">
                <Switch checked={!!on[s.id]} onCheckedChange={(v) => setOn({ ...on, [s.id]: v })} aria-label={s.label} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{s.label}</span>
                  <span className="block text-xs text-muted-foreground">{s.kind}</span>
                </span>
                <span className="text-sm text-primary tabular">−{usd(s.amount)}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col justify-center gap-6 border-t bg-muted/30 p-6 md:border-l md:border-t-0 md:p-8">
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
            <span>Personal {usd(PERSONAL)} · reduced {usd(reduced)}</span>
            <span>Total {usd(TOTAL)}</span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Crowdfunding ask</dt>
            <dd className="text-lg font-semibold tabular">{usd(TOTAL - PERSONAL)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">With BridgeFund</dt>
            <dd className="text-lg font-semibold text-primary tabular">{usd(gap)}</dd>
          </div>
        </dl>
              </div>
    </Card>
  );
}
