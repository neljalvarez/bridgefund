"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Play, RotateCcw, Save, Send, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { applyEnginePlan } from "@/lib/actions";
import { planFor } from "@/lib/plan";
import { requestForOpp } from "@/lib/selectors";
import { EXPENSE_LABEL, OPP_LABEL, fmtDateLong, usd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState, PageHeader, StatusBadge } from "@/components/shared/kit";
import { EngineRun } from "@/components/student/EngineRun";

const LOCKED = ["Verified", "Partially Funded", "Fully Funded", "Completed"];

function EngineInner() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const mine = state.opportunities.filter((o) => o.studentId === state.currentStudentId);
  const [oppId, setOppId] = useState(params.get("opp") ?? mine.find((o) => !requestForOpp(state, o.id))?.id ?? mine[0]?.id ?? "");
  const opp = mine.find((o) => o.id === oppId);
  const [runKey, setRunKey] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const plan = useMemo(() => (opp ? planFor(state, opp) : null), [opp, state]);
  const existing = opp ? requestForOpp(state, opp.id) : undefined;
  const locked = !!existing && LOCKED.includes(existing.status);

  if (!opp || !plan) {
    return <EmptyState title="No opportunities yet" description="Scan a barrier first — BridgeEngine needs an opportunity to analyse." action={<Button asChild><Link href="/student/scanner">Open the barrier scanner</Link></Button>} />;
  }

  const run = () => {
    setFinished(false);
    setRunning(true);
    setRunKey((k) => k + 1);
  };

  const apply = (submit: boolean) => {
    dispatch(applyEnginePlan(opp.id, plan, submit), submit ? { success: "Submitted for verification", description: plan.sponsorAmount > 0 ? `${usd(plan.sponsorAmount)} requested after ${usd(plan.reductionsTotal)} in estimated savings.` : "Your institution will confirm the estimated savings." } : { info: "Plan saved as a draft" });
    router.push("/student/requests");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-end">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,320px)_1fr]">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium" htmlFor="opp-select">
                Opportunity
              </label>
              <Select
                value={oppId}
                onValueChange={(v) => {
                  setOppId(v);
                  setRunning(false);
                  router.replace(`/student/engine?opp=${v}`);
                }}
              >
                <SelectTrigger id="opp-select">
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
            </div>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Type · deadline</p>
                <p className="font-medium">
                  {OPP_LABEL[opp.category]} · {fmtDateLong(opp.deadline)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="font-medium">{opp.expenses.map((e) => `${e.label} (${usd(e.amount)})`).join(", ")}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {existing && <StatusBadge status={existing.status} />}
            {running ? (
              <Button variant="outline" onClick={run}>
                <RotateCcw /> Replay
              </Button>
            ) : (
              <Button onClick={run} disabled={locked}>
                <Play /> Run BridgeEngine
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {locked && !running && (
        <p className="rounded-lg border bg-primary-light/50 px-4 py-3 text-sm">
          {existing?.ref} is already {existing?.status.toLowerCase()}. Its savings are confirmed, so the plan is locked. You can still replay the analysis.{" "}
          <Button variant="link" className="h-auto p-0" onClick={run}>
            Replay analysis
          </Button>
        </p>
      )}

      {!running ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>What BridgeEngine will check</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-2 sm:grid-cols-2">
                {plan.phases.map((p) => (
                  <li key={p.priority} className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">{p.priority}</span>
                    {p.label}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Starting point</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              {opp.expenses.map((e) => (
                <div key={e.id} className="flex justify-between gap-2">
                  <span className="truncate text-muted-foreground">
                    {e.label} {!e.confirmed && <Badge variant="outline" className="ml-1 border-dashed">est.</Badge>}
                  </span>
                  <span className="tabular">{usd(e.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-1.5 text-muted-foreground">
                <span>Personal funds</span>
                <span className="tabular">−{usd(plan.studentFunds)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Initial gap</span>
                <span className="tabular">{usd(plan.initialGap)}</span>
              </div>
              <p className="pt-2 text-xs text-muted-foreground">Categories: {[...new Set(opp.expenses.map((e) => EXPENSE_LABEL[e.category]))].join(", ")}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <EngineRun plan={plan} runKey={runKey} seededAt={state.seededAt} onDone={() => setFinished(true)} />
          {finished && (
            <Card className="border-primary/30 bg-primary-light/40">
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold tracking-tight">
                    {plan.sponsorAmount > 0 ? `Instead of requesting ${usd(plan.initialGap)}, BridgeFund reduces the uncovered cost to ${usd(plan.sponsorAmount)}.` : `The whole ${usd(plan.initialGap)} gap can be closed without sponsors.`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {usd(plan.reductionsTotal)} in estimated savings across {plan.phases.filter((p) => p.kind !== "sponsor" && p.findings.length).length} steps. Re-running replaces earlier estimates — savings are never counted twice.
                  </p>
                </div>
                {!locked && (
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" onClick={() => apply(false)}>
                      <Save /> Save draft
                    </Button>
                    <Button onClick={() => apply(true)}>
                      <Send /> {plan.sponsorAmount > 0 ? `Request ${usd(plan.sponsorAmount)}` : "Submit for verification"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function EnginePage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Core innovation
          </span>
        }
        title="BridgeEngine"
        description="An explainable gap resolver. It always reduces the cost first — waivers, free alternatives, discounts, borrowing, institutional help and grants — and asks sponsors only for what genuinely remains."
      />
      <Suspense>
        <EngineInner />
      </Suspense>
    </>
  );
}
