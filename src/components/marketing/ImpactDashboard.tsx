"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Hydrated, useStore } from "@/lib/store";
import { ALL_COUNTRIES, publicImpact } from "@/lib/publicImpact";
import { fmtMultiplier } from "@/lib/impact";
import { OPP_LABEL, usd } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DemoBadge, StatCard } from "@/components/shared/kit";
import { ChartTooltip } from "@/components/shared/ChartTooltip";

const axis = { fontSize: 12, stroke: "hsl(var(--muted-foreground))", tickLine: false, axisLine: false } as const;

function Dashboard() {
  const { state } = useStore();
  const [country, setCountry] = useState("all");
  const [category, setCategory] = useState("all");
  const m = useMemo(() => publicImpact(state, { country, category }), [state, country, category]);
  const funnel = [
    { name: "Financial barrier resolved", value: m.opportunitiesFunded },
    { name: "Participation recorded", value: m.participated },
    { name: "Outcome confirmed", value: m.completedOutcome },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DemoBadge>Demonstration data — not real-world impact</DemoBadge>
        <div className="flex flex-wrap gap-2">
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-[170px]" aria-label="Filter by country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {ALL_COUNTRIES(state).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]" aria-label="Filter by opportunity category">
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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Students supported" value={m.studentsSupported} money={false} />
        <StatCard label="Opportunities funded" value={m.opportunitiesFunded} money={false} hint={`of ${m.requests} requests submitted`} />
        <StatCard label="Financial barriers resolved" value={m.barriersResolved} tone="primary" />
        <StatCard label="Sponsor contributions allocated" value={m.sponsorAllocated} hint="Includes requests still being funded" />
        <StatCard label="Impact multiplier" value={fmtMultiplier(m.multiplier)} tone="primary" hint="Fully-funded requests: barriers resolved ÷ sponsor funds used" />
        <StatCard label="Saved through fee waivers" value={m.waiverSavings} hint="Waivers, discounts, free alternatives" />
        <StatCard label="Saved through borrowing" value={m.borrowSavings} hint="Equipment lent, not bought" />
        <StatCard label="Average gap reduction" value={m.avgGapReduction === null ? "—" : `${m.avgGapReduction}%`} hint="Share of shortfall removed by reductions" />
        <StatCard label="Average time to resolve" value={m.avgDaysToResolve === null ? "—" : `${m.avgDaysToResolve} days`} hint="Request submitted → fully funded" />
        <StatCard label="Outcomes not yet recorded" value={m.notRecorded} money={false} tone="muted" hint="Resolved, awaiting institution update" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Assistance by category</CardTitle>
            <CardDescription>How resolved barriers were closed, by opportunity type. Student funds excluded.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {m.byCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resolved barriers in this filter.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={m.byCategory} margin={{ left: -4 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" interval={0} {...axis} fontSize={11} />
                  <YAxis {...axis} width={64} tickFormatter={(v) => usd(v)} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Reductions" stackId="a" fill="hsl(var(--chart-2))" maxBarSize={44} />
                  <Bar dataKey="Institutional" stackId="a" fill="hsl(var(--chart-3))" maxBarSize={44} />
                  <Bar dataKey="Sponsors" stackId="a" fill="hsl(var(--chart-1))" maxBarSize={44} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Barriers, participation and outcomes</CardTitle>
            <CardDescription>Resolving a cost is not the same as a student taking part. Each stage is recorded separately by the institution.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} {...axis} />
                <YAxis type="category" dataKey="name" width={150} {...axis} fontSize={11} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip money={false} />} />
                <Bar dataKey="value" name="Requests" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Geographic breakdown</CardTitle>
          <CardDescription>Fictional institutions across demonstration countries</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Country</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Resolved</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="pr-5 text-right">Barriers resolved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {m.byCountry.map((c) => (
                <TableRow key={c.country}>
                  <TableCell className="pl-5 font-medium">{c.country}</TableCell>
                  <TableCell className="text-right tabular">{c.requests}</TableCell>
                  <TableCell className="text-right tabular">{c.resolved}</TableCell>
                  <TableCell className="text-right tabular">{c.students}</TableCell>
                  <TableCell className="pr-5 text-right tabular">{usd(c.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="space-y-1.5 p-5 text-xs leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">How these numbers are calculated</p>
          <p>Every figure is computed live from the fictional demonstration data stored in this browser, so it changes as you use the demo. “Barriers resolved” counts confirmed cost reductions, institutional assistance and sponsor money on fully-funded requests — never the student&apos;s own savings. Average time to resolve runs from submission to the request becoming fully funded. Participation and outcomes count only what an institution has recorded.</p>
          <p>BridgeFund has not yet run a pilot. Real results will be published on the pilot dashboard once they exist.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ImpactDashboard() {
  return (
    <Hydrated
      fallback={
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
      }
    >
      <Dashboard />
    </Hydrated>
  );
}
