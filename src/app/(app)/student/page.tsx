"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertCircle, ArrowRight, CalendarClock, CheckCircle2, Clock, Package, ScanSearch, Sparkles, Target, Ticket, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { currentStudent, institutionOf, studentOverview } from "@/lib/selectors";
import { planFor } from "@/lib/plan";
import { planFindings } from "@/lib/engine";
import { fmtDate, fmtDateTime, relDays, timeAgo, usd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PageHeader, StatCard, StatusBadge } from "@/components/shared/kit";
import { GapBreakdown } from "@/components/shared/GapBreakdown";
import { OpportunityCard } from "@/components/student/OpportunityCard";

export default function StudentDashboard() {
  const { state } = useStore();
  const student = currentStudent(state);
  const inst = institutionOf(state, student.institutionId);
  const ov = studentOverview(state);
  const ordered = [...ov.all].sort((a, b) => Number(a.secured) - Number(b.secured) || a.opp.deadline.localeCompare(b.opp.deadline));
  const [selId, setSelId] = useState<string | null>(null);
  const sel = ordered.find((p) => p.opp.id === selId) ?? ordered.find((p) => p.request && !p.secured) ?? ordered[0];
  const justFunded = ov.all.find((p) => p.request?.status === "Fully Funded");

  const actions = useMemo(() => {
    const list: { icon: typeof Sparkles; text: string; href: string; cta: string }[] = [];
    ov.requests.filter((r) => r.status === "Additional Information Required").forEach((r) => list.push({ icon: AlertCircle, text: `${r.ref}: your institution needs more information`, href: "/student/requests", cta: "Respond" }));
    ov.active.filter((p) => !p.request).forEach((p) => {
      const plan = planFor(state, p.opp);
      list.push({ icon: Sparkles, text: `Run BridgeEngine on ${p.opp.title} — up to ${usd(plan.reductionsTotal)} in savings found`, href: `/student/engine?opp=${p.opp.id}`, cta: "Resolve" });
    });
    ov.requests.filter((r) => r.status === "Draft").forEach((r) => list.push({ icon: Clock, text: `${r.ref} is still a draft`, href: "/student/requests", cta: "Submit" }));
    const borrow = ov.active.filter((p) => !p.request).flatMap((p) => planFindings(planFor(state, p.opp)).filter((f) => f.kind === "borrow"));
    borrow.slice(0, 1).forEach((f) => list.push({ icon: Package, text: `${f.title.replace("Borrow: ", "")} is available to borrow`, href: `/student/resources?r=${f.sourceId}`, cta: "Reserve" }));
    if (!state.savedWaivers.length) list.push({ icon: Ticket, text: "Check which fee waivers you may qualify for", href: "/student/waivers", cta: "Check" });
    return list.slice(0, 5);
  }, [ov, state]);

  const deadlines = ov.active.map((p) => ({ id: p.opp.id, label: p.opp.title, date: p.opp.deadline })).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const timeline = ov.requests.flatMap((r) => r.history.map((h) => ({ ...h, ref: r.ref }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
  const activity = state.activity.filter((a) => a.role === "student").slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow={inst?.name}
        title={`Welcome back, ${student.firstName}`}
        description={`Goal: ${student.goal}. Here's where every opportunity stands.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/student/scanner">
                <ScanSearch /> Scan a barrier
              </Link>
            </Button>
            <Button asChild>
              <Link href="/student/engine">
                <Sparkles /> Run BridgeEngine
              </Link>
            </Button>
          </>
        }
      />

      {justFunded && (
        <Card className="mb-6 border-primary/30 bg-primary-light/50">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2.5 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              <span>
                <strong>Your opportunity is now fully funded.</strong> {justFunded.opp.title} — remaining gap {usd(justFunded.remaining)}.
              </span>
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/student/requests">View breakdown</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active opportunities" value={ov.active.length} money={false} icon={<Target />} />
        <StatCard label="Total required" value={ov.total} icon={<Wallet />} />
        <StatCard label="Available funds" value={ov.personal} />
        <StatCard label="Remaining gap" value={ov.remaining} tone={ov.remaining > 0 ? "warning" : "primary"} />
        <StatCard label="Potential savings" value={ov.savings} tone="primary" hint={`${usd(ov.confirmedSavings)} confirmed`} />
        <StatCard label="Assistance received" value={ov.assistance} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {sel && (
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>{sel.opp.title}</CardTitle>
                  <CardDescription className="mt-1">How each source contributes to resolving this expense</CardDescription>
                </div>
                {sel.request && <StatusBadge status={sel.request.status} />}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-muted-foreground">Remaining financial gap</p>
                    <p className="text-3xl font-semibold tracking-tight tabular">{usd(sel.remaining)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {usd(sel.covered)} of {usd(sel.total)} covered · due {fmtDate(sel.opp.deadline)}
                  </p>
                </div>
                <GapBreakdown b={sel} className="mt-4" height="h-3.5" />
                {sel.estimatedSavings > 0 && <p className="mt-3 text-xs text-muted-foreground">Striped savings are estimates from BridgeEngine. They become confirmed once your institution verifies them.</p>}
              </CardContent>
            </Card>
          )}

          <section aria-labelledby="opps">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="opps" className="text-base font-semibold">
                Your opportunities
              </h2>
              <Link href="/student/tracker" className="text-sm font-medium text-primary hover:underline">
                Open tracker
              </Link>
            </div>
            {ordered.length === 0 ? (
              <EmptyState title="No opportunities yet" description="Use the barrier scanner to add your first one." action={<Button asChild><Link href="/student/scanner">Scan a barrier</Link></Button>} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {ordered.map((p) => (
                  <OpportunityCard key={p.opp.id} p={p} selected={sel?.opp.id === p.opp.id} onSelect={() => setSelId(p.opp.id)} />
                ))}
              </div>
            )}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Financial assistance timeline</CardTitle>
              <CardDescription>Every status change on your requests</CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your timeline starts when you submit your first request.</p>
              ) : (
                <ol className="relative space-y-4 border-l pl-5">
                  {timeline.map((t, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
                      <p className="text-sm">
                        <span className="font-medium">{t.ref}</span> · {t.note}
                      </p>
                      <p className="text-xs text-muted-foreground">{fmtDateTime(t.at)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {actions.length === 0 && <p className="text-sm text-muted-foreground">You&apos;re all set for now.</p>}
              {actions.map((a, i) => (
                <Link key={i} href={a.href} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-light text-primary">
                    <a.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-[13px] leading-snug">{a.text}</span>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-primary">
                    {a.cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Upcoming deadlines</CardTitle>
              <Link href="/student/tracker" className="text-xs font-medium text-primary hover:underline">
                Calendar
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {deadlines.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">{fmtDate(d.date, { month: "short" })}</span>
                    <span className="text-sm font-semibold leading-none">{new Date(d.date).getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{d.label}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="h-3 w-3" /> {relDays(d.date)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Recent activity</CardTitle>
              <Link href="/activity" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.map((a) => (
                <div key={a.id} className="text-sm">
                  <p>{a.text}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(a.at)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
