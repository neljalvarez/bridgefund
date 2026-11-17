"use client";

import { anonId } from "@/lib/uae";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Info, RotateCcw, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { createPledges, currentSponsor } from "@/lib/actions";
import { APPROACHES, planAllocation, rankNeeds, type Approach } from "@/lib/allocation";
import { oppOf, studentOf, verifiedNeeds } from "@/lib/selectors";
import { OPP_LABEL, fmtDate, relDays, urgencyOf, aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, FieldError, PageHeader, StatCard, UrgencyBadge } from "@/components/shared/kit";

const ORDER: Approach[] = ["most", "urgent", "category"];

export default function ImpactPlannerPage() {
  const { state, dispatch } = useStore();
  const sponsor = currentSponsor(state);
  const [budgetText, setBudgetText] = useState(String(Math.min(250, sponsor.balance)));
  const budget = Math.max(0, Number(budgetText) || 0);
  const [needs] = useState(() => verifiedNeeds(state)); // frozen while the sponsor plans
  const pendingIds = new Set(state.pledges.filter((p) => p.status === "Pending review").map((p) => p.requestId));
  const alloc = useMemo(
    () =>
      needs.map((r) => ({
        id: r.id,
        ref: r.ref,
        label: r.purpose,
        amount: r.amount,
        funded: r.funded,
        deadline: r.deadline,
        studentId: r.studentId,
        category: OPP_LABEL[oppOf(state, r.opportunityId)?.category ?? "workshop"],
      })),
    [needs, state],
  );
  const categories = useMemo(() => [...new Set(alloc.map((a) => a.category))].sort(), [alloc]);
  const [category, setCategory] = useState<string>("");
  useEffect(() => {
    if (!category && categories.length) setCategory(categories[0]);
  }, [categories, category]);
  const [approach, setApproach] = useState<Approach>("urgent");
  const plans = useMemo(() => Object.fromEntries(ORDER.map((a) => [a, planAllocation(alloc, budget, new Date(), a, category)])) as Record<Approach, ReturnType<typeof planAllocation>>, [alloc, budget, category]);
  const plan = plans[approach];
  const ranked = useMemo(() => rankNeeds(alloc, new Date()), [alloc]);
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [done, setDone] = useState<{ ref: string; amount: number }[] | null>(null);
  const recommended = useMemo(() => Object.fromEntries(plan.items.map((i) => [i.needId, i.amount])), [plan]);
  useEffect(() => setAmounts(recommended), [recommended]);

  const total = Math.round(Object.values(amounts).reduce((a, b) => a + (b || 0), 0) * 100) / 100;
  const overBudget = total > budget + 0.001;
  const overBalance = budget > sponsor.balance;
  const fully = ranked.filter((r) => (amounts[r.need.id] ?? 0) >= r.remaining).length;
  const edited = JSON.stringify(Object.fromEntries(Object.entries(amounts).filter(([, v]) => v > 0))) !== JSON.stringify(recommended);
  const order = [...plan.items.map((i) => i.needId), ...ranked.map((r) => r.need.id).filter((id) => !plan.items.some((i) => i.needId === id))];

  const submit = () => {
    const items = Object.entries(amounts)
      .filter(([, v]) => v > 0)
      .map(([requestId, amount]) => ({ requestId, amount }));
    dispatch(createPledges(items, APPROACHES[approach].name + (approach === "category" ? ` (${category})` : "") + (edited ? ", adjusted" : "")), {
      success: `${aed(total)} submitted for institutional review`,
      description: "The amount is held from your balance until institutions approve or decline each allocation.",
    });
    setDone(items.map((i) => ({ ref: needs.find((n) => n.id === i.requestId)!.ref, amount: i.amount })));
  };

  if (done) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-4 p-6">
          <CheckCircle2 className="h-9 w-9 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Allocation submitted for review</h1>
            <p className="text-sm text-muted-foreground">
              {aed(done.reduce((a, b) => a + b.amount, 0))} proposed across {done.length} verified needs. It is held from your balance until each verifying institution approves or declines it.
            </p>
          </div>
          <ul className="divide-y rounded-lg border text-sm">
            {done.map((d) => (
              <li key={d.ref} className="flex justify-between px-3 py-2">
                <span>{d.ref}</span>
                <span className="font-medium tabular">{aed(d.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="flex gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> Declined allocations return to your balance. Approved allocations are capped at each remaining gap, and any excess is returned.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/sponsor">View dashboard</Link>
            </Button>
            <Button variant="outline" onClick={() => setDone(null)}>
              Plan another budget
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Budget planner"
        description="Compare three ways to spend a budget. Schools approve the final allocation."
      />
      {needs.length === 0 ? (
        <EmptyState title="No open verified needs" description="New needs appear here once institutions verify them." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Card className="h-fit lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle>Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="budget">Amount to allocate (AED)</Label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">AED</span>
                  <Input id="budget" className="h-11 ps-14 text-lg font-semibold tabular" inputMode="decimal" value={budgetText} onChange={(e) => setBudgetText(e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={overBalance} />
                </div>
                <FieldError>{overBalance ? `Exceeds ${sponsor.name}'s balance of ${aed(sponsor.balance)}.` : null}</FieldError>
                {!overBalance && <p className="mt-1.5 text-xs text-muted-foreground">Available: {aed(sponsor.balance)}</p>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[100, 250, 500].map((v) => (
                  <Button key={v} variant="outline" size="sm" onClick={() => setBudgetText(String(Math.min(v, sponsor.balance)))}>
                    {aed(v)}
                  </Button>
                ))}
              </div>
              <div>
                <Label>Category focus</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1.5" aria-label="Category focus">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c} ({alloc.filter((a) => a.category === c).length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-xs text-muted-foreground">Used by the “Focus on one category” approach.</p>
              </div>
            </CardContent>
          </Card>

          <div className="min-w-0 space-y-4">
            <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Allocation approach">
              {ORDER.map((a) => {
                const p = plans[a];
                const on = a === approach;
                return (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setApproach(a)}
                    className={cn("rounded-xl border bg-card p-4 text-start shadow-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", on ? "border-primary ring-1 ring-primary" : "hover:border-primary/40")}
                  >
                    <p className="flex items-center justify-between gap-2 text-sm font-semibold">
                      {APPROACHES[a].name}
                      {on && <Check className="h-4 w-4 text-primary" />}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{APPROACHES[a].tagline}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                      <dt className="text-muted-foreground">Needs fully covered</dt>
                      <dd className="text-end font-semibold tabular">{p.fullyCovered}</dd>
                      <dt className="text-muted-foreground">Students reached</dt>
                      <dd className="text-end font-semibold tabular">{p.students}</dd>
                      <dt className="text-muted-foreground">Urgent (≤7d) covered</dt>
                      <dd className="text-end font-semibold tabular">{p.urgentCovered}</dd>
                      <dt className="text-muted-foreground">Unallocated</dt>
                      <dd className="text-end font-semibold tabular">{aed(p.unallocated)}</dd>
                    </dl>
                    <p className="mt-3 border-t pt-2 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">Trade-off:</span> {APPROACHES[a].tradeoff}
                      {p.urgentLeft > 0 && ` ${p.urgentLeft} urgent need${p.urgentLeft === 1 ? "" : "s"} left uncovered.`}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              <StatCard label="Needs fully covered" value={fully} money={false} tone="primary" />
              <StatCard label="Total proposed" value={total} />
              <StatCard label="Balance after hold" value={Math.max(sponsor.balance - total, 0)} hint={`${aed(Math.max(budget - total, 0))} of this budget unallocated`} />
            </div>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Proposed allocations</CardTitle>
                {edited && (
                  <Button variant="ghost" size="sm" onClick={() => setAmounts(recommended)}>
                    <RotateCcw /> Reset to approach
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {order.map((id, i) => {
                    const r = needs.find((n) => n.id === id)!;
                    const rk = ranked.find((x) => x.need.id === id)!;
                    const st = studentOf(state, r.studentId);
                    const item = plan.items.find((x) => x.needId === id);
                    const amt = amounts[id] ?? 0;
                    const cat = alloc.find((a) => a.id === id)?.category;
                    return (
                      <li key={id} className={cn("grid gap-3 px-5 py-4 md:grid-cols-[2rem_1fr_9.5rem] md:items-start", amt <= 0 && "opacity-70")}>
                        <span className="text-sm font-semibold text-muted-foreground">#{i + 1}</span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">{r.ref}</span>
                            <UrgencyBadge label={urgencyOf(r.deadline).label} />
                            <Badge variant="neutral">{cat}</Badge>
                            {pendingIds.has(id) && <Badge variant="outline">Another allocation pending review</Badge>}
                            {amt > 0 && amt >= rk.remaining && (
                              <Badge variant="accent">
                                <Check /> Fully covers
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 font-medium">{r.purpose}</p>
                          <p className="text-xs text-muted-foreground">
                            {st ? anonId(st.id) : ""}, {st?.emirate} · due {fmtDate(r.deadline)} ({relDays(r.deadline)}) · {aed(rk.remaining)} remaining
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
                            <p className="mt-2 text-xs text-muted-foreground">Not included by this approach at this budget. You can add an amount manually.</p>
                          )}
                        </div>
                        <div>
                          <div className="relative">
                            <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">AED</span>
                            <Input
                              aria-label={`Allocation for ${r.ref}`}
                              className="ps-12 text-end font-medium tabular"
                              inputMode="decimal"
                              value={amt || ""}
                              placeholder="0"
                              onChange={(e) => setAmounts({ ...amounts, [id]: Math.min(Number(e.target.value.replace(/[^\d.]/g, "")) || 0, rk.remaining) })}
                            />
                          </div>
                          <button type="button" className="mt-1 text-xs font-medium text-primary hover:underline" onClick={() => setAmounts({ ...amounts, [id]: rk.remaining })}>
                            Cover fully ({aed(rk.remaining)})
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
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> You choose the plan; verifying institutions approve the final allocation and pay providers directly. Simulated — no real money moves.
                </p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {overBudget && <p className="text-xs font-medium text-destructive">Allocations ({aed(total)}) exceed the budget ({aed(budget)}).</p>}
                  <Button onClick={submit} disabled={overBudget || overBalance || total <= 0 || total > sponsor.balance}>
                    Submit {aed(total)} for review
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
