"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RotateCcw } from "lucide-react";
import { simulate, type SimInput } from "@/lib/simulator";
import { usd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { DemoBadge } from "@/components/shared/kit";
import { ChartTooltip } from "@/components/shared/ChartTooltip";
import { fmtMultiplier } from "@/lib/impact";

const DEFAULTS: SimInput = { cost: 180, studentFunds: 70, waivers: 50, borrowing: 0, institutional: 0, sponsorBudget: 500, crowdFee: 0.05 };

const FIELDS: { key: keyof SimInput; label: string; max: number; step: number; help: string; pct?: boolean }[] = [
  { key: "cost", label: "Educational opportunity cost", max: 1500, step: 5, help: "Exam fee, materials, travel — the full cost of taking part." },
  { key: "studentFunds", label: "Student's available funds", max: 1000, step: 5, help: "What the student can already contribute. Never counted as platform impact." },
  { key: "waivers", label: "Available fee waivers", max: 500, step: 5, help: "Fee waivers, discounts and free alternatives the student qualifies for." },
  { key: "borrowing", label: "Equipment borrowing savings", max: 500, step: 5, help: "Items borrowed from a lending programme instead of bought." },
  { key: "institutional", label: "Institutional assistance", max: 500, step: 5, help: "Existing hardship funds or grants applied after reductions." },
  { key: "sponsorBudget", label: "Sponsor funding budget", max: 5000, step: 50, help: "A sponsor's total budget, used to estimate how many opportunities it could rescue." },
  { key: "crowdFee", label: "Crowdfunding fee assumption", max: 0.1, step: 0.005, pct: true, help: "Deducted from donations. A 2.9% + $0.30 processing fee is ~4.4% of a $20 gift; some platforms add a platform fee. Varies by platform and country." },
];

const axis = { fontSize: 12, stroke: "hsl(var(--muted-foreground))", tickLine: false, axisLine: false } as const;

export function RescueSimulator() {
  const [v, setV] = useState<SimInput>(DEFAULTS);
  const r = useMemo(() => simulate(v), [v]);
  const fmtCount = (n: number) => (Number.isFinite(n) ? n.toLocaleString() : "Unlimited");

  const composition = [
    { name: "A · Crowdfunding", "Student funds": Math.min(v.studentFunds, v.cost), "Donor money (net)": r.shortfall, "Fees on donations": Math.round((r.crowdDonorsNeeded - r.shortfall) * 100) / 100 },
    { name: "B · BridgeFund", "Student funds": Math.min(v.studentFunds, v.cost), "Cost reductions": r.reductions, "Institutional assistance": r.institutional, "Sponsor money": r.bridgeSponsorNeeded },
  ];
  const curve = useMemo(() => {
    const max = Math.max(v.sponsorBudget, 100);
    return Array.from({ length: 5 }, (_, i) => {
      const b = Math.round((max * (i + 1)) / 5);
      const s = simulate({ ...v, sponsorBudget: b });
      return { name: usd(b), Crowdfunding: Number.isFinite(s.opportunitiesA) ? s.opportunitiesA : null, BridgeFund: Number.isFinite(s.opportunitiesB) ? s.opportunitiesB : null };
    });
  }, [v]);

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Assumptions</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setV(DEFAULTS)}>
            <RotateCcw /> Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={`sim-${f.key}`} className="text-sm font-medium">
                  {f.label}
                </label>
                <span className="text-sm font-semibold tabular">{f.pct ? `${(v[f.key] * 100).toFixed(1)}%` : usd(v[f.key])}</span>
              </div>
              <Slider id={`sim-${f.key}`} aria-label={f.label} className="mt-2.5" min={0} max={f.max} step={f.step} value={[v[f.key]]} onValueChange={([x]) => setV({ ...v, [f.key]: x })} />
              <p className="mt-1.5 text-xs text-muted-foreground">{f.help}</p>
            </div>
          ))}
          <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">Starting values reproduce the demo case: a $180 certification exam, $70 of student savings, and a $50 fee waiver.</p>
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-6">
        <DemoBadge>Simulation estimates — not real outcomes</DemoBadge>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Scenario A · Traditional crowdfunding</p>
            <p className="mt-2 text-3xl font-semibold tabular">{usd(r.crowdDonorsNeeded)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              donor money to raise for the full {usd(r.shortfall)} gap{v.crowdFee > 0 && `, including ~${usd(r.crowdDonorsNeeded - r.shortfall)} in assumed fees`}.
            </p>
          </Card>
          <Card className="border-primary/40 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Scenario B · BridgeFund</p>
            <p className="mt-2 text-3xl font-semibold tabular text-primary">{usd(r.bridgeSponsorNeeded)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              sponsor money after {usd(r.reductions)} in cost reductions{r.institutional > 0 && ` and ${usd(r.institutional)} institutional assistance`}.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {[
            { l: "Money saved", v: usd(r.moneySaved), h: "Cost removed rather than fundraised" },
            { l: "Sponsor funds conserved", v: usd(r.sponsorConserved), h: "Per opportunity, A − B" },
            { l: "Opportunities rescued", v: `${fmtCount(r.opportunitiesB)} vs ${fmtCount(r.opportunitiesA)}`, h: `With a ${usd(v.sponsorBudget)} budget (B vs A)` },
            { l: "Impact multiplier", v: fmtMultiplier(r.multiplier), h: r.multiplier ? "Barriers resolved ÷ sponsor money" : "No sponsor money needed" },
          ].map((s) => (
            <Card key={s.l} className="p-4">
              <p className="text-[13px] font-medium text-muted-foreground">{s.l}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular">{s.v}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.h}</p>
            </Card>
          ))}
        </div>
        {Number.isFinite(r.extraOpportunities) && r.extraOpportunities > 0 && (
          <p className="rounded-lg border-l-2 border-primary bg-primary-light/60 px-4 py-3 text-sm dark:bg-primary/10">
            The same {usd(v.sponsorBudget)} budget could support an estimated <strong>{r.extraOpportunities} more</strong> opportunit{r.extraOpportunities === 1 ? "y" : "ies"} like this one when costs are reduced before fundraising — assuming similar students qualify for similar reductions.
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How the cost is covered</CardTitle>
            <CardDescription>Same opportunity, two approaches</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={composition} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" {...axis} tickFormatter={(x) => usd(x)} />
                <YAxis type="category" dataKey="name" width={120} {...axis} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Student funds" stackId="a" fill="hsl(215 16% 75%)" maxBarSize={40} />
                <Bar dataKey="Cost reductions" stackId="a" fill="hsl(var(--chart-2))" maxBarSize={40} />
                <Bar dataKey="Institutional assistance" stackId="a" fill="hsl(var(--chart-3))" maxBarSize={40} />
                <Bar dataKey="Sponsor money" stackId="a" fill="hsl(var(--chart-1))" maxBarSize={40} />
                <Bar dataKey="Donor money (net)" stackId="a" fill="hsl(var(--chart-4))" maxBarSize={40} />
                <Bar dataKey="Fees on donations" stackId="a" fill="hsl(var(--destructive))" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opportunities a sponsor budget could rescue</CardTitle>
            <CardDescription>Whole opportunities of this size at five budget levels up to yours</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={curve} margin={{ left: -10, right: 10 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip money={false} />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Crowdfunding" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="BridgeFund" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="space-y-2 p-5 text-xs leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Method and limitations</p>
            <p>Scenario A assumes donors cover the entire shortfall (cost − student funds), with the fee assumption deducted from donations. Scenario B applies reductions first (capped at the shortfall), then institutional assistance, and asks sponsors only for the remainder. BridgeFund&apos;s own fees are charged to institutions and programmes, so none are deducted from sponsor money here.</p>
            <p>Crowdfunding campaigns may not reach their target, and waivers or assistance are not available to every student — this simulator does not model success rates. All figures are illustrative estimates, not predictions or real-world results.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
