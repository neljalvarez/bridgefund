"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowRight, CalendarClock, ClipboardCheck, Landmark, Package, ShieldCheck, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { remainingOf } from "@/lib/actions";
import { inInstitutionScope } from "@/lib/selectors";
import { PENDING_STATUSES, daysUntil, fmtDate, relDays, sum, usd } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader, StatCard } from "@/components/shared/kit";
import { ReviewCard } from "@/components/institution/ReviewCard";

function Dashboard() {
  const { state } = useStore();
  const params = useSearchParams();
  const focus = params.get("focus");
  const scoped = state.requests.filter((r) => inInstitutionScope(state, r));
  const queue = scoped.filter((r) => PENDING_STATUSES.includes(r.status)).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const approved = scoped.filter((r) => ["Verified", "Partially Funded", "Fully Funded"].includes(r.status)).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const completed = scoped.filter((r) => r.status === "Completed").sort((a, b) => b.deadline.localeCompare(a.deadline));
  const unresolved = scoped.filter((r) => !["Completed", "Rejected", "Draft"].includes(r.status));
  const focused = state.requests.find((r) => r.id === focus);
  const [tab, setTab] = useState(focused && !PENDING_STATUSES.includes(focused.status) ? "approved" : "queue");
  const funds = state.currentInstitutionId === "all" ? sum(state.institutions.map((i) => i.fund)) : state.institutions.find((i) => i.id === state.currentInstitutionId)?.fund ?? 0;
  const upcoming = unresolved.filter((r) => daysUntil(r.deadline) >= 0 && daysUntil(r.deadline) <= 21).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const history = state.distribution.filter((d) => state.currentInstitutionId === "all" || d.institutionId === state.currentInstitutionId);
  const resources = state.resources.filter((r) => state.currentInstitutionId === "all" || r.institutionId === state.currentInstitutionId);
  const instName = state.currentInstitutionId === "all" ? "Partner network" : state.institutions.find((i) => i.id === state.currentInstitutionId)?.name;

  return (
    <>
      <PageHeader eyebrow={instName} title="Verification & assistance" description="Review requests privately, confirm savings, assign waivers and equipment, and allocate funding. Every action updates the student and sponsor views instantly." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Pending requests" value={queue.length} money={false} icon={<ClipboardCheck />} />
        <StatCard label="Approved assistance" value={approved.length} money={false} icon={<ShieldCheck />} />
        <StatCard label="Institution funds" value={funds} icon={<Landmark />} hint="Simulated assistance budget" />
        <StatCard label="Shared opportunity pool" value={state.pool} icon={<Wallet />} hint="Sponsor contributions" />
        <StatCard label="Unresolved barriers" value={sum(unresolved.map(remainingOf))} tone="warning" hint={`${unresolved.length} open requests`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <Tabs value={tab} onValueChange={setTab} className="min-w-0">
          <TabsList className="h-auto max-w-full flex-wrap justify-start">
            <TabsTrigger value="queue">
              Verification queue <Badge variant="neutral">{queue.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved <Badge variant="neutral">{approved.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed <Badge variant="neutral">{completed.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="history">Distribution history</TabsTrigger>
          </TabsList>
          <TabsContent value="queue" className="space-y-3">
            {queue.length === 0 ? <EmptyState title="The verification queue is clear" description="New student requests appear here as soon as they're submitted." /> : queue.map((r, i) => <ReviewCard key={r.id} r={r} defaultOpen={i === 0 && !focus} highlight={focus === r.id} />)}
          </TabsContent>
          <TabsContent value="approved" className="space-y-3">
            {approved.length === 0 ? <EmptyState title="No approved requests in progress" /> : approved.map((r) => <ReviewCard key={r.id} r={r} highlight={focus === r.id} />)}
          </TabsContent>
          <TabsContent value="completed" className="space-y-3">
            {completed.length === 0 ? <EmptyState title="No completed assistance yet" /> : completed.map((r) => <ReviewCard key={r.id} r={r} highlight={focus === r.id} />)}
          </TabsContent>
          <TabsContent value="history">
            <Card>
              <ul className="divide-y">
                {history.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">No distribution recorded yet.</li>}
                {history.slice(0, 30).map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="min-w-0">
                      <Badge variant={d.kind === "completion" ? "success" : d.kind === "waiver" ? "accent" : "neutral"} className="mr-2 capitalize">
                        {d.kind}
                      </Badge>
                      {d.label}
                      {d.requestRef && <span className="text-muted-foreground"> · {d.requestRef}</span>}
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="font-medium tabular">{usd(d.amount)}</span>
                      <span className="block text-xs text-muted-foreground">{fmtDate(d.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" /> Upcoming deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nothing due in the next three weeks.</p>}
              {upcoming.slice(0, 6).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="block w-full text-left text-sm hover:underline"
                  onClick={() => {
                    setTab(PENDING_STATUSES.includes(r.status) ? "queue" : "approved");
                    setTimeout(() => document.getElementById(`req-${r.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
                  }}
                >
                  <span className="font-medium">{r.ref}</span> · {usd(remainingOf(r))} remaining
                  <span className="block text-xs text-muted-foreground">
                    {r.status} · {relDays(r.deadline)}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" /> Resource inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {resources.slice(0, 5).map((r) => (
                <div key={r.id} className="flex justify-between gap-2">
                  <span className="truncate text-muted-foreground">{r.name}</span>
                  <span className="tabular">
                    {r.available}/{r.total}
                  </span>
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                <Link href="/institution/resources">
                  Manage inventory <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">Institutions retain final approval authority. Sponsor allocations are paid to providers only after you confirm completion.</p>
        </aside>
      </div>
    </>
  );
}

export default function InstitutionPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
