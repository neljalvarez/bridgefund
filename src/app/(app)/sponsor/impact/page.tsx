"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore } from "@/lib/store";
import { currentSponsor } from "@/lib/actions";
import { oppOf } from "@/lib/selectors";
import { OPP_LABEL, sum, aed, aedAxis } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/shared/kit";
import { ChartTooltip, CHART_COLORS as COLORS } from "@/components/shared/ChartTooltip";
import { fmtMultiplier, portfolioImpact } from "@/lib/impact";

export default function SponsorImpactPage() {
  const { state } = useStore();
  const sponsor = currentSponsor(state);
  const mine = state.contributions.filter((c) => c.sponsorId === sponsor.id);
  const toNeeds = mine.filter((c) => c.requestId);
  const reqs = [...new Set(toNeeds.map((c) => c.requestId!))].map((id) => state.requests.find((r) => r.id === id)!).filter(Boolean);
  const pending = sum(toNeeds.filter((c) => state.requests.find((r) => r.id === c.requestId)?.status !== "Completed").map((c) => c.amount));
  const impact = portfolioImpact(reqs, state.contributions);
  const held = sum(state.pledges.filter((p) => p.sponsorId === sponsor.id && p.status === "Pending review").map((p) => p.amount));

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    toNeeds.forEach((c) => {
      const r = state.requests.find((x) => x.id === c.requestId);
      const cat = r ? OPP_LABEL[oppOf(state, r.opportunityId)?.category ?? "workshop"] : "Other";
      m.set(cat, (m.get(cat) ?? 0) + c.amount);
    });
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [toNeeds, state]);

  const statusData = [
    { name: "Completed", value: sum(toNeeds.filter((c) => state.requests.find((r) => r.id === c.requestId)?.status === "Completed").map((c) => c.amount)), color: COLORS[0] },
    { name: "Awaiting payment", value: pending, color: COLORS[1] },
    { name: "Shared pool", value: sum(mine.filter((c) => !c.requestId).map((c) => c.amount)), color: COLORS[3] },
  ].filter((x) => x.value > 0);

  return (
    <>
      <PageHeader title="My impact" description={`What ${sponsor.name}'s contributions resolved.`} />
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Impact multiplier</p>
            <p className="text-3xl font-semibold tabular text-primary">{fmtMultiplier(impact.multiplier)}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {impact.count > 0 ? (
              <>
                Across the {impact.count} fully-funded request{impact.count === 1 ? "" : "s"} you supported, BridgeFund resolved <strong className="text-foreground">{aed(impact.resolved)}</strong> of financial barriers using <strong className="text-foreground">{aed(impact.sponsor)}</strong> of sponsor money ({aed(impact.reductions)} from confirmed waivers, discounts and borrowed resources{impact.institutional > 0 ? `, ${aed(impact.institutional)} institutional` : ""}). Students&apos; own funds are excluded.
              </>
            ) : (
              "Appears once a request you supported is fully funded. Multiplier = barriers resolved ÷ sponsor funding used; students' own funds are excluded."
            )}
          </p>
          {held > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link href="/sponsor/allocate">{aed(held)} awaiting institutional review</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Impact by educational category</CardTitle>
            <CardDescription>Where your contributions went</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {byCategory.length === 0 ? (
              <EmptyState title="No impact yet" description="Your first contribution will appear here." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} margin={{ left: -10 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" width={72} tickFormatter={(v) => aedAxis(v)} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="hsl(var(--chart-1))" maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contribution status</CardTitle>
            <CardDescription>Completed vs. awaiting provider payment</CardDescription>
          </CardHeader>
          <CardContent className="flex h-64 items-center gap-4">
            {mine.length === 0 ? (
              <EmptyState title="Nothing yet" />
            ) : (
              <>
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="90%" paddingAngle={statusData.length > 1 ? 2 : 0} stroke="none">
                      {statusData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="space-y-2 text-sm">
                  {statusData.map((d) => (
                    <li key={d.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} /> {d.name} <span className="font-medium tabular">{aed(d.value)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

    </>
  );
}
