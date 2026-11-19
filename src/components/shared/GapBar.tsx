"use client";

import { motion } from "framer-motion";
import { aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./kit";
import { useT } from "@/lib/store";

export interface GapSegment {
  key: string;
  label: string;
  value: number;
  /** Tailwind background class for the bar and legend dot. */
  color: string;
}

/**
 * BridgeFund's signature visual: the cost of an opportunity as one bar,
 * filled by the student's funds, then savings, then sponsors — the empty part is the gap.
 */
export function GapBar({ total, segments, className, legend = true, size = "md" }: { total: number; segments: GapSegment[]; className?: string; legend?: boolean; size?: "sm" | "md" | "lg" }) {
  const tr = useT();
  const covered = segments.reduce((a, s) => a + s.value, 0);
  const remaining = Math.max(total - covered, 0);
  const pct = (v: number) => (total > 0 ? `${Math.min((v / total) * 100, 100)}%` : "0%");
  return (
    <div className={className}>
      <div
        className={cn("flex overflow-hidden rounded-sm bg-secondary ring-1 ring-inset ring-border", size === "sm" ? "h-2" : size === "lg" ? "h-4" : "h-3")}
        role="img"
        aria-label={`${segments.map((s) => `${s.label} ${aed(s.value)}`).join(", ")}; ${aed(remaining)} still missing of ${aed(total)}`}
      >
        {segments.map((s) => (
          <motion.div key={s.key} className={cn("h-full", s.color)} initial={false} animate={{ width: pct(s.value) }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
        ))}
      </div>
      {legend && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          {segments.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", s.color)} aria-hidden />
              {s.label}
              <AnimatedNumber value={s.value} className="font-medium text-foreground" />
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm border border-dashed border-muted-foreground bg-secondary" aria-hidden />
            {tr("Still missing")}
            <AnimatedNumber value={remaining} className={cn("font-medium", remaining > 0 ? "text-warning" : "text-primary")} />
          </li>
        </ul>
      )}
    </div>
  );
}

/** The standard colour order used everywhere a gap is explained. */
export const GAP_COLORS = {
  own: "bg-stone",
  borrow: "bg-sage",
  savings: "bg-sage",
  school: "bg-sage-deep",
  sponsor: "bg-primary",
} as const;
