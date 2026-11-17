"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { remainingOf } from "@/lib/actions";
import { inInstitutionScope, oppOf } from "@/lib/selectors";
import { EXPENSE_LABEL, OPP_LABEL, daysUntil, sum, usd } from "@/lib/format";
import { daysBetween } from "@/lib/allocation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoBadge, PageHeader, StatCard } from "@/components/shared/kit";
import { ChartTooltip } from "@/components/shared/ChartTooltip";

const PIE = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(166 57% 15%)", "hsl(215 16% 75%)"];
const axis = { fontSize: 12, stroke: "hsl(var(--muted-foreground))", tickLine: false, axisLine: false } as const;

function ChartCard({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-64">{children}</CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { state } = useStore();
  const [range, setRange] = useState("all");
  const [category, setCategory] = useState("all");

  const reqs = useMemo(
    () =>
      state.requests.filter((r) => {
        if (r.status === "Draft" || !inInstitutionScope(state, r)) return false;
        if (range !== "all" && daysBetween(r.createdAt, new Date()) > Number(range)) return false;
        if (category !== "all" && oppOf(state, r.opportunityId)?.category !== category) return false;
        return true;
      }),
    [state, range, category],
  );

  const barriers = Object.entries(reqs.flatMap((r) => r.expenses).reduce<Record<string, number>>((m, e) => ({ ...m, [e.category]: (m[e.category] ?? 0) + 1 }), {}))
    .map(([k, v]) => ({ name: EXPENSE_LABEL[k as keyof typeof EXPENSE_LABEL], value: v }))
    .sort((a, b) => b.value - a.value);
  const initial = reqs.map((r) => Math.max(r.totalCost - r.studentFunds, 0));
  const avgGap = initial.length ? sum(initial) / initial.length : 0;
  const avgAsk = reqs.length ? sum(reqs.map((r) => r.amount)) / reqs.length : 0;
  const reduced = sum(reqs.flatMap((r) => r.reductions.map((x) => x.amount)));
  const contrib = (src: string) => sum(state.contributions.filter((c) => c.source === src && reqs.some((r) => r.id === c.requestId)).map((c) => c.amount));
  const red = (k: string) => sum(reqs.flatMap((r) => r.reductions.filter((x) => x.kind === k).map((x) => x.amount)));
  const assistance = [
    { name: "Fee waivers", value: red("waiver") },
    { name: "Free alternatives", value: red("alternative") },
    { name: "Discounts", value: red("discount") },
    { name: "Borrowing", value: red("borrow") },
    { name: "Institutional", value: red("institutional") + contrib("institution") },
    { name: "Grants", value: red("grant") },
    { name: "Sponsors & pool", value: contrib("sponsor") + contrib("pool") },
  ].filter((x) => x.value > 0);
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const xs = reqs.filter((r) => !["Completed", "Rejected"].includes(r.status) && daysUntil(r.deadline) >= 0 && Math.floor(daysUntil(r.deadline) / 7) === i);
    return { name: i === 0 ? "This week" : `Week ${i + 1}`, value: sum(xs.map(remainingOf)) };
  });
  const remaining = ["Submitted", "Under Review", "Additional Information Required", "Verified", "Partially Funded", "Fully Funded"].map((s) => ({ name: s === "Additional Information Required" ? "Info required" : s, value: reqs.filter((r) => r.status === s).length }));
  const funded = Object.entries(OPP_LABEL)
    .map(([k, v]) => ({ name: v, value: reqs.filter((r) => oppOf(state, r.opportunityId)?.category === k && ["Fully Funded", "Completed"].includes(r.status)).length }))
    .filter((x) => x.value > 0);

  return (
    <>
      <PageHeader
        title="Financial barrier analytics"
        description="Aggregated patterns across verified requests, so institutions can plan for the barriers that recur. No individual student is identifiable here."
        actions={
          <>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[150px]" aria-label="Date range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[190px]" aria-label="Opportunity category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {Object.entries(OPP_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      <div className="mb-4">
        <DemoBadge>Aggregated demonstration data</DemoBadge>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Requests analysed" value={reqs.length} money={false} />
        <StatCard label="Average funding gap" value={avgGap} hint="Before BridgeEngine" />
        <StatCard label="Average sponsor ask" value={avgAsk} tone="primary" hint={avgGap ? `${Math.round((1 - avgAsk / avgGap) * 100)}% smaller` : undefined} />
        <StatCard label="Total expenses reduced" value={reduced} tone="primary" />
        <StatCard label="Opportunities funded" value={reqs.filter((r) => ["Fully Funded", "Completed"].includes(r.status)).length} money={false} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Most common financial barriers" description="Expense items by category">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barriers} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" allowDecimals={false} {...axis} />
              <YAxis type="category" dataKey="name" width={130} interval={0} {...axis} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip money={false} />} />
              <Bar dataKey="value" name="Items" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Assistance provided by category" description="How gaps were closed">
          <div className="flex h-full items-center gap-4">
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={assistance} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="90%" paddingAngle={2} stroke="none">
                  {assistance.map((_, i) => (
                    <Cell key={i} fill={PIE[i % PIE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="space-y-1.5 text-xs">
              {assistance.map((a, i) => (
                <li key={a.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE[i % PIE.length] }} />
                  <span className="text-muted-foreground">{a.name}</span>
                  <span className="ml-auto font-medium tabular">{usd(a.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
        <ChartCard title="Upcoming financial deadlines" description="Unresolved amount due by week">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeks}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" {...axis} />
              <YAxis {...axis} tickFormatter={(v) => `$${v}`} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip />} />
              <Bar dataKey="value" name="Remaining" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Remaining requests by stage">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={remaining}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" {...axis} interval={0} fontSize={11} />
              <YAxis allowDecimals={false} {...axis} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip money={false} />} />
              <Bar dataKey="value" name="Requests" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Opportunities successfully funded" description="By opportunity type" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funded}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" {...axis} />
              <YAxis allowDecimals={false} {...axis} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip money={false} />} />
              <Bar dataKey="value" name="Funded" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" /> Explanations, documents and household details never appear in analytics.
      </p>
    </>
  );
}
