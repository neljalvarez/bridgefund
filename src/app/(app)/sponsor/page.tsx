"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { currentSponsor, remainingOf, setSponsor } from "@/lib/actions";
import { studentOf, verifiedNeeds } from "@/lib/selectors";
import { fmtMultiplier, portfolioImpact } from "@/lib/impact";
import { fmtDate, relDays, sum, usd } from "@/lib/format";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, StatCard, UrgencyBadge } from "@/components/shared/kit";
import { DashboardFocus, ListRow, MoreDetails } from "@/components/shared/Focus";
import { urgencyOf } from "@/lib/format";

export default function SponsorDashboard() {
  const { state, dispatch } = useStore();
  const sponsor = currentSponsor(state);
  const needs = verifiedNeeds(state).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const mine = state.contributions.filter((c) => c.sponsorId === sponsor.id);
  const reqs = [...new Set(mine.filter((c) => c.requestId).map((c) => c.requestId!))].map((id) => state.requests.find((r) => r.id === id)!).filter(Boolean);
  const impact = portfolioImpact(reqs, state.contributions);
  const held = sum(state.pledges.filter((p) => p.sponsorId === sponsor.id && p.status === "Pending review").map((p) => p.amount));
  const top = needs[0];

  const action =
    top && sponsor.balance > 0
      ? { title: `${usd(Math.min(remainingOf(top), sponsor.balance))} ${remainingOf(top) <= sponsor.balance ? "completes" : "goes toward"} ${top.purpose}`, text: `${top.ref} · ${studentOf(state, top.studentId)?.country} · due ${relDays(top.deadline)}`, href: `/sponsor/marketplace/${top.id}`, cta: "Fund this need" }
      : top
        ? { title: "Your balance is fully committed", text: "Thank you — see what your contributions resolved.", href: "/sponsor/impact", cta: "View impact" }
        : { title: "Every verified need is funded", text: "New needs appear once schools verify them.", href: "/sponsor/impact", cta: "View impact" };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Sponsor</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">{sponsor.name}</h1>
        </div>
        <Select value={sponsor.id} onValueChange={(v) => dispatch(setSponsor(v), { info: `Switched to ${state.sponsors.find((s) => s.id === v)?.name}` })}>
          <SelectTrigger className="w-full sm:w-[240px]" aria-label="Sponsor account">
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
      </div>

      <DashboardFocus
        figures={[
          { label: "Available to give", value: sponsor.balance, tone: "primary", sub: held > 0 ? `${usd(held)} awaiting school approval` : `of ${usd(sponsor.startingBalance)} simulated` },
          { label: "Verified needs", value: sum(needs.map(remainingOf)), sub: `${needs.length} students waiting` },
          { label: "Next deadline", value: top ? fmtDate(top.deadline, { month: "short", day: "numeric" }) : "—", sub: top ? `${top.ref} · ${relDays(top.deadline)}` : "Nothing due" },
        ]}
        action={action}
      />

      <Card className="mt-8">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Closing soon</CardTitle>
          <Link href="/sponsor/marketplace" className="text-sm font-medium text-primary hover:underline">
            All verified needs
          </Link>
        </CardHeader>
        {needs.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState title="No open verified needs" />
          </div>
        ) : (
          <div className="divide-y border-t">
            {needs.slice(0, 5).map((r) => (
              <ListRow
                key={r.id}
                href={`/sponsor/marketplace/${r.id}`}
                title={r.purpose}
                meta={`${r.ref} · ${studentOf(state, r.studentId)?.country} · ${relDays(r.deadline)}`}
                right={
                  <>
                    <span className="hidden sm:inline">
                      <UrgencyBadge label={urgencyOf(r.deadline).label} />
                    </span>
                    <span className="w-14 text-right font-semibold tabular">{usd(remainingOf(r))}</span>
                  </>
                }
              />
            ))}
          </div>
        )}
      </Card>

      <MoreDetails title="More details">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total given" value={sum(mine.map((c) => c.amount))} />
          <StatCard label="Students supported" value={new Set(reqs.map((r) => r.studentId)).size} money={false} />
          <StatCard label="Completed requests" value={reqs.filter((r) => r.status === "Completed").length} money={false} />
          <StatCard label="Impact multiplier" value={fmtMultiplier(impact.multiplier)} tone="primary" hint="Barriers resolved ÷ your funding" />
        </div>
        <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <Link href="/sponsor/impact" className="font-medium text-primary hover:underline">
            See your impact →
          </Link>
          <Link href="/sponsor/contributions" className="font-medium text-primary hover:underline">
            Contributions and receipts →
          </Link>
          <Link href="/sponsor/allocate" className="font-medium text-primary hover:underline">
            Plan a larger budget →
          </Link>
        </p>
      </MoreDetails>
    </div>
  );
}
