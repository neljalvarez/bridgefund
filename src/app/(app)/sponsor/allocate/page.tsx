"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Info, RotateCcw, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { currentSponsor, fundRequest, remainingOf } from "@/lib/actions";
import { rankNeeds, suggestAllocation } from "@/lib/allocation";
import { studentOf, verifiedNeeds } from "@/lib/selectors";
import { fmtDate, relDays, urgencyOf, usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, FieldError, PageHeader, StatCard, UrgencyBadge } from "@/components/shared/kit";

export default function AllocatePage() {
  const { state, dispatch } = useStore();
  const sponsor = currentSponsor(state);
  const [budgetText, setBudgetText] = useState(String(Math.min(500, sponsor.balance)));
  const budget = Math.max(0, Number(budgetText) || 0);
  const [needs] = useState(() => verifiedNeeds(state)); // frozen while the sponsor edits
  const alloc = useMemo(() => needs.map((r) => ({ id: r.id, ref: r.ref, label: r.purpose, amount: r.amount, funded: r.funded, deadline: r.deadline })), [needs]);
  const suggestion = useMemo(() => suggestAllocation(alloc, budget, new Date()), [alloc, budget]);
  const ranked = useMemo(() => rankNeeds(alloc, new Date()), [alloc]);
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [done, setDone] = useState<{ ref: string; amount: number }[] | null>(null);

  useEffect(() => setAmounts(Object.fromEntries(suggestion.items.map((i) => [i.needId, i.amount]))), [suggestion]);

  const total = Object.values(amounts).reduce((a, b) => a + (b || 0), 0);
  const overBudget = total > budget + 0.001;
  const overBalance = budget > sponsor.balance;
  const fully = ranked.filter((r) => (amounts[r.need.id] ?? 0) >= r.remaining).length;
  const edited = JSON.stringify(Object.fromEntries(Object.entries(amounts).filter(([, v]) => v > 0))) !== JSON.stringify(Object.fromEntries(suggestion.items.map((i) => [i.needId, i.amount])));

  const confirm = () => {
    const out: { ref: string; amount: number }[] = [];
    for (const [id, amt] of Object.entries(amounts)) {
      if (amt > 0) {
        dispatch(fundRequest(id, amt, "sponsor"));
        out.push({ ref: needs.find((n) => n.id === id)!.ref, amount: amt });
      }
    }
    setDone(out);
    dispatch((s) => s, { success: `${usd(total)} allocated across ${out.length} needs`, description: "Verifying institutions confirm each payment to the provider." });
  };

  if (done) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-4 p-6">
          <CheckCircle2 className="h-9 w-9 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Allocation confirmed</h1>
            <p className="text-sm text-muted-foreground">
              {usd(done.reduce((a, b) => a + b.amount, 0))} committed to {done.length} verified needs.
            </p>
          </div>
          <ul className="divide-y rounded-lg border text-sm">
            {done.map((d) => (
              <li key={d.ref} className="flex justify-between px-3 py-2">
                <span>{d.ref}</span>
                <span className="font-medium tabular">{usd(d.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="flex gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> Institutions retain final approval and pay providers directly. Receipts are on your dashboard.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/sponsor">View dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sponsor/marketplace">Marketplace</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Smart impact allocation"
        description="Enter a budget and BridgeFund recommends a transparent allocation across verified needs — ranked by deadline urgency, the ability to fully cover an expense, and existing assistance. Adjust anything before you confirm."
      />
      {needs.length === 0 ? (
        <EmptyState title="No open verified needs" description="New needs appear here once institutions verify them." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card className="h-fit lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle>Contribution budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="budget">Amount to allocate</Label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="budget" className="h-11 pl-7 text-lg font-semibold tabular" inputMode="decimal" value={budgetText} onChange={(e) => setBudgetText(e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={overBalance} />
                </div>
                <FieldError>{overBalance ? `Exceeds ${sponsor.name}'s balance of ${usd(sponsor.balance)}.` : null}</FieldError>
                {!overBalance && <p className="mt-1.5 text-xs text-muted-foreground">Available: {usd(sponsor.balance)}</p>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[100, 250, 500].map((v) => (
                  <Button key={v} variant="outline" size="sm" onClick={() => setBudgetText(String(Math.min(v, sponsor.balance)))}>
                    {usd(v)}
                  </Button>
                ))}
              </div>
              <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">How recommendations are ranked</p>
                <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
                  <li>Deadline urgency</li>
                  <li>Smallest amount that fully covers the expense</li>
                  <li>Existing assistance already secured</li>
                </ol>
                <p className="mt-2">Any leftover goes to the next most urgent need as partial support.</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              <StatCard label="Fully covered opportunities" value={fully} money={false} tone="primary" />
              <StatCard label="Total allocated" value={total} />
              <StatCard label="Remaining sponsor balance" value={Math.max(sponsor.balance - total, 0)} hint={`${usd(Math.max(budget - total, 0))} of this budget unallocated`} />
            </div>
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Recommended allocations</CardTitle>
                {edited && (
                  <Button variant="ghost" size="sm" onClick={() => setAmounts(Object.fromEntries(suggestion.items.map((i) => [i.needId, i.amount])))}>
                    <RotateCcw /> Reset to recommendation
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {ranked.map((rk, i) => {
                    const r = needs.find((n) => n.id === rk.need.id)!;
                    const st = studentOf(state, r.studentId);
                    const item = suggestion.items.find((x) => x.needId === r.id);
                    const amt = amounts[r.id] ?? 0;
                    return (
                      <li key={r.id} className={cn("grid gap-3 px-5 py-4 md:grid-cols-[2rem_1fr_9.5rem] md:items-start", amt <= 0 && "opacity-70")}>
                        <span className="text-sm font-semibold text-muted-foreground">#{i + 1}</span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">{r.ref}</span>
                            <UrgencyBadge label={urgencyOf(r.deadline).label} />
                            {amt > 0 && amt >= rk.remaining && (
                              <Badge variant="accent">
                                <Check /> Fully covers expense
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 font-medium">{r.purpose}</p>
                          <p className="text-xs text-muted-foreground">
                            {st?.firstName}, {st?.country} · due {fmtDate(r.deadline)} ({relDays(r.deadline)}) · {usd(rk.remaining)} remaining
                            {r.funded > 0 && ` · ${usd(r.funded)} already secured`}
                          </p>
                          {item ? (
                            <ul className="mt-2 space-y-0.5 text-xs">
                              {item.reasons.map((reason) => (
                                <li key={reason} className="flex gap-1.5">
                                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {reason}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-xs text-muted-foreground">Not recommended at this budget — higher-ranked needs come first. You can add an amount manually.</p>
                          )}
                        </div>
                        <div>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                            <Input
                              aria-label={`Allocation for ${r.ref}`}
                              className="pl-6 text-right font-medium tabular"
                              inputMode="decimal"
                              value={amt || ""}
                              placeholder="0"
                              onChange={(e) => setAmounts({ ...amounts, [r.id]: Math.min(Number(e.target.value.replace(/[^\d.]/g, "")) || 0, rk.remaining) })}
                            />
                          </div>
                          <button type="button" className="mt-1 text-xs font-medium text-primary hover:underline" onClick={() => setAmounts({ ...amounts, [r.id]: rk.remaining })}>
                            Cover fully ({usd(rk.remaining)})
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> Institutional representatives retain final approval authority. Simulated transaction — no real money moves.
                </p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {overBudget && <p className="text-xs font-medium text-destructive">Allocations ({usd(total)}) exceed the budget ({usd(budget)}).</p>}
                  <Button onClick={confirm} disabled={overBudget || overBalance || total <= 0}>
                    Confirm {usd(total)} allocation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
