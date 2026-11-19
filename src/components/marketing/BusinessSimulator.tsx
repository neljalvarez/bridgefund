"use client";

import { aedAxis } from "@/lib/format";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RotateCcw } from "lucide-react";
import { SCENARIOS, summary, type BizInput, type Scenario } from "@/lib/business";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DemoBadge } from "@/components/shared/kit";
import { MoreDetails } from "@/components/shared/Focus";
import { ChartTooltip } from "@/components/shared/ChartTooltip";

const DEFAULTS: BizInput = { clients: 10, price: 950, programs: 2, programFee: 1500, opex: 30000, requestsPerClient: 15, verificationCost: 9, cac: 3000, licences: 1, licenceFee: 2500 };

const FIELDS: { key: keyof BizInput; label: string; prefix?: string; help: string }[] = [
  { key: "clients", label: "School & university clients (start)", help: "Subscribed schools and universities" },
  { key: "price", label: "Subscription per school / month", prefix: "AED", help: "Hypothetical; a free tier would remain for under-resourced schools" },
  { key: "programs", label: "Sponsored programmes (start)", help: "Ring-fenced CSR or foundation programmes" },
  { key: "programFee", label: "Programme management fee / month", prefix: "AED", help: "Charged to the sponsor, never deducted from aid" },
  { key: "licences", label: "Institutional licences (start)", help: "Nonprofits or university offices running their own programmes" },
  { key: "licenceFee", label: "Licence fee / month", prefix: "AED", help: "Hypothetical" },
  { key: "opex", label: "Fixed operating expenses / month", prefix: "AED", help: "Team, hosting, support, compliance" },
  { key: "verificationCost", label: "Verification cost per request", prefix: "AED", help: "Document checks, storage, payment processing" },
  { key: "requestsPerClient", label: "Verified requests per institution / month", help: "Drives variable verification cost" },
  { key: "cac", label: "Acquisition cost per new institution", prefix: "AED", help: "Sales, onboarding and training" },
];

const fmt = (n: number) => `AED ${Math.round(n).toLocaleString("en-AE")}`;
const axis = { fontSize: 12, stroke: "hsl(var(--muted-foreground))", tickLine: false, axisLine: false } as const;

