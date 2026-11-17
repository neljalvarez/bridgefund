"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, CalendarClock, GraduationCap, HandCoins, MapPin, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { remainingOf } from "@/lib/actions";
import { institutionOf, oppOf, studentOf } from "@/lib/selectors";
import { EXPENSE_LABEL, LEVEL_LABEL, OPP_LABEL, fmtDateLong, fmtDateTime, relDays, urgencyOf, usd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState, KeyValue, StatusBadge, UrgencyBadge } from "@/components/shared/kit";
import { ContributeDialog } from "@/components/sponsor/ContributeDialog";

export default function NeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const r = state.requests.find((x) => x.id === id);
  if (!r || ["Draft", "Submitted", "Under Review", "Additional Information Required", "Rejected"].includes(r.status)) {
    return <EmptyState title="This need isn't available" description="It may not be verified yet, or demo data was reset." action={<Button asChild><Link href="/sponsor/marketplace">Back to marketplace</Link></Button>} />;
  }
  const st = studentOf(state, r.studentId)!;
  const opp = oppOf(state, r.opportunityId);
  const inst = institutionOf(state, r.institutionId);
  const remaining = remainingOf(r);
  const reductions = r.reductions.reduce((a, x) => a + x.amount, 0);
  const sponsorEvents = r.history.filter((h) => h.actor !== "student");

  return (
    <>
      <Link href="/sponsor/marketplace" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Marketplace
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={r.status} />
              <UrgencyBadge label={urgencyOf(r.deadline).label} />
              <span className="text-xs text-muted-foreground">{r.ref}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{r.purpose}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{st.firstName} · {LEVEL_LABEL[st.level]}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {st.city}, {st.country}
              </span>
              {opp && <span>{OPP_LABEL[opp.category]}</span>}
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Educational goal and expected outcome
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Goal:</span> {st.goal}
              </p>
              <p>
                <span className="text-muted-foreground">Expected outcome:</span> {opp?.outcome}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Verified requirement</CardTitle>
            </CardHeader>
            <CardContent>
              {r.expenses.map((e) => (
                <KeyValue key={e.id} label={`${e.label} · ${EXPENSE_LABEL[e.category]}`} value={usd(e.amount)} />
              ))}
              <KeyValue label="Student's own contribution" value={`−${usd(r.studentFunds)}`} className="border-t" />
              {reductions > 0 && <KeyValue label="Waivers, alternatives and discounts (confirmed)" value={`−${usd(reductions)}`} />}
              <KeyValue label="Verified requirement for sponsors" value={usd(r.amount)} className="border-t font-semibold" />
              <p className="mt-3 text-xs text-muted-foreground">BridgeFund reduced this need by {usd(reductions)} before it reached the marketplace.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Verification trail</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 border-l pl-4 text-sm">
                {sponsorEvents.map((h, i) => (
                  <li key={i}>
                    {h.note} <span className="text-xs text-muted-foreground">· {fmtDateTime(h.at)}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> The student&apos;s explanation and documents are visible only to {inst?.name}.
              </p>
            </CardContent>
          </Card>
        </div>
        <aside>
          <Card className="lg:sticky lg:top-20">
            <CardContent className="space-y-4 p-5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified by {inst?.name}
              </p>
              <div>
                <p className="text-sm text-muted-foreground">Amount remaining</p>
                <p className="text-4xl font-semibold tracking-tight tabular">{usd(remaining)}</p>
              </div>
              <Progress value={r.amount ? (r.funded / r.amount) * 100 : 100} />
              <p className="text-sm text-muted-foreground">
                {usd(r.funded)} of {usd(r.amount)} funded
              </p>
              <p className="flex items-center gap-1.5 text-sm">
                <CalendarClock className="h-4 w-4 text-muted-foreground" /> Due {fmtDateLong(r.deadline)} · {relDays(r.deadline)}
              </p>
              <Button className="w-full" size="lg" onClick={() => setOpen(true)} disabled={remaining <= 0}>
                <HandCoins /> {remaining > 0 ? "Contribute" : "Fully funded"}
              </Button>
              <p className="text-xs text-muted-foreground">Simulated transaction. Funds would be paid directly to the provider after institutional approval.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
      <ContributeDialog request={r} open={open} onOpenChange={setOpen} />
    </>
  );
}
