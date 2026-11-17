"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, HandCoins, ShieldAlert, Siren, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { fundRequest, remainingOf, reviewPledge, setPriority } from "@/lib/actions";
import { assessDeadline, RISK_ORDER } from "@/lib/deadline";
import { needsReview, verificationChecks } from "@/lib/verification";
import { inInstitutionScope, studentOf } from "@/lib/selectors";
import { fmtDateTime, sum, usd } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, PageHeader, StatCard, StatusBadge } from "@/components/shared/kit";
import { DeadlineRiskPanel, RiskBadge } from "@/components/shared/DeadlineRisk";

const OPEN = ["Draft", "Submitted", "Under Review", "Additional Information Required", "Verified", "Partially Funded"];

export default function UrgentPage() {
  const { state, dispatch } = useStore();
  const [emergency, setEmergency] = useState<string | null>(null);
  const scoped = state.requests.filter((r) => inInstitutionScope(state, r));
  const cases = scoped
    .filter((r) => OPEN.includes(r.status))
    .map((r) => ({ r, a: assessDeadline(state, state.opportunities.find((o) => o.id === r.opportunityId)!, r) }))
    .filter((x) => ["Critical", "At risk", "Deadline passed"].includes(x.a.level))
    .sort((a, b) => RISK_ORDER.indexOf(a.a.level) - RISK_ORDER.indexOf(b.a.level) || a.a.daysLeft - b.a.daysLeft);
  const reviews = scoped.filter((r) => ["Submitted", "Under Review", "Additional Information Required"].includes(r.status) && needsReview(state, r));
  const pledges = state.pledges.filter((p) => p.status === "Pending review" && scoped.some((r) => r.id === p.requestId));
  const er = state.requests.find((r) => r.id === emergency);
  const erInst = er && state.institutions.find((i) => i.id === er.institutionId);

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-1.5">
            <Siren className="h-3.5 w-3.5" /> Financial deadline rescue
          </span>
        }
        title="Urgent cases"
        description="Students at risk of missing an opportunity, requests that need a closer look, and sponsor allocations awaiting your approval. Recommendations are advisory — staff make every decision."
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Critical or at-risk cases" value={cases.filter((c) => c.a.level !== "Deadline passed").length} money={false} tone="warning" />
        <StatCard label="Gap in at-risk cases" value={sum(cases.map((c) => c.a.gap))} />
        <StatCard label="Requests needing manual review" value={reviews.length} money={false} />
        <StatCard label="Sponsor allocations to review" value={sum(pledges.map((p) => p.amount))} hint={`${pledges.length} pending`} />
      </div>

      <section className="mt-8" aria-labelledby="risk">
        <h2 id="risk" className="mb-3 text-base font-semibold">
          Deadline risk
        </h2>
        {cases.length === 0 ? (
          <EmptyState title="No students at risk right now" description="Cases appear here when estimated processing time approaches the deadline." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {cases.map(({ r, a }) => {
              const st = studentOf(state, r.studentId);
              const inst = state.institutions.find((i) => i.id === r.institutionId);
              const canEmergency = ["Verified", "Partially Funded"].includes(r.status) && (inst?.fund ?? 0) >= remainingOf(r) && remainingOf(r) > 0;
              return (
                <Card key={r.id}>
                  <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{r.purpose}</CardTitle>
                      <CardDescription className="mt-1">
                        {r.ref} · {st?.firstName} · {inst?.name}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <RiskBadge level={a.level} />
                      <StatusBadge status={r.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <DeadlineRiskPanel a={a} />
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/institution?focus=${r.id}`}>
                          Open case <ArrowRight />
                        </Link>
                      </Button>
                      <Button size="sm" variant={r.priority ? "soft" : "ghost"} onClick={() => dispatch(setPriority(r.id, !r.priority), { info: r.priority ? "Priority removed" : "Marked for priority review" })}>
                        {r.priority ? "Priority review ✓" : "Mark priority review"}
                      </Button>
                      {canEmergency && (
                        <Button size="sm" onClick={() => setEmergency(r.id)}>
                          <HandCoins /> Cover from emergency fund
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8" aria-labelledby="reviews">
        <h2 id="reviews" className="mb-3 text-base font-semibold">
          Suspicious or incomplete requests
        </h2>
        {reviews.length === 0 ? (
          <EmptyState title="No requests need manual review" icon={<ShieldAlert />} />
        ) : (
          <Card>
            <ul className="divide-y">
              {reviews.map((r) => {
                const issues = verificationChecks(state, r).filter((c) => c.status === "fail" || c.status === "warn");
                const flags = (r.flags ?? []).filter((f) => !f.resolved);
                return (
                  <li key={r.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-start">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {r.ref} · {r.purpose}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {studentOf(state, r.studentId)?.firstName} · {usd(r.amount)} requested
                      </p>
                      <ul className="mt-2 space-y-1 text-[13px]">
                        {issues.map((c) => (
                          <li key={c.key} className={c.status === "fail" ? "text-destructive" : "text-warning"}>
                            {c.label}: <span className="text-muted-foreground">{c.detail}</span>
                          </li>
                        ))}
                        {flags.map((f) => (
                          <li key={f.id} className="text-warning">
                            Flag: <span className="text-muted-foreground">{f.note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button asChild size="sm" variant="outline" className="shrink-0">
                      <Link href={`/institution?focus=${r.id}`}>Review</Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>

      <section className="mt-8" aria-labelledby="pledges">
        <h2 id="pledges" className="mb-3 text-base font-semibold">
          Sponsor allocations awaiting review
        </h2>
        {pledges.length === 0 ? (
          <EmptyState title="No sponsor allocations pending" description="Allocations made with the sponsor Impact Planner appear here for approval." />
        ) : (
          <Card>
            <ul className="divide-y">
              {pledges.map((p) => {
                const r = state.requests.find((x) => x.id === p.requestId)!;
                const sp = state.sponsors.find((x) => x.id === p.sponsorId);
                return (
                  <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium">
                        {sp?.name} → {r.ref} · {r.purpose}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {usd(p.amount)} proposed · {usd(remainingOf(r))} still needed · approach: {p.approach} · {fmtDateTime(p.at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="outline" onClick={() => dispatch(reviewPledge(p.id, false), { info: "Allocation declined — funds returned to the sponsor" })}>
                        <X /> Decline
                      </Button>
                      <Button size="sm" onClick={() => dispatch(reviewPledge(p.id, true), { success: "Allocation approved", description: "Applied, capped at the remaining gap." })}>
                        <Check /> Approve
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>

      <Dialog open={!!er} onOpenChange={(o) => !o && setEmergency(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cover {er?.ref} from the emergency fund?</DialogTitle>
            <DialogDescription>
              {usd(er ? remainingOf(er) : 0)} will be allocated from {erInst?.name}&apos;s fund ({usd(erInst?.fund ?? 0)} available) and paid to the provider on completion. This uses money that could support other students.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmergency(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (er) dispatch(fundRequest(er.id, remainingOf(er), "institution"), { success: `${er.ref} covered from the emergency fund` });
                setEmergency(null);
              }}
            >
              Allocate emergency funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Badge variant="outline" className="mt-8 border-dashed">
        All payments are simulated
      </Badge>
    </>
  );
}