export function BusinessSimulator() {
  const [v, setV] = useState<BizInput>(DEFAULTS);
  const [scenario, setScenario] = useState<Scenario>("moderate");
  const all = useMemo(() => Object.fromEntries((Object.keys(SCENARIOS) as Scenario[]).map((s) => [s, summary(v, s)])) as Record<Scenario, ReturnType<typeof summary>>, [v]);
  const s = all[scenario];
  const growth = s.rows.map((r, i) => ({
    name: `M${r.month}`,
    Conservative: all.conservative.rows[i].revenue,
    Moderate: all.moderate.rows[i].revenue,
    Optimistic: all.optimistic.rows[i].revenue,
  }));
  const pnl = s.rows.map((r) => ({ name: `M${r.month}`, Revenue: r.revenue, Costs: r.costs, "Cumulative profit": r.cumulative }));
  const m24 = s.rows[s.rows.length - 1];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Assumptions</CardTitle>
            <CardDescription className="mt-1">All hypothetical, in AED</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setV(DEFAULTS)}>
            <RotateCcw /> Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-3.5">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label htmlFor={`biz-${f.key}`} className="text-sm font-medium">
                {f.label}
              </label>
              <div className="relative mt-1">
                {f.prefix && <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{f.prefix}</span>}
                <Input
                  id={`biz-${f.key}`}
                  inputMode="decimal"
                  className={cn("tabular", f.prefix && "ps-12")}
                  value={String(v[f.key] ?? 0)}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/[^\d.]/g, ""));
                    setV({ ...v, [f.key]: Number.isFinite(n) ? Math.min(n, 1_000_000) : 0 });
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{f.help}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DemoBadge>Hypothetical projection — not actual revenue</DemoBadge>
          <div role="radiogroup" aria-label="Growth scenario" className="inline-flex rounded-lg border bg-muted/50 p-1">
            {(Object.keys(SCENARIOS) as Scenario[]).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={scenario === k}
                onClick={() => setScenario(k)}
                className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", scenario === k ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                {SCENARIOS[k].label}
              </button>
            ))}
          </div>
        </div>
        <p className="-mt-3 text-xs text-muted-foreground">{SCENARIOS[scenario].description}. Sponsored programmes grow at half the institutional rate.</p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          {[
            { l: "Monthly recurring revenue", v: fmt(s.mrr), h: "Today's inputs" },
            { l: "Annual recurring revenue", v: fmt(s.arr), h: "MRR × 12" },
            { l: "Operating costs / month", v: fmt(s.costs), h: "Fixed + verification, before acquisition" },
            { l: "Profit or loss / month", v: fmt(s.profit), h: s.profit >= 0 ? "Operating surplus" : "Operating deficit", tone: s.profit >= 0 ? "text-primary" : "text-destructive" },
            { l: "Break-even point", v: s.breakEvenClients === null ? "Not reachable" : `${s.breakEvenClients} institutions`, h: s.breakEvenClients === null ? "Price must exceed verification cost per institution" : `Each adds ${fmt(s.contribution)}/month after verification cost` },
            { l: "Break-even month", v: s.breakEvenMonth ? `Month ${s.breakEvenMonth}` : "Beyond 24 months", h: `${SCENARIOS[scenario].label} scenario, incl. acquisition spend` },
          ].map((x) => (
            <Card key={x.l} className="p-4">
              <p className="text-[13px] font-medium text-muted-foreground">{x.l}</p>
              <p className={cn("mt-2 text-lg font-semibold tracking-tight tabular-nums sm:text-2xl", x.tone)}>{x.v}</p>
              <p className="mt-1 text-xs text-muted-foreground">{x.h}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue growth projections</CardTitle>
            <CardDescription>Monthly revenue over 24 months under each scenario</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth} margin={{ left: 0, right: 10 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" {...axis} interval={3} />
                <YAxis {...axis} width={72} tickFormatter={(x) => aedAxis(x)} />
                <Tooltip content={<ChartTooltip format={fmt} />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="Conservative" stroke="hsl(var(--chart-4))" strokeWidth={scenario === "conservative" ? 3 : 1.5} dot={false} />
                <Line dataKey="Moderate" stroke="hsl(var(--chart-1))" strokeWidth={scenario === "moderate" ? 3 : 1.5} dot={false} />
                <Line dataKey="Optimistic" stroke="hsl(var(--chart-2))" strokeWidth={scenario === "optimistic" ? 3 : 1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue, costs and cumulative profit · {SCENARIOS[scenario].label}</CardTitle>
            <CardDescription>
              Month 24: {Math.round(m24.clients)} institutions, {fmt(m24.revenue)} revenue, cumulative {m24.cumulative >= 0 ? "profit" : "loss"} {fmt(Math.abs(m24.cumulative))}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnl} margin={{ left: 0, right: 10 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" {...axis} interval={3} />
                <YAxis {...axis} width={72} tickFormatter={(x) => aedAxis(x)} />
                <Tooltip content={<ChartTooltip format={fmt} />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                <Area dataKey="Revenue" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.12} strokeWidth={2} />
                <Area dataKey="Costs" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.08} strokeWidth={2} />
                <Area dataKey="Cumulative profit" stroke="hsl(var(--chart-3))" fill="none" strokeDasharray="5 4" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <MoreDetails title="Model and limitations">
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>Revenue = clients × subscription + programmes × management fee + licences × licence fee. Costs = fixed operating expenses + institutions × requests × verification cost + new institutions × acquisition cost. Break-even institutions = (fixed costs − programme revenue) ÷ (subscription − verification cost per institution).</p>
            <p>Students are never charged — requesting assistance is free under every scenario. No figure here reflects real customers, contracts or revenue; pricing would be validated during the pilot.</p>
          </div>
        </MoreDetails>
      </div>
    </div>
  );
}
