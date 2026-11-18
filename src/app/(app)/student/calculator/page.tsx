"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Copy, Crown, Plus, Trash2 } from "lucide-react";
import type { CalculatorScenario, ExpenseCategory, OpportunityCategory } from "@/lib/types";
import { useStore } from "@/lib/store";
import { saveScenarios } from "@/lib/actions";
import { currentStudent } from "@/lib/selectors";
import { runBridgeEngine } from "@/lib/engine";
import { ALTERNATIVES, GRANTS, WAIVERS } from "@/lib/knowledge";
import { EXPENSE_LABEL, OPP_CATEGORIES, OPP_LABEL, uid, aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/kit";
import { ChartTooltip } from "@/components/shared/ChartTooltip";

const LINES: ExpenseCategory[] = ["registration", "examination", "equipment", "transportation", "accommodation", "food", "documentation", "other"];

export default function CalculatorPage() {
  const { state, dispatch } = useStore();
  const student = currentStudent(state);

  const fromJournal = (): CalculatorScenario[] =>
    state.opportunities
      .filter((o) => o.studentId === student.id)
      .slice(0, 3)
      .map((o) => ({
        id: uid("sc"),
        name: o.title,
        category: o.category,
        funds: o.studentFunds + o.priorAssistance,
        lines: o.expenses.reduce<CalculatorScenario["lines"]>((m, e) => {
          const k: ExpenseCategory = LINES.includes(e.category) ? e.category : "other";
          return { ...m, [k]: (m[k] ?? 0) + e.amount };
        }, {}),
      }));

  const [scenarios, setScenarios] = useState<CalculatorScenario[]>(() => (state.scenarios.length ? state.scenarios : fromJournal()));
  useEffect(() => {
    const t = setTimeout(() => dispatch(saveScenarios(scenarios)), 300);
    return () => clearTimeout(t);
  }, [scenarios, dispatch]);

  const update = (id: string, fn: (s: CalculatorScenario) => CalculatorScenario) => setScenarios((xs) => xs.map((s) => (s.id === id ? fn(s) : s)));

  const results = useMemo(
    () =>
      scenarios.map((s) => {
        const total = LINES.reduce((a, c) => a + (s.lines[c] ?? 0), 0);
        const plan = runBridgeEngine(
          {
            category: s.category,
            country: student.country,
            emirate: student.emirate,
            level: student.level,
            studentFunds: s.funds,
            priorAssistance: 0,
            eligibility: student.eligibility,
            expenses: LINES.filter((c) => (s.lines[c] ?? 0) > 0).map((c) => ({ id: c, label: EXPENSE_LABEL[c], category: c, amount: s.lines[c]!, confirmed: true })),
          },
          { waivers: WAIVERS, alternatives: ALTERNATIVES, grants: GRANTS, resources: state.resources },
        );
        const outOfPocket = Math.min(s.funds, total);
        return { id: s.id, name: s.name, total, assistance: plan.reductionsTotal, outOfPocket, gap: plan.sponsorAmount, affordability: total ? Math.round(((total - plan.sponsorAmount) / total) * 100) : 100 };
      }),
    [scenarios, student, state.resources],
  );
  const best = scenarios.length > 1 ? [...results].filter((r) => r.total > 0).sort((a, b) => a.gap - b.gap || b.affordability - a.affordability)[0] : undefined;

  return (
    <>
      <PageHeader
        title="Opportunity cost calculator"
        description="Compare the real cost of opportunities side by side."
        actions={
          <>
            <Button variant="outline" onClick={() => setScenarios(fromJournal())}>
              <Copy /> Load my opportunities
            </Button>
            <Button disabled={scenarios.length >= 3} onClick={() => setScenarios([...scenarios, { id: uid("sc"), name: `Opportunity ${scenarios.length + 1}`, category: "stem-competition", funds: 0, lines: {} }])}>
              <Plus /> Add opportunity
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {scenarios.map((s) => {
          const r = results.find((x) => x.id === s.id)!;
          const isBest = best?.id === s.id;
          return (
            <Card key={s.id} className={cn(isBest && "ring-2 ring-primary/40")}>
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {isBest ? (
                    <Badge variant="accent">
                      <Crown /> Most affordable
                    </Badge>
                  ) : (
                    <span />
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Remove ${s.name}`} onClick={() => setScenarios(scenarios.filter((x) => x.id !== s.id))}>
                    <Trash2 />
                  </Button>
                </div>
                <Input aria-label="Opportunity name" className="font-medium" value={s.name} onChange={(e) => update(s.id, (x) => ({ ...x, name: e.target.value }))} />
                <Select value={s.category} onValueChange={(v) => update(s.id, (x) => ({ ...x, category: v as OpportunityCategory }))}>
                  <SelectTrigger aria-label="Opportunity type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPP_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {OPP_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {LINES.map((c) => (
                  <label key={c} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{EXPENSE_LABEL[c]}</span>
                    <span className="relative w-28">
                      <span className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">AED</span>
                      <Input
                        aria-label={`${EXPENSE_LABEL[c]} for ${s.name}`}
                        inputMode="decimal"
                        className="h-8 ps-10 text-end tabular"
                        value={s.lines[c] || ""}
                        placeholder="0"
                        onChange={(e) => update(s.id, (x) => ({ ...x, lines: { ...x.lines, [c]: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 } }))}
                      />
                    </span>
                  </label>
                ))}
                <label className="flex items-center justify-between gap-3 border-t pt-3 text-sm font-medium">
                  Your available funds
                  <span className="relative w-28">
                    <span className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">AED</span>
                    <Input aria-label={`Available funds for ${s.name}`} inputMode="decimal" className="h-8 ps-10 text-end tabular" value={s.funds || ""} placeholder="0" onChange={(e) => update(s.id, (x) => ({ ...x, funds: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 }))} />
                  </span>
                </label>
                <dl className="mt-3 space-y-1.5 rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex justify-between">
                    <dt>Total cost</dt>
                    <dd className="font-semibold tabular">{aed(r.total)}</dd>
                  </div>
                  <div className="flex justify-between text-primary">
                    <dt>Available assistance (est.)</dt>
                    <dd className="tabular">−{aed(r.assistance)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Out-of-pocket</dt>
                    <dd className="tabular">{aed(r.outOfPocket)}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 font-semibold">
                    <dt>Remaining funding gap</dt>
                    <dd className="tabular">{aed(r.gap)}</dd>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <dt>Affordability</dt>
                    <dd>{r.affordability}% covered without sponsors</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Affordability comparison</CardTitle>
            <CardDescription>How each opportunity's cost is covered</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} fontSize={12} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={170} fontSize={12} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(v: string) => (v.length > 26 ? `${v.slice(0, 25)}…` : v)} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="outOfPocket" name="Out-of-pocket" stackId="a" fill="hsl(var(--chart-4))" />
                <Bar dataKey="assistance" name="Assistance found" stackId="a" fill="hsl(var(--chart-1))" />
                <Bar dataKey="gap" name="Remaining gap" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      <p className="mt-4 text-xs text-muted-foreground">Assistance figures are estimates from the demonstration knowledge base. Confirm costs and eligibility with each provider.</p>
    </>
  );
}
