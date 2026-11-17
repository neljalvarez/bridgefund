"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, Check, ChevronDown, Gift, HandCoins, Minus, Package, Percent, Ticket } from "lucide-react";
import type { EnginePlan } from "@/lib/engine";
import { usd } from "@/lib/format";
import { PixelBridge, planksFromSegments } from "@/components/pixel/PixelBridge";
import { AnimatedMoney, PixelLoader } from "@/components/ui/primitives";

const ICONS = { waiver: Ticket, alternative: BookOpen, discount: Percent, borrow: Package, grant: Gift, sponsor: HandCoins, start: Minus, "student-funds": Minus };

export function EngineRun({ plan, runKey, onDone, speed = 850 }: { plan: EnginePlan; runKey: number; onDone?: () => void; speed?: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? plan.phases.length : 0);
  const [openWhy, setOpenWhy] = useState<string | null>(null);

  useEffect(() => {
    setShown(reduce ? plan.phases.length : 0);
  }, [runKey, reduce, plan.phases.length]);

  useEffect(() => {
    if (shown >= plan.phases.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 350 : speed);
    return () => clearTimeout(t);
  }, [shown, plan.phases.length, speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = plan.phases.slice(0, shown);
  const lastGap = visible.length ? visible[visible.length - 1].gapAfter : plan.initialGap;
  const reduced = plan.initialGap - lastGap;
  const finished = shown >= plan.phases.length;
  const sponsorShown = finished ? plan.sponsorAmount : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="border-2 border-line bg-[linear-gradient(to_bottom,rgb(var(--c-raised))_0%,rgb(var(--c-surface))_70%)] px-2 pt-2">
          <PixelBridge
            compact
            planks={planksFromSegments(
              [
                { source: "student", amount: plan.studentFunds },
                { source: "reduction", amount: reduced },
                { source: "sponsor", amount: 0 },
                { source: "gap", amount: lastGap },
              ],
              12,
            )}
          />
        </div>
        <div className="flex gap-2 sm:flex-col">
          <div className="flex-1 border-2 border-line bg-bg px-3 py-1.5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Gap</p>
            <p className="font-pixel text-2xl">
              <AnimatedMoney value={lastGap} />
            </p>
          </div>
          <div className="flex-1 border-2 border-line bg-gold/30 px-3 py-1.5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Reduced</p>
            <p className="font-pixel text-2xl">
              <AnimatedMoney value={reduced} />
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-2 border-dashed border-line/40 px-3 py-2 text-sm">
        <span>
          Starting point: {usd(plan.totalCost)} cost − {usd(plan.studentFunds)} you have
        </span>
        <span className="font-pixel">= {usd(plan.initialGap)} gap</span>
      </div>

      <ol className="space-y-2">
        <AnimatePresence initial={false}>
          {visible.map((ph) => {
            const Icon = ICONS[ph.kind];
            const hit = ph.findings.length > 0;
            return (
              <motion.li key={ph.priority} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`border-2 border-line ${ph.kind === "sponsor" ? "bg-terra/20" : hit ? "bg-surface" : "bg-bg opacity-80"}`}>
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 border-line font-pixel ${hit ? (ph.kind === "sponsor" ? "bg-terra text-[#232824]" : "bg-gold text-[#232824]") : "bg-raised text-muted"}`}>{ph.priority}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon size={14} aria-hidden /> {ph.label}
                    </p>
                    <p className="text-xs text-muted">{ph.question}</p>
                  </div>
                  <span className={`shrink-0 text-right text-xs ${hit ? "font-semibold" : "text-muted"}`}>{ph.note}</span>
                </div>
                {ph.findings.length > 0 && (
                  <ul className="border-t-2 border-line/20">
                    {ph.findings.map((f) => (
                      <li key={f.id} className="px-3 py-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-sm">
                              <Check size={14} className="shrink-0 text-forest" aria-hidden />
                              <span className="font-medium">{f.title}</span>
                            </p>
                            {(f.provider || f.expenseLabel) && (
                              <p className="pl-5 text-xs text-muted">{[f.provider, f.expenseLabel && `applies to: ${f.expenseLabel}`].filter(Boolean).join(" · ")}</p>
                            )}
                          </div>
                          <span className={`shrink-0 font-pixel text-lg ${f.kind === "sponsor" ? "" : "text-forest"}`}>{f.kind === "sponsor" ? usd(f.amount) : `−${usd(f.amount)}`}</span>
                        </div>
                        <button type="button" onClick={() => setOpenWhy(openWhy === f.id ? null : f.id)} className="ml-5 mt-1 flex items-center gap-1 text-xs font-semibold text-forest hover:underline" aria-expanded={openWhy === f.id}>
                          Why was this recommended? <ChevronDown size={12} className={openWhy === f.id ? "rotate-180" : ""} />
                        </button>
                        {openWhy === f.id && (
                          <ul className="ml-5 mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted">
                            {f.reasons.map((r) => (
                              <li key={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</li>
                            ))}
                            {f.kind !== "sponsor" && <li>Final eligibility must be confirmed by the provider or institution.</li>}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      {!finished && <PixelLoader label={`Checking priority ${shown + 1} of ${plan.phases.length}…`} />}

      {finished && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="border-2 border-line bg-forest p-4 text-onforest">
          <p className="font-pixel text-lg">
            {plan.sponsorAmount > 0 ? (
              <>
                Instead of requesting {usd(plan.initialGap)} from sponsors, BridgeFund reduces the uncovered cost to {usd(sponsorShown)}.
              </>
            ) : (
              <>The whole {usd(plan.initialGap)} gap was closed without asking a single sponsor.</>
            )}
          </p>
          <p className="mt-1 text-sm opacity-90">
            {usd(plan.reductionsTotal)} removed through {plan.phases.filter((p) => p.kind !== "sponsor" && p.findings.length).length} reduction step(s).
          </p>
        </motion.div>
      )}
    </div>
  );
}
