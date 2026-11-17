"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Clock, GraduationCap, HandCoins, PieChart as PieIcon, Receipt, Store, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { contributeToPool, currentSponsor, setSponsor } from "@/lib/actions";
import { oppOf } from "@/lib/selectors";
import { OPP_LABEL, fmtDate, sum, usd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader, StatCard, StatusBadge } from "@/components/shared/kit";
import { ChartTooltip, CHART_COLORS as COLORS } from "@/components/shared/ChartTooltip";
import { fmtMultiplier, portfolioImpact } from "@/lib/impact";

export default function SponsorDashboard() {
  const { state, dispatch } = useStore();
  const sponsor = currentSponsor(state);
  const [filter, setFilter] = useState("all");
  const [poolAmt, setPoolAmt] = useState("50");
  const mine = state.contributions.filter((c) => c.sponsorId === sponsor.id);
  const toNeeds = mine.filter((c) => c.requestId);
  const reqs = [...new Set(toNeeds.map((c) => c.requestId!))].map((id) => state.requests.find((r) => r.id === id)!).filter(Boolean);
  const completed = reqs.filter((r) => r.status === "Completed");
  const pending = sum(toNeeds.filter((c) => state.requests.find((r) => r.id === c.requestId)?.status !== "Completed").map((c) => c.amount));
  const students = new Set(reqs.map((r) => r.studentId)).size;
  const impact = portfolioImpact(reqs, state.contributions);
  const held = sum(state.pledges.filter((p) => p.sponsorId === sponsor.id && p.status === "Pending review").map((p) => p.amount));

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    toNeeds.forEach((c) => {
      const r = state.requests.find((x) => x.id === c.requestId);
      const cat = r ? OPP_LABEL[oppOf(state, r.opportunityId)?.category ?? "course"] : "Other";
      m.set(cat, (m.get(cat) ?? 0) + c.amount);
    });
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [toNeeds, state]);

  const rows = mine.filter((c) => {
    if (filter === "all") return true;
    const r = state.requests.find((x) => x.id === c.requestId);
    if (filter === "pool") return !c.requestId;
    if (filter === "completed") return r?.status === "Completed";
    return r && r.status !== "Completed";
  });

  const statusData = [
    { name: "Completed", value: sum(toNeeds.filter((c) => state.requests.find((r) => r.id === c.requestId)?.status === "Completed").map((c) => c.amount)), color: COLORS[0] },
    { name: "Awaiting payment", value: pending, color: COLORS[1] },
    { name: "Shared pool", value: sum(mine.filter((c) => !c.requestId).map((c) => c.amount)), color: COLORS[3] },
  ].filter((x) => x.value > 0);
  const poolV = Number(poolAmt);
  const poolErr = !(poolV > 0) || poolV > sponsor.balance;

  return (
    <>
      <PageHeader
        eyebrow="Sponsor dashboard"
        title={sponsor.name}
        description="Every contribution is tied to a specific verified expense, with a receipt once it's paid to the provider."
        actions={
          <>
            <Select value={sponsor.id} onValueChange={(v) => dispatch(setSponsor(v), { info: `Switched to ${state.sponsors.find((s) => s.id === v)?.name}` })}>
              <SelectTrigger className="w-[240px]" aria-label="Sponsor account">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.sponsors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · {usd(s.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button asChild>
              <Link href="/sponsor/marketplace">
                <Store /> Browse verified needs
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Available balance" value={sponsor.balance} tone="primary" hint={`of ${usd(sponsor.startingBalance)} simulated`} icon={<HandCoins />} />
        <StatCard label="Total contributions" value={sum(mine.map((c) => c.amount))} />
        <StatCard label="Expenses covered" value={reqs.length} money={false} icon={<GraduationCap />} />
        <StatCard label="Students supported" value={students} money={false} icon={<Users />} />
        <StatCard label="Completed requests" value={completed.length} money={false} icon={<CheckCircle2 />} />
        <StatCard label="Pending contributions" value={pending} icon={<Clock />} hint="Awaiting provider payment" />
      </div>

      <Card className="mt-6">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Impact multiplier</p>
            <p className="text-3xl font-semibold tabular text-primary">{fmtMultiplier(impact.multiplier)}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {impact.count > 0 ? (
              <>
                Across the {impact.count} fully-funded request{impact.count === 1 ? "" : "s"} you supported, BridgeFund resolved <strong className="text-foreground">{usd(impact.resolved)}</strong> of financial barriers using <strong className="text-foreground">{usd(impact.sponsor)}</strong> of sponsor money ({usd(impact.reductions)} from confirmed waivers, discounts and borrowed resources{impact.institutional > 0 ? `, ${usd(impact.institutional)} institutional` : ""}). Students&apos; own funds are excluded.
              </>
            ) : (
              "Appears once a request you supported is fully funded. Multiplier = barriers resolved ÷ sponsor funding used; students' own funds are excluded."
            )}
          </p>
          {held > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link href="/sponsor/allocate">{usd(held)} awaiting institutional review</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
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
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
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
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="90%" paddingAngle={2} stroke="none">
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
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} /> {d.name} <span className="font-medium tabular">{usd(d.value)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Contribution history</CardTitle>
              <CardDescription className="mt-1">Download an impact receipt for any contribution</CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[170px]" aria-label="Filter contributions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All contributions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pool">Shared pool</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="p-5">
                <EmptyState title="No contributions in this view" action={<Button asChild variant="outline"><Link href="/sponsor/marketplace">Find a need to support</Link></Button>} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Date</TableHead>
                    <TableHead>Need</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => {
                    const r = state.requests.find((x) => x.id === c.requestId);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="pl-5 text-muted-foreground">{fmtDate(c.at)}</TableCell>
                        <TableCell className="max-w-[240px] truncate">{r ? `${r.ref} · ${r.purpose}` : "Shared opportunity pool"}</TableCell>
                        <TableCell className="text-right font-medium tabular">{usd(c.amount)}</TableCell>
                        <TableCell>{r ? <StatusBadge status={r.status} /> : <span className="text-xs text-muted-foreground">Pooled</span>}</TableCell>
                        <TableCell className="pr-5 text-right">
                          {r && (
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/receipt/${c.id}`}>
                                <Receipt /> View
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-muted-foreground" /> Smart allocation
              </CardTitle>
              <CardDescription>Spread a budget across urgent verified needs with transparent reasoning.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/sponsor/allocate">Plan an allocation</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Shared opportunity pool</CardTitle>
              <CardDescription>Institutions allocate pooled funds to their most urgent verified needs. Pool balance {usd(state.pool)}.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!poolErr) dispatch(contributeToPool(poolV), { success: `${usd(poolV)} added to the shared pool` });
                }}
              >
                <Input aria-label="Pool contribution" className="tabular" inputMode="decimal" value={poolAmt} onChange={(e) => setPoolAmt(e.target.value.replace(/[^\d.]/g, ""))} />
                <Button type="submit" variant="outline" disabled={poolErr}>
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
