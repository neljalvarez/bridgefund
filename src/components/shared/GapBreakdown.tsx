"use client";

import { motion } from "framer-motion";
import type { Breakdown } from "@/lib/selectors";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";

export const SEGMENTS = [
  { key: "personal", label: "Personal funds", className: "bg-slate-400 dark:bg-slate-500" },
  { key: "confirmedSavings", label: "Confirmed savings", className: "bg-primary" },
  { key: "estimatedSavings", label: "Estimated savings", className: "bg-primary/35 bg-[repeating-linear-gradient(135deg,transparent_0_4px,hsl(var(--primary)/0.35)_4px_8px)]" },
  { key: "assistance", label: "Assistance received", className: "bg-emerald-400 dark:bg-emerald-500" },
] as const;

/** One bar that always adds up: personal + savings + assistance + remaining = total. */
export function GapBreakdown({ b, showLegend = true, height = "h-3", className }: { b: Breakdown; showLegend?: boolean; height?: string; className?: string }) {
  const total = Math.max(b.total, 0.0001);
  return (
    <div className={className}>
      <div className={cn("flex w-full overflow-hidden rounded-full bg-secondary", height)} role="img" aria-label={`${usd(b.total - b.remaining)} of ${usd(b.total)} covered; ${usd(b.remaining)} remaining`}>
        {SEGMENTS.map((s) => {
          const v = b[s.key];
          return v > 0 ? (
            <motion.div key={s.key} className={cn("h-full first:rounded-l-full", s.className)} initial={{ width: 0 }} animate={{ width: `${(v / total) * 100}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} title={`${s.label}: ${usd(v)}`} />
          ) : null;
        })}
      </div>
      {showLegend && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {SEGMENTS.map((s) =>
            b[s.key] > 0 ? (
              <li key={s.key} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", s.className)} aria-hidden />
                {s.label} <span className="font-medium text-foreground tabular">{usd(b[s.key])}</span>
              </li>
            ) : null,
          )}
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-secondary ring-1 ring-border" aria-hidden />
            Remaining gap <span className="font-medium text-foreground tabular">{usd(b.remaining)}</span>
          </li>
        </ul>
      )}
    </div>
  );
}
