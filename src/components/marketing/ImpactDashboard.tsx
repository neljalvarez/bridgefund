"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Hydrated, useStore } from "@/lib/store";
import { publicImpact } from "@/lib/publicImpact";
import { fmtMultiplier } from "@/lib/impact";
import { EMIRATES, type Emirate } from "@/lib/uae";
import { OPP_LABEL, aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoBadge, StatCard } from "@/components/shared/kit";
import { ChartTooltip } from "@/components/shared/ChartTooltip";
import { MoreDetails } from "@/components/shared/Focus";

const axis = { fontSize: 12, stroke: "hsl(var(--muted-foreground))", tickLine: false, axisLine: false } as const;

/** Schematic (not to scale) placement of the seven emirates. */
const TILE: Record<Emirate, string> = {
  "Abu Dhabi": "col-start-1 col-span-3 row-start-2 row-span-3",
  Dubai: "col-start-4 row-start-3 row-span-2",
  Sharjah: "col-start-5 row-start-3 row-span-2",
  Ajman: "col-start-4 row-start-2",
  "Umm Al Quwain": "col-start-5 row-start-2",
  "Ras Al Khaimah": "col-start-6 row-start-1 row-span-2",
  Fujairah: "col-start-6 row-start-3 row-span-2",
};

function EmirateMap({ data, selected, onSelect }: { data: { emirate: Emirate; amount: number; resolved: number; requests: number }[]; selected: string; onSelect: (e: string) => void }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="grid h-72 grid-cols-6 grid-rows-4 gap-1.5" role="group" aria-label="Impact by emirate (schematic map)">
      {data.map((d) => {
        const on = selected === d.emirate;
        const level = d.amount / max;
        return (
          <button
            key={d.emirate}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(on ? "all" : d.emirate)}
            className={cn("flex min-w-0 flex-col justify-end rounded-lg border p-2 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", TILE[d.emirate], on ? "border-primary ring-1 ring-primary" : "hover:border-primary/50")}
            style={{ background: `hsl(var(--primary) / ${0.06 + level * 0.32})` }}
          >
            <span className="truncate text-[11px] font-medium leading-tight sm:text-xs">{d.emirate}</span>
            <span className="truncate text-xs font-semibold tabular sm:text-sm">{aed(d.amount)}</span>
            <span className="hidden truncate text-[11px] text-foreground/75 sm:block">
              {d.resolved}/{d.requests} resolved
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Dashboard() {
  const { state } = useStore();
  const [emirate, setEmirate] = useState("all");
  const [category, setCategory] = useState("all");
  const m = useMemo(() => publicImpact(state, { emirate, category }), [state, emirate, category]);
  const all = useMemo(() => publicImpact(state, { emirate: "all", category }), [state, category]);
  const funnel = [
    { name: "Barrier resolved", value: m.opportunitiesFunded },
    { name: "Took part", value: m.participated },
    { name: "Outcome confirmed", value: m.completedOutcome },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DemoBadge>Demonstration data — not real-world impact</DemoBadge>
        <div className="flex flex-wrap gap-2">
          <Select value={emirate} onValueChange={setEmirate}>
            <SelectTrigger className="w-[180px]" aria-label="Filter by emirate">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All emirates</SelectItem>
              {EMIRATES.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]" aria-label="Filter by opportunity type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(OPP_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Barriers resolved" value={m.barriersResolved} tone="primary" hint="Fully funded requests" />
        <StatCard label="Student expenses reduced" value={m.expensesReduced} hint="Waivers, discounts, borrowing" />
        <StatCard label="Sponsor funds conserved" value={m.sponsorConserved} hint="Covered before asking sponsors" />
        <StatCard label="Opportunities unlocked" value={m.opportunitiesFunded} money={false} hint={`of ${m.requests} requests`} />
        <StatCard label="Avg. processing time" value={m.avgDaysToResolve === null ? "—" : `${m.avgDaysToResolve} days`} hint="Submitted → fully funded" />
        <StatCard label="Impact multiplier" value={fmtMultiplier(m.multiplier)} tone="primary" hint="Resolved ÷ sponsor funds" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Impact by emirate</CardTitle>
            <CardDescription>Barriers resolved (AED). Tap an emirate to filter. Schematic, not to scale.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmirateMap data={all.byEmirate} selected={emirate} onSelect={setEmirate} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resolved, took part, completed</CardTitle>
            <CardDescription>Counted separately, as recorded by schools.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} {...axis} />
                <YAxis type="category" dataKey="name" width={120} {...axis} fontSize={11} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip money={false} />} />
                <Bar dataKey="value" name="Requests" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How each barrier was closed</CardTitle>
          <CardDescription>By opportunity type. Students&apos; own money excluded.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {m.byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No resolved barriers in this filter.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.byCategory} margin={{ left: -4 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" interval={0} {...axis} fontSize={11} />
                <YAxis {...axis} width={80} tickFormatter={(v) => aed(v)} />
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

      <MoreDetails title="How these numbers are calculated">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Students supported" value={m.studentsSupported} money={false} />
          <StatCard label="Sponsor contributions" value={m.sponsorAllocated} hint="Incl. requests still funding" />
          <StatCard label="Saved by fee reductions" value={m.waiverSavings} />
          <StatCard label="Saved by borrowing" value={m.borrowSavings} />
        </div>
        <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>Every figure is calculated live from the fictional application records in this browser — nothing is hard-coded. Barriers resolved = confirmed cost reductions + school assistance + sponsor money on fully funded requests, never the student&apos;s own savings. Sponsor funds conserved = reductions + school assistance. Processing time runs from submission to fully funded.</p>
          <p>BridgeFund has not run a pilot. Real results will appear on the pilot dashboard once they exist.</p>
        </div>
      </MoreDetails>
    </div>
  );
}

export function ImpactDashboard() {
  return (
    <Hydrated
      fallback={
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
      }
    >
      <Dashboard />
    </Hydrated>
  );
}
