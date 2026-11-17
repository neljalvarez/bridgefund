"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Plus, Save, Send, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { applyStrategy, remainingOf } from "@/lib/actions";
import { planFor, strategiesFor } from "@/lib/plan";
import type { StrategyId } from "@/lib/types";
import { requestForOpp } from "@/lib/selectors";
import { fmtDateLong, relDays, usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, StatusBadge } from "@/components/shared/kit";
import { EngineRun } from "@/components/student/EngineRun";
import { StrategyComparisonView } from "@/components/student/StrategyComparison";
import { RequestBreakdown, StatusTrack } from "@/components/shared/RequestBreakdown";

const STEPS = ["Costs", "Solutions", "Savings", "Request", "Track"] as const;
const LOCKED = ["Submitted", "Under Review", "Additional Information Required", "Verified", "Partially Funded", "Fully Funded", "Completed", "Rejected"];

function Stepper({ step, reached, go }: { step: number; reached: number; go: (n: number) => void }) {
  return (
    <ol className="mb-8 grid grid-cols-5 gap-2" aria-label="Assistance journey">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={label}>
            <button type="button" disabled={n > reached} onClick={() => go(n)} aria-current={current ? "step" : undefined} className="group w-full text-left disabled:cursor-default focus-visible:outline-none">
              <span className={cn("block h-1 rounded-full transition-colors", done || current ? "bg-primary" : "bg-secondary")} />
              <span className={cn("mt-2 flex items-center gap-1.5 text-xs sm:text-sm", current ? "font-medium text-foreground" : done ? "text-foreground" : "text-muted-foreground")}>
                <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold", done ? "bg-primary text-primary-foreground" : current ? "border-2 border-primary text-primary" : "border text-muted-foreground")}>
                  {done ? <Check className="h-3 w-3" /> : n}
                </span>
                <span className={cn("truncate", !current && "hidden sm:inline")}>{label}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Footer({ back, children }: { back?: () => void; children: React.ReactNode }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
      {back ? (
        <Button variant="ghost" onClick={back}>
          <ArrowLeft /> Back
        </Button>
      ) : (
        <span />
      )}
      <div className="flex flex-col gap-2 sm:flex-row">{children}</div>
    </div>
  );
}

function Journey() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const mine = state.opportunities.filter((o) => o.studentId === state.currentStudentId);
  const [oppId, setOppId] = useState(params.get("opp") ?? mine.find((o) => !requestForOpp(state, o.id))?.id ?? mine[0]?.id ?? "");
  const opp = mine.find((o) => o.id === oppId);
  const existing = opp ? requestForOpp(state, opp.id) : undefined;
  const locked = !!existing && LOCKED.includes(existing.status);
  const initial = locked ? 5 : 1;
  const [step, setStep] = useState(initial);
  const [reached, setReached] = useState(initial);
  const [runKey, setRunKey] = useState(0);
  const plan = useMemo(() => (opp ? planFor(state, opp) : null), [opp, state]);
  const cmp = useMemo(() => (opp ? strategiesFor(state, opp) : null), [opp, state]);
  const [choice, setChoice] = useState<StrategyId | null>(null);
  const chosen = cmp?.strategies.find((x) => x.id === (choice ?? existing?.strategy ?? cmp.recommended)) ?? cmp?.strategies[0];

  useEffect(() => {
    const s = locked ? 5 : 1;
    setStep(s);
    setReached(locked ? 5 : 1);
    setChoice(null);
  }, [oppId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!opp || !plan || !cmp || !chosen) {
    return <EmptyState title="No opportunities yet" description="Add an opportunity and its costs to start." action={<Button asChild><Link href="/student/scanner">Add opportunity</Link></Button>} />;
  }

  const go = (n: number) => {
    setStep(n);
    setReached((r) => Math.max(r, n));
    if (n === 2) setRunKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = (send: boolean) => {
    dispatch(applyStrategy(opp.id, chosen, send), send ? { success: "Request submitted", description: "Your school will verify it next." } : { info: "Saved as a draft" });
    go(5);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <label htmlFor="opp-select" className="sr-only">
            Opportunity
          </label>
          <Select
            value={oppId}
            onValueChange={(v) => {
              setOppId(v);
              router.replace(`/student/engine?opp=${v}`);
            }}
          >
            <SelectTrigger id="opp-select" className="h-11 w-full text-base font-medium sm:w-[360px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mine.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Due {fmtDateLong(opp.deadline)} · {relDays(opp.deadline)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {existing && <StatusBadge status={existing.status} />}
          <Button asChild variant="ghost" size="sm">
            <Link href="/student/scanner">
              <Plus /> New opportunity
            </Link>
          </Button>
        </div>
      </div>

      <Stepper step={step} reached={reached} go={go} />

      <AnimatePresence mode="wait">
        <motion.div key={`${oppId}-${step}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          {step === 1 && (
            <section aria-labelledby="s1">
              <h2 id="s1" className="text-xl font-semibold tracking-tight">
                What does it cost?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Every expense, minus what you already have.</p>
              <div className="mt-6 grid gap-6 md:grid-cols-[1fr_260px]">
                <Card>
                  <CardContent className="divide-y p-0 text-sm">
                    {opp.expenses.map((e) => (
                      <div key={e.id} className="flex justify-between gap-3 px-5 py-3">
                        <span>
                          {e.label} {!e.confirmed && <span className="text-xs text-muted-foreground">(estimate)</span>}
                        </span>
                        <span className="tabular">{usd(e.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-3 px-5 py-3 text-muted-foreground">
                      <span>Your own funds</span>
                      <span className="tabular">−{usd(plan.studentFunds)}</span>
                    </div>
                  </CardContent>
                </Card>
                <div className="rounded-xl border bg-card p-5">
                  <p className="text-[13px] font-medium text-muted-foreground">Your gap</p>
                  <p className="mt-1 text-4xl font-semibold tracking-tight tabular">{usd(plan.initialGap)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">of {usd(plan.totalCost)} total</p>
                </div>
              </div>
              <Footer>
                <Button size="lg" onClick={() => go(2)} disabled={plan.initialGap <= 0}>
                  Find solutions <ArrowRight />
                </Button>
              </Footer>
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="s2">
              <h2 id="s2" className="text-xl font-semibold tracking-tight">
                BridgeEngine checks seven ways to cut the cost
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Savings first. Sponsors only for what&apos;s left.</p>
              <div className="mt-6">
                <EngineRun plan={plan} runKey={runKey} seededAt={state.seededAt} speed={700} />
              </div>
              <Footer back={() => go(1)}>
                <Button size="lg" onClick={() => go(3)}>
                  Compare plans <ArrowRight />
                </Button>
              </Footer>
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="s3">
              <h2 id="s3" className="text-xl font-semibold tracking-tight">
                Choose how to close the gap
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Three plans built from the savings you qualify for. Estimates, never guarantees.</p>
              <div className="mt-6">
                <StrategyComparisonView cmp={cmp} selected={chosen.id} onSelect={locked ? undefined : setChoice} />
              </div>
              <Footer back={() => go(2)}>
                <Button size="lg" onClick={() => go(locked ? 5 : 4)}>
                  {locked ? "Track request" : `Use “${chosen.name}”`} <ArrowRight />
                </Button>
              </Footer>
            </section>
          )}

          {step === 4 && (
            <section aria-labelledby="s4">
              <h2 id="s4" className="text-xl font-semibold tracking-tight">
                Request what&apos;s left
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Your school checks it privately before sponsors see it.</p>
              <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
                <Card>
                  <CardContent className="space-y-1 p-5 text-sm">
                    <Row label="Total cost" value={usd(plan.totalCost)} />
                    <Row label="Your own funds" value={`−${usd(chosen.studentPays)}`} muted />
                    {chosen.lines
                      .filter((l) => l.kind !== "student" && l.kind !== "sponsor")
                      .map((l) => (
                        <Row key={l.label} label={l.label} value={`−${usd(l.amount)}`} tone tag={l.status} />
                      ))}
                  </CardContent>
                </Card>
                <div className="rounded-xl border border-primary/25 bg-primary-light/50 p-5 dark:bg-primary/10">
                  <p className="text-[13px] font-medium text-primary">You&apos;ll request</p>
                  <p className="mt-1 text-4xl font-semibold tracking-tight tabular">{usd(chosen.sponsorNeeded)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">instead of {usd(plan.initialGap)}</p>
                  <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> Free to request. Money goes to the provider, never as a loan.
                  </p>
                </div>
              </div>
              <Footer back={() => go(3)}>
                <Button variant="outline" size="lg" onClick={() => submit(false)}>
                  <Save /> Save draft
                </Button>
                <Button size="lg" onClick={() => submit(true)}>
                  <Send /> Submit request
                </Button>
              </Footer>
            </section>
          )}

          {step === 5 && (
            <section aria-labelledby="s5">
              <h2 id="s5" className="text-xl font-semibold tracking-tight">
                Track the outcome
              </h2>
              {existing ? (
                <>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {existing.ref} · {remainingOf(existing) > 0 ? `${usd(remainingOf(existing))} still to secure` : "Fully covered"}
                  </p>
                  <Card className="mt-6">
                    <CardContent className="space-y-6 p-5">
                      <StatusTrack status={existing.status} />
                      <RequestBreakdown r={existing} state={state} />
                    </CardContent>
                  </Card>
                  <Footer back={() => go(3)}>
                    {existing.status === "Draft" ? (
                      <Button size="lg" onClick={() => go(4)}>
                        <Send /> Review and submit
                      </Button>
                    ) : (
                      <Button asChild size="lg" variant="outline">
                        <Link href="/student/requests">All my requests</Link>
                      </Button>
                    )}
                  </Footer>
                </>
              ) : (
                <EmptyState title="Nothing submitted yet" action={<Button onClick={() => go(1)}>Start with your costs</Button>} />
              )}
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function Row({ label, value, muted, tone, tag }: { label: string; value: string; muted?: boolean; tone?: boolean; tag?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className={cn("flex min-w-0 items-center gap-2", muted && "text-muted-foreground")}>
        <span className="truncate">{label}</span>
        {tag && <span className="shrink-0 rounded-md border border-dashed px-1.5 text-[11px] text-muted-foreground">{tag}</span>}
      </span>
      <span className={cn("shrink-0 tabular", tone && "text-primary")}>{value}</span>
    </div>
  );
}

export default function GetAssistancePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">Get assistance</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">From cost to covered in five steps.</p>
      </div>
      <Suspense>
        <Journey />
      </Suspense>
    </div>
  );
}
