"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, Clock, Gauge, Info, ShieldCheck, Sparkles } from "lucide-react";
import type { StrategyComparison as Comparison, Strategy } from "@/lib/optimizer";
import type { StrategyId } from "@/lib/types";
import { usd } from "@/lib/format";
import { fmtMultiplier } from "@/lib/impact";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_VARIANT = { Confirmed: "success", Estimated: "outline", Pending: "warning", "Own funds": "neutral" } as const;

export const pct = (n: number) => `${Math.round(n * 100)}%`;

function Metric({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "good" | "warn" }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("text-[15px] font-semibold tabular", tone === "good" && "text-primary", tone === "warn" && "text-warning")}>{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function StrategyCard({ s, recommended, selected, onSelect, daysLeft, best }: { s: Strategy; recommended: boolean; selected: boolean; onSelect?: () => void; daysLeft: number; best: Record<string, StrategyId> }) {
  const [open, setOpen] = useState(selected);
  return (
    <Card className={cn("flex flex-col transition-shadow", selected ? "ring-2 ring-primary" : "hover:shadow-elevated")}>
      <button type="button" onClick={onSelect} disabled={!onSelect} className="flex flex-1 flex-col justify-start p-5 text-left focus-visible:outline-none disabled:cursor-default" aria-pressed={selected}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              {recommended && (
                <Badge variant="accent">
                  <Sparkles /> Recommended
                </Badge>
              )}
              {best.cost === s.id && <Badge variant="neutral">Lowest out-of-pocket</Badge>}
              {best.speed === s.id && <Badge variant="neutral">Fastest</Badge>}
              {best.independence === s.id && <Badge variant="neutral">Least external funding</Badge>}
            </div>
            <p className="mt-2 font-semibold">{s.name}</p>
            <p className="mt-0.5 min-h-[2.5rem] text-[13px] text-muted-foreground">{s.tagline}</p>
          </div>
          {onSelect && (
            <span className={cn("mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", selected && "border-primary bg-primary text-primary-foreground")}>{selected && <Check className="h-3 w-3" />}</span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
          <Metric label="Student pays" value={usd(s.studentPays)} />
          <Metric label="Sponsors asked" value={usd(s.sponsorNeeded)} />
          <Metric label="Cost reductions" value={usd(s.costReductions)} tone="good" />
          <Metric label="Time to secure" value={`~${s.daysToSecure} days`} tone={s.meetsDeadline ? undefined : "warn"} hint={`${Math.max(daysLeft, 0)} days left`} />
          <Metric label="Est. likelihood" value={pct(s.likelihood)} hint="before deadline" />
          <Metric label="Impact multiplier" value={fmtMultiplier(s.multiplier)} tone="good" />
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>External funding dependency</span>
            <span className="tabular">{pct(s.externalDependency)}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-warning/70" style={{ width: pct(s.externalDependency) }} />
          </div>
        </div>
        {!s.meetsDeadline && (
          <p className="mt-3 flex gap-1.5 text-xs text-warning">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> May not complete before the deadline.
          </p>
        )}
      </button>
      <div className="border-t">
        <button type="button" className="flex w-full items-center justify-between px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => setOpen(!open)} aria-expanded={open}>
          How this covers {usd(s.totalCost)} <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="space-y-1.5 px-5 pb-4 text-sm">
            {s.lines.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate">{l.label}</span>
                  <Badge variant={STATUS_VARIANT[l.status]} className={cn("shrink-0", l.status === "Estimated" && "border-dashed")}>
                    {l.status}
                  </Badge>
                </span>
                <span className="shrink-0 tabular">{usd(l.amount)}</span>
              </div>
            ))}
            {s.notes.length > 0 && (
              <ul className="mt-2 space-y-1 border-t pt-2 text-xs text-muted-foreground">
                {s.notes.map((n) => (
                  <li key={n} className="flex gap-1.5">
                    <Info className="mt-0.5 h-3 w-3 shrink-0" /> {n}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export function StrategyComparisonView({ cmp, selected, onSelect }: { cmp: Comparison; selected?: StrategyId; onSelect?: (id: StrategyId) => void }) {
  const [showExcluded, setShowExcluded] = useState(false);
  const sorted = (key: (s: Strategy) => number) => [...cmp.strategies].sort((a, b) => key(a) - key(b))[0].id;
  const best = { cost: sorted((s) => s.studentPays * 1000 + s.sponsorNeeded), speed: sorted((s) => s.daysToSecure * 1000 + s.sponsorNeeded), independence: sorted((s) => s.externalDependency * 1000 + s.studentPays) };
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-3">
        {cmp.strategies.map((s) => (
          <StrategyCard key={s.id} s={s} recommended={cmp.recommended === s.id} selected={selected === s.id} onSelect={onSelect ? () => onSelect(s.id) : undefined} daysLeft={cmp.daysLeft} best={best} />
        ))}
      </div>
      <Card>
        <CardContent className="grid gap-6 p-5 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Gauge className="h-4 w-4 text-primary" /> Trade-offs
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {cmp.tradeoffs.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 text-xs text-muted-foreground">
            <p className="flex gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> <span><strong className="text-foreground">Confirmed</strong> assistance has been verified by your institution. <strong className="text-foreground">Estimated</strong> options depend on approval. <strong className="text-foreground">Pending</strong> sponsor funding is not yet secured.</span>
            </p>
            <p className="flex gap-2">
              <Clock className="h-4 w-4 shrink-0" /> Likelihood and timing are estimates from programme processing times and your deadline. BridgeFund never guarantees funding.
            </p>
            {cmp.excluded.length > 0 && (
              <div>
                <button type="button" className="flex items-center gap-1 font-medium text-foreground hover:underline" onClick={() => setShowExcluded(!showExcluded)} aria-expanded={showExcluded}>
                  {cmp.excluded.length} option{cmp.excluded.length === 1 ? "" : "s"} considered but excluded <ChevronDown className={cn("h-3 w-3", showExcluded && "rotate-180")} />
                </button>
                {showExcluded && (
                  <ul className="mt-2 space-y-1.5">
                    {cmp.excluded.map((x) => (
                      <li key={x.title + x.reason}>
                        <span className="font-medium text-foreground">{x.title}</span> — {x.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
