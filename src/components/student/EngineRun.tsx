"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, Building2, Check, ChevronDown, Clock, FileCheck2, Gift, HandCoins, Info, ListChecks, Loader2, Package, Percent, ShieldCheck, Ticket, CalendarClock } from "lucide-react";
import type { EngineFinding, EnginePlan, PhaseKind } from "@/lib/engine";
import { fmtDate, isoDaysFromNow, aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/shared/kit";

export const PHASE_ICON: Record<PhaseKind, typeof Ticket> = {
  waiver: Ticket,
  alternative: BookOpen,
  discount: Percent,
  borrow: Package,
  institutional: Building2,
  grant: Gift,
  sponsor: HandCoins,
};

function FindingDetail({ f, deadline }: { f: EngineFinding; deadline: string }) {
  const rows = [
    { icon: Info, label: "Why it was recommended", items: f.why },
    { icon: ShieldCheck, label: "Eligibility requirements", items: f.eligibility },
    { icon: ListChecks, label: "How to apply", items: f.instructions, ordered: true },
    { icon: FileCheck2, label: "Required documentation", items: f.documents },
  ];
  return (
    <div className="grid gap-4 border-t bg-muted/30 px-4 py-4 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label}>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <r.icon className="h-3.5 w-3.5" /> {r.label}
          </p>
          {r.ordered ? (
            <ol className="list-decimal space-y-0.5 ps-4 text-[13px]">
              {r.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          ) : (
            <ul className="space-y-0.5 text-[13px]">
              {r.items.map((x) => (
                <li key={x} className="flex gap-1.5">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  {x.charAt(0).toUpperCase() + x.slice(1)}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] sm:col-span-2">
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-primary" /> Expected savings <strong className="tabular">{aed(f.amount)}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Processing {f.processingDays === 0 ? "instant" : `~${f.processingDays} day${f.processingDays === 1 ? "" : "s"}`}
        </span>
        {f.deadlineDays > 0 && (
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" /> Apply by {fmtDate(deadline)}
          </span>
        )}
      </div>
    </div>
  );
}

export function FindingRow({ f, seededAt, defaultOpen, confirmed }: { f: EngineFinding; seededAt: string; defaultOpen?: boolean; confirmed?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const Icon = PHASE_ICON[f.kind];
  const sponsor = f.kind === "sponsor";
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/40" aria-expanded={open}>
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", sponsor ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-primary-light text-primary")}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{f.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {f.provider}
            {f.expenseLabel && ` · applies to ${f.expenseLabel}`}
          </span>
        </span>
        {!sponsor && <Badge variant={confirmed ? "success" : "outline"} className={cn(!confirmed && "border-dashed")}>{confirmed ? "Confirmed" : "Estimated"}</Badge>}
        <span className={cn("shrink-0 text-sm font-semibold tabular", sponsor ? "text-foreground" : "text-primary")}>{sponsor ? aed(f.amount) : `−${aed(f.amount)}`}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <FindingDetail f={f} deadline={isoDaysFromNow(f.deadlineDays, new Date(seededAt))} />}
    </div>
  );
}

/** Animated, step-by-step BridgeEngine run with a live financial breakdown. */
export function EngineRun({ plan, runKey, seededAt, speed = 900, onDone, stacked }: { plan: EnginePlan; runKey: number; seededAt: string; speed?: number; onDone?: () => void; stacked?: boolean }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? plan.phases.length : 0);

  useEffect(() => setShown(reduce ? plan.phases.length : 0), [runKey, reduce, plan.phases.length]);
  useEffect(() => {
    if (shown >= plan.phases.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 400 : speed);
    return () => clearTimeout(t);
  }, [shown, plan.phases.length, speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = plan.phases.slice(0, shown);
  const applied = visible.filter((p) => p.kind !== "sponsor").flatMap((p) => p.findings);
  const gap = visible.length ? visible[visible.length - 1].gapAfter : plan.initialGap;
  const done = shown >= plan.phases.length;

  return (
    <div className={cn("grid gap-6", stacked ? "xl:grid-cols-[260px_1fr]" : "lg:grid-cols-[340px_1fr]")}>
      <Card className={cn("h-fit p-5", !stacked && "lg:sticky lg:top-20")}>
        <p className="text-[13px] font-medium text-muted-foreground">Remaining funding gap</p>
        <p className={cn("mt-1 text-4xl font-semibold tracking-tight", gap === 0 ? "text-primary" : "")}>
          <AnimatedNumber value={done ? plan.sponsorAmount : gap} />
        </p>
        <div className="mt-5 space-y-0.5 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Total cost</span>
            <span className="tabular">{aed(plan.totalCost)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Personal funds</span>
            <span className="tabular">−{aed(plan.studentFunds)}</span>
          </div>
          <div className="flex justify-between border-t py-1.5 font-medium">
            <span>Initial gap</span>
            <span className="tabular">{aed(plan.initialGap)}</span>
          </div>
          <AnimatePresence initial={false}>
            {applied.map((f) => (
              <motion.div key={f.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex justify-between gap-3 py-1 text-primary">
                <span className="truncate">
                  {f.title} <span className="text-[11px] text-muted-foreground">(est.)</span>
                </span>
                <span className="shrink-0 tabular">−{aed(f.amount)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="flex justify-between border-t py-1.5 font-semibold">
            <span>{done ? "Sponsor request" : "Remaining gap"}</span>
            <span className="tabular">{aed(done ? plan.sponsorAmount : gap)}</span>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full bg-primary" animate={{ width: `${plan.initialGap ? ((plan.initialGap - gap) / plan.initialGap) * 100 : 100}%` }} transition={{ duration: 0.6 }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Estimated savings become confirmed assistance once your institution verifies them.</p>
      </Card>

      <ol className="min-w-0 space-y-3" aria-live="polite">
        {plan.phases.map((ph, i) => {
          const state = i < shown ? "done" : i === shown ? "active" : "pending";
          const Icon = PHASE_ICON[ph.kind];
          return (
            <li key={ph.priority} className={cn("rounded-xl border bg-card p-4 transition-opacity", state === "pending" && "opacity-45")}>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    state === "done" && ph.findings.length ? "border-primary bg-primary text-primary-foreground" : state === "done" ? "bg-muted text-muted-foreground" : "",
                  )}
                >
                  {state === "active" && !done ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : state === "done" && ph.findings.length ? <Check className="h-3.5 w-3.5" /> : ph.priority}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" /> {ph.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{ph.question}</p>
                </div>
                {state === "done" && <span className={cn("hidden text-end text-xs sm:block", ph.findings.length ? "font-medium text-foreground" : "text-muted-foreground")}>{ph.note}</span>}
              </div>
              {state === "done" && ph.findings.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
                  {ph.findings.map((f) => (
                    <FindingRow key={f.id} f={f} seededAt={seededAt} />
                  ))}
                </motion.div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
