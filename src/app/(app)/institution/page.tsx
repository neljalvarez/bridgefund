"use client";

import Link from "next/link";
import { useStore, useT } from "@/lib/store";
import { remainingOf } from "@/lib/actions";
import { inInstitutionScope, studentOf } from "@/lib/selectors";
import { assessDeadline, RISK_ORDER } from "@/lib/deadline";
import { needsReview } from "@/lib/verification";
import { downloadCsv, feedbackRows } from "@/lib/csv";
import { PENDING_STATUSES, daysUntil, fmtDate, relDays, sum, aed } from "@/lib/format";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, StatCard } from "@/components/shared/kit";
import { DashboardFocus, ListRow, MoreDetails } from "@/components/shared/Focus";
import { RiskBadge } from "@/components/shared/DeadlineRisk";

export default function InstitutionOverview() {
  const { state } = useStore();
  const tr = useT();
  const scoped = state.requests.filter((r) => inInstitutionScope(state, r));
  const queue = scoped.filter((r) => PENDING_STATUSES.includes(r.status)).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const open = scoped.filter((r) => !["Completed", "Rejected", "Draft"].includes(r.status));
  const upcoming = open.filter((r) => daysUntil(r.deadline) >= 0).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const funds = state.currentInstitutionId === "all" ? sum(state.institutions.map((i) => i.fund)) : state.institutions.find((i) => i.id === state.currentInstitutionId)?.fund ?? 0;
  const instName = state.currentInstitutionId === "all" ? "Partner network" : state.institutions.find((i) => i.id === state.currentInstitutionId)?.name;
  const pledges = state.pledges.filter((p) => p.status === "Pending review" && scoped.some((r) => r.id === p.requestId));
  const fullyFunded = scoped.filter((r) => r.status === "Fully Funded");

  const attention = open
    .map((r) => ({ r, a: assessDeadline(state, state.opportunities.find((o) => o.id === r.opportunityId)!, r) }))
    .filter((x) => ["Critical", "At risk"].includes(x.a.level))
    .sort((a, b) => RISK_ORDER.indexOf(a.a.level) - RISK_ORDER.indexOf(b.a.level) || a.a.daysLeft - b.a.daysLeft)
    .slice(0, 4);

  const first = queue[0];
  const action = first
    ? { title: `Review ${first.ref} · ${first.purpose}`, text: `${studentOf(state, first.studentId)?.firstName} · ${aed(first.amount)} requested · due ${relDays(first.deadline)}`, href: `/institution/requests?focus=${first.id}`, cta: "Review request" }
    : pledges.length
      ? { title: `Approve ${pledges.length} sponsor allocation${pledges.length === 1 ? "" : "s"}`, text: `${aed(sum(pledges.map((p) => p.amount)))} waiting for your decision.`, href: "/institution/urgent", cta: "Review allocations" }
      : fullyFunded.length
        ? { title: `Confirm payment for ${fullyFunded[0].ref}`, text: "Fully funded — pay the provider and close it.", href: `/institution/requests?focus=${fullyFunded[0].id}`, cta: "Confirm payment" }
        : { title: "Nothing waiting", text: "New requests will appear here.", href: "/institution/matching", cta: "Match resources" };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">{instName}</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">{tr("Your dashboard")}</h1>
      </div>

      <DashboardFocus
        figures={[
          { label: "Unresolved gaps", value: sum(open.map(remainingOf)), tone: "warning", sub: `${open.length} open requests · ${queue.length} to review` },
          { label: "Available assistance", value: funds + state.pool, tone: "primary", sub: `${aed(funds)} fund · ${aed(state.pool)} shared pool` },
          { label: "Next deadline", value: upcoming[0] ? fmtDate(upcoming[0].deadline, { month: "short", day: "numeric" }) : "—", sub: upcoming[0] ? `${upcoming[0].ref} · ${relDays(upcoming[0].deadline)}` : "Nothing due" },
        ]}
        action={action}
      />

      <Card className="mt-8">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{tr("Needs attention")}</CardTitle>
          <Link href="/institution/urgent" className="text-sm font-medium text-primary hover:underline">
            All urgent cases
          </Link>
        </CardHeader>
        {attention.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState title="No deadline risks" />
          </div>
        ) : (
          <div className="divide-y border-t">
            {attention.map(({ r, a }) => (
              <ListRow
                key={r.id}
                href={`/institution/requests?focus=${r.id}`}
                title={`${r.ref} · ${r.purpose}`}
                meta={`${studentOf(state, r.studentId)?.firstName} · ${a.nextAction}`}
                right={
                  <>
                    <RiskBadge level={a.level} />
                    <span className="w-14 text-end font-semibold tabular">{aed(a.gap)}</span>
                  </>
                }
              />
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Pilot workflow</CardTitle>
          <button type="button" onClick={() => downloadCsv("bridgefund-feedback.csv", feedbackRows(state))} className="text-sm font-medium text-primary hover:underline">
            Export feedback CSV
          </button>
        </CardHeader>
        <div className="grid grid-cols-1 gap-px border-t bg-border sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Verify student expenses", m: `${queue.length} waiting`, href: "/institution/requests" },
            { t: "Approve assistance", m: `${queue.filter((r) => !needsReview(state, r)).length} ready · ${queue.filter((r) => needsReview(state, r)).length} need a closer look`, href: "/institution/requests" },
            { t: "Manage resources", m: `${state.resources.reduce((a, r) => a + r.available, 0)} items available to lend`, href: "/institution/resources" },
            { t: "Track funding allocations", m: `${pledges.length} sponsor allocation${pledges.length === 1 ? "" : "s"} to approve`, href: "/institution/urgent" },
            { t: "Collect student feedback", m: state.feedback.length ? `${state.feedback.length} responses · avg ${(state.feedback.reduce((a, f) => a + f.rating, 0) / state.feedback.length).toFixed(1)}/5` : "No responses yet", href: "/pilot#dashboard" },
            { t: "Confirm participation", m: `${scoped.filter((r) => r.status === "Completed" && !r.outcome).length} completed, outcome not recorded`, href: "/institution/requests?tab=completed" },
          ].map((x) => (
            <Link key={x.t} href={x.href} className="group bg-card px-5 py-4 transition-colors first:rounded-none last:rounded-b-xl hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
              <p className="text-sm font-medium">{x.t}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{x.m}</p>
            </Link>
          ))}
        </div>
      </Card>

      <MoreDetails title="More analytics">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Waiting for review" value={queue.length} money={false} />
          <StatCard label="Requests needing a closer look" value={queue.filter((r) => needsReview(state, r)).length} money={false} />
          <StatCard label="Verified, being funded" value={scoped.filter((r) => ["Verified", "Partially Funded"].includes(r.status)).length} money={false} />
          <StatCard label="Completed" value={scoped.filter((r) => r.status === "Completed").length} money={false} />
        </div>
        <p className="text-sm">
          <Link href="/institution/analytics" className="font-medium text-primary hover:underline">
            Open full analytics →
          </Link>
        </p>
      </MoreDetails>
    </div>
  );
}
