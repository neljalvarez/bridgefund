"use client";

import { AlarmClock, ArrowRight, Lightbulb } from "lucide-react";
import type { DeadlineAssessment, RiskLevel } from "@/lib/deadline";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const RISK_VARIANT: Record<RiskLevel, "danger" | "warning" | "neutral" | "success" | "info"> = {
  Critical: "danger",
  "At risk": "warning",
  "Deadline passed": "neutral",
  Watch: "info",
  "On track": "success",
  Secured: "success",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <Badge variant={RISK_VARIANT[level]}>{level}</Badge>;
}

export function Countdown({ days }: { days: number }) {
  return (
    <span className={cn("inline-flex items-center gap-1 tabular", days <= 7 && days >= 0 && "font-semibold text-destructive")}>
      <AlarmClock className="h-3.5 w-3.5" />
      {days < 0 ? `${-days}d overdue` : days === 0 ? "Due today" : `${days}d left`}
    </span>
  );
}

/** Deadline countdown, gap, processing estimate, next action and alternatives. */
export function DeadlineRiskPanel({ a, compact }: { a: DeadlineAssessment; compact?: boolean }) {
  const short = a.estDays > a.daysLeft && a.daysLeft >= 0;
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Deadline</p>
          <Countdown days={a.daysLeft} />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Outstanding gap</p>
          <p className="font-semibold tabular">{usd(a.gap)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Est. processing</p>
          <p className={cn("font-semibold tabular", short && "text-destructive")}>~{a.estDays} days</p>
        </div>
      </div>
      {!compact && a.steps.length > 0 && (
        <ol className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
          {a.steps.map((s, i) => (
            <li key={i} className="rounded-md bg-muted px-2 py-0.5">
              {s.label} · {s.days}d
            </li>
          ))}
        </ol>
      )}
      <p className="flex gap-2">
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> <span><span className="font-medium">Next action:</span> {a.nextAction}</span>
      </p>
      {a.alternatives.length > 0 && (short || !compact) && (
        <ul className="space-y-1 rounded-lg bg-muted/50 p-3 text-[13px] text-muted-foreground">
          {a.alternatives.map((x) => (
            <li key={x} className="flex gap-2">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" /> {x}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
