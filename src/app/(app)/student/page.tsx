"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { useStore, useT } from "@/lib/store";
import { currentStudent, studentOverview } from "@/lib/selectors";
import { assessDeadline, RISK_ORDER } from "@/lib/deadline";
import { fmtDate, fmtDateTime, relDays, timeAgo, aed } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, StatCard, StatusBadge } from "@/components/shared/kit";
import { DashboardFocus, ListRow, MoreDetails } from "@/components/shared/Focus";
import { DeadlineRiskPanel, RiskBadge } from "@/components/shared/DeadlineRisk";

export default function StudentDashboard() {
  const { state } = useStore();
  const tr = useT();
  const student = currentStudent(state);
  const ov = studentOverview(state);
  const active = [...ov.active].sort((a, b) => a.opp.deadline.localeCompare(b.opp.deadline));
  const ordered = [...ov.all].sort((a, b) => Number(a.secured) - Number(b.secured) || a.opp.deadline.localeCompare(b.opp.deadline));
  const next = active.find((p) => !p.secured) ?? active[0];
  const funded = ov.all.find((p) => p.request?.status === "Fully Funded");

  // One recommended next step, in priority order.
  const info = ov.requests.find((r) => r.status === "Additional Information Required");
  const unplanned = active.find((p) => !p.request && p.remaining > 0);
  const draft = ov.requests.find((r) => r.status === "Draft");
  const action = info
    ? { title: `Send the documents your school asked for`, text: `${info.ref} · ${info.purpose}`, href: "/student/requests", cta: "Respond" }
    : unplanned
      ? { title: `Close the ${aed(unplanned.remaining)} gap for ${unplanned.opp.title}`, text: "BridgeEngine finds savings before asking anyone for money.", href: `/student/engine?opp=${unplanned.opp.id}`, cta: "Get assistance" }
      : draft
        ? { title: `Submit your draft request`, text: `${draft.ref} · ${draft.purpose}`, href: `/student/engine?opp=${draft.opportunityId}`, cta: "Review and submit" }
        : { title: "Track your requests", text: "We'll notify you when anything changes.", href: "/student/requests", cta: "View requests" };

  const risks = active
    .map((p) => ({ p, a: assessDeadline(state, p.opp, p.request) }))
    .filter((x) => ["Critical", "At risk"].includes(x.a.level))
    .sort((a, b) => RISK_ORDER.indexOf(a.a.level) - RISK_ORDER.indexOf(b.a.level));
  const timeline = ov.requests.flatMap((r) => r.history.map((h) => ({ ...h, ref: r.ref }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
  const activity = state.activity.filter((a) => a.role === "student").slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{tr("Hi")} {student.firstName}</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">{tr("Your dashboard")}</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/student/scanner">
            <Plus /> {tr("Add opportunity")}
          </Link>
        </Button>
      </div>

      {funded && (
        <p className="mb-4 flex items-center gap-2.5 rounded-xl border border-primary/25 bg-card px-4 py-3 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <span>
            <strong>Your opportunity is now fully funded.</strong> {funded.opp.title}
          </span>
        </p>
      )}
      {risks.length > 0 && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            <strong>{risks[0].p.opp.title}</strong> could miss its deadline ({relDays(risks[0].p.opp.deadline)}).
          </span>
          <Link href={`/student/engine?opp=${risks[0].p.opp.id}`} className="font-medium underline">
            Fix it
          </Link>
        </p>
      )}

      <DashboardFocus
        figures={[
          { label: "Remaining gap", value: ov.remaining, tone: ov.remaining > 0 ? "warning" : "primary", sub: `across ${active.length} opportunit${active.length === 1 ? "y" : "ies"}` },
          { label: "Assistance found", value: ov.savings + ov.assistance, tone: "primary", sub: `${aed(ov.confirmedSavings + ov.assistance)} confirmed` },
          { label: "Next deadline", value: next ? fmtDate(next.opp.deadline, { month: "short", day: "numeric" }) : "—", sub: next ? `${next.opp.title} · ${relDays(next.opp.deadline)}` : "No upcoming deadlines" },
        ]}
        action={action}
      />

      <Card className="mt-8">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{tr("Your opportunities")}</CardTitle>
          <Link href="/student/tracker" className="text-sm font-medium text-primary hover:underline">
            {tr("Calendar")}
          </Link>
        </CardHeader>
        {ordered.length === 0 ? (
          <CardContent>
            <EmptyState title="No opportunities yet" action={<Button asChild><Link href="/student/scanner">Add your first</Link></Button>} />
          </CardContent>
        ) : (
          <div className="divide-y border-t">
            {ordered.map((p) => {
              const pct = p.total ? Math.round((p.covered / p.total) * 100) : 0;
              return (
                <ListRow
                  key={p.opp.id}
                  href={`/student/engine?opp=${p.opp.id}`}
                  title={p.opp.title}
                  meta={
                    <span className="mt-1.5 flex items-center gap-3">
                      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary sm:w-40">
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </span>
                      <span>{relDays(p.opp.deadline)}</span>
                    </span>
                  }
                  right={
                    <>
                      {p.request && <StatusBadge status={p.request.status} className="hidden md:inline-flex" />}
                      <span className="w-16 text-end font-semibold tabular">{p.remaining > 0 ? aed(p.remaining) : "Funded"}</span>
                    </>
                  }
                />
              );
            })}
          </div>
        )}
      </Card>

      <MoreDetails title="More details">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total cost" value={ov.total} />
          <StatCard label="Your own funds" value={ov.personal} />
          <StatCard label="Savings found" value={ov.savings} tone="primary" hint={`${aed(ov.confirmedSavings)} confirmed`} />
          <StatCard label="Sponsor help received" value={ov.assistance} />
        </div>
        {risks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Deadline risks</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {risks.map(({ p, a }) => (
                <div key={p.opp.id} className="space-y-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{p.opp.title}</p>
                    <RiskBadge level={a.level} />
                  </div>
                  <DeadlineRiskPanel a={a} compact />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Request timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">Starts when you submit a request.</p>
              ) : (
                <ol className="relative space-y-4 border-s ps-5">
                  {timeline.map((t, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -start-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
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
        </div>
      </MoreDetails>
    </div>
  );
}
