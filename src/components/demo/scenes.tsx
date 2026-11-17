"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, FileCheck2, HandCoins, Loader2, Lock, MapPin, ScanSearch, Send, Sparkles } from "lucide-react";
import type { AppState, FundingRequest } from "@/lib/types";
import type { EnginePlan } from "@/lib/engine";
import { DEMO_OPPORTUNITY_ID } from "@/lib/seed";
import { currentSponsor, remainingOf } from "@/lib/actions";
import { institutionOf, oppOf, oppProgress, studentOf } from "@/lib/selectors";
import { EXPENSE_LABEL, fmtDateLong, relDays, urgencyOf, usd } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AnimatedNumber, StatusBadge, UrgencyBadge } from "@/components/shared/kit";
import { GapBreakdown } from "@/components/shared/GapBreakdown";
import { RequestBreakdown } from "@/components/shared/RequestBreakdown";
import { EngineRun } from "@/components/student/EngineRun";
import { ImpactReceipt } from "@/components/sponsor/ImpactReceipt";

const Big = ({ label, value, tone }: { label: string; value: number; tone?: "primary" | "warning" }) => (
  <div className="rounded-xl border bg-card p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`mt-1 text-2xl font-semibold tracking-tight ${tone === "primary" ? "text-primary" : tone === "warning" ? "text-warning" : ""}`}>
      <AnimatedNumber value={value} />
    </p>
  </div>
);

export function SceneStudent({ state }: { state: AppState }) {
  const opp = oppOf(state, DEMO_OPPORTUNITY_ID)!;
  const st = studentOf(state, opp.studentId)!;
  const inst = institutionOf(state, st.institutionId);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-base">{st.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xl font-semibold">{st.firstName}, 17</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            {st.grade} · {inst?.name} · <MapPin className="h-3.5 w-3.5" /> {st.city}, {st.country}
          </p>
        </div>
      </div>
      <p className="text-[15px] leading-relaxed">
        Amina passed her practice test and earned a seat on the <strong>{opp.title}</strong> — the credential employers ask for in entry-level data analyst roles. The exam fee is due {relDays(opp.deadline)}.
      </p>
      <div className="grid grid-cols-3 gap-3">
        <Big label="Exam fee" value={180} />
        <Big label="Available funds" value={70} />
        <Big label="Funding gap" value={110} tone="warning" />
      </div>
      <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">Without help, Amina would give up her seat and wait at least another year for the next exam window.</p>
    </div>
  );
}

export function SceneScan({ state, scanned, onScan }: { state: AppState; scanned: boolean; onScan: () => void }) {
  const opp = oppOf(state, DEMO_OPPORTUNITY_ID)!;
  const [busy, setBusy] = useState(false);
  if (!scanned) {
    return (
      <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-xl border border-dashed py-14 text-center">
        {busy && <motion.div className="absolute inset-x-0 h-0.5 bg-primary" initial={{ top: 0 }} animate={{ top: "100%" }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} aria-hidden />}
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
          <ScanSearch className="h-6 w-6" />
        </span>
        <p className="max-w-sm text-sm text-muted-foreground">The Financial Barrier Scanner collects the opportunity, institution, deadline, every required expense, available funds and eligibility details.</p>
        <Button
          size="lg"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            setTimeout(() => {
              setBusy(false);
              onScan();
            }, 1300);
          }}
        >
          {busy ? <Loader2 className="animate-spin" /> : <ScanSearch />} {busy ? "Analysing…" : "Run the Barrier Scanner"}
        </Button>
      </div>
    );
  }
  const u = urgencyOf(opp.deadline);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Financial barrier report</p>
          <p className="text-lg font-semibold">{opp.title}</p>
          <p className="text-sm text-muted-foreground">
            {opp.provider} · deadline {fmtDateLong(opp.deadline)}
          </p>
        </div>
        <UrgencyBadge label={u.label} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Big label="Total opportunity cost" value={180} />
        <Big label="Available personal funds" value={70} />
        <Big label="Financial shortfall" value={110} tone="warning" />
      </div>
      <div className="rounded-xl border p-4 text-sm">
        {opp.expenses.map((e) => (
          <div key={e.id} className="flex justify-between">
            <span>
              {e.label} <span className="text-muted-foreground">· {EXPENSE_LABEL[e.category]} · confirmed</span>
            </span>
            <span className="tabular">{usd(e.amount)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t pt-2 text-muted-foreground">
          <span>Estimated assistance required</span>
          <span className="font-medium text-foreground tabular">{usd(110)}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function SceneEngine({ state, plan, request, onSubmit }: { state: AppState; plan: EnginePlan; request?: FundingRequest; onSubmit: () => void }) {
  const [started, setStarted] = useState(!!request);
  const [runKey, setRunKey] = useState(0);
  const [done, setDone] = useState(!!request);
  if (!started) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
          <Sparkles className="h-6 w-6" />
        </span>
        <p className="max-w-sm text-sm text-muted-foreground">BridgeEngine checks seven priorities in a fixed order and asks sponsors only for what remains.</p>
        <Button
          size="lg"
          onClick={() => {
            setStarted(true);
            setRunKey((k) => k + 1);
          }}
        >
          <Sparkles /> Activate BridgeEngine
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <EngineRun stacked plan={plan} runKey={runKey} seededAt={state.seededAt} speed={550} onDone={() => setDone(true)} />
      {done &&
        (request ? (
          <p className="flex items-center gap-2 rounded-lg bg-primary-light/60 px-4 py-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" /> {request.ref} submitted: {usd(request.amount)} requested instead of {usd(plan.initialGap)}. <StatusBadge status={request.status} />
          </p>
        ) : (
          <Button size="lg" onClick={onSubmit}>
            <Send /> Submit {usd(plan.sponsorAmount)} request for verification
          </Button>
        ))}
    </div>
  );
}

export function SceneVerify({ state, request, onApprove }: { state: AppState; request?: FundingRequest; onApprove: () => void }) {
  if (!request) return <p className="text-sm text-muted-foreground">Complete scene 3 first — BridgeEngine creates the request.</p>;
  const inst = institutionOf(state, request.institutionId);
  const verified = !["Submitted", "Under Review", "Additional Information Required"].includes(request.status);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-4 py-2.5 text-sm">
        <span>
          <strong>{inst?.name}</strong> · verification queue
        </span>
        <StatusBadge status={request.status} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[13px] font-medium">
            {request.ref} · {request.purpose}
          </p>
          <RequestBreakdown r={request} state={state} />
        </div>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Visible only to the verifier
          </p>
          <p className="text-sm text-muted-foreground">{request.explanation}</p>
          <ul className="mt-3 space-y-1 text-xs">
            {request.documents.map((d) => (
              <li key={d.name} className="flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5 text-primary" /> {d.name}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Verifying confirms the $50 fee waiver (estimated → confirmed) and publishes the remaining $60 need to sponsors.</p>
        </div>
      </div>
      {verified ? (
        <motion.p initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 rounded-lg bg-primary-light/60 px-4 py-3 text-sm font-medium text-primary">
          <BadgeCheck className="h-5 w-5" /> Need verified by {inst?.name} — waiver confirmed, request visible to sponsors
        </motion.p>
      ) : (
        <Button size="lg" onClick={onApprove}>
          <BadgeCheck /> Review and verify the {usd(request.amount)} request
        </Button>
      )}
    </div>
  );
}

export function SceneFund({ state, request, onContribute }: { state: AppState; request?: FundingRequest; onContribute: () => void }) {
  const [busy, setBusy] = useState(false);
  if (!request) return <p className="text-sm text-muted-foreground">Complete the earlier scenes first.</p>;
  const sponsor = currentSponsor(state);
  const verified = !["Draft", "Submitted", "Under Review", "Additional Information Required"].includes(request.status);
  const remaining = remainingOf(request);
  const opp = oppOf(state, request.opportunityId);
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_240px]">
      <div className="rounded-xl border p-5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <BadgeCheck className="h-3.5 w-3.5" /> Verified need · {request.ref}
        </p>
        <p className="mt-2 font-medium">{request.purpose}</p>
        <p className="text-xs text-muted-foreground">Amina · Nairobi, Kenya · due {relDays(request.deadline)}</p>
        <p className="mt-3 text-sm text-muted-foreground">Expected outcome: {opp?.outcome}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Amount remaining</p>
            <p className="text-3xl font-semibold tracking-tight">
              <AnimatedNumber value={remaining} />
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <Progress value={request.amount ? (request.funded / request.amount) * 100 : 0} className="mt-3" />
        {!verified ? (
          <p className="mt-4 text-sm text-warning">Verify the request in scene 4 first.</p>
        ) : remaining > 0 ? (
          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setTimeout(() => {
                setBusy(false);
                onContribute();
              }, 900);
            }}
          >
            {busy ? <Loader2 className="animate-spin" /> : <HandCoins />} {busy ? "Processing simulated payment…" : `Contribute ${usd(remaining)}`}
          </Button>
        ) : (
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
            <CheckCircle2 className="h-4 w-4" /> Fully funded — to be paid directly to the exam board
          </p>
        )}
      </div>
      <div className="space-y-3">
        <div className="rounded-xl bg-primary-dark p-5 text-white dark:bg-primary-light dark:text-foreground">
          <p className="text-xs opacity-80">{sponsor.name}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            <AnimatedNumber value={sponsor.balance} />
          </p>
          <p className="text-xs opacity-80">available of {usd(sponsor.startingBalance)} simulated</p>
        </div>
        <p className="text-xs text-muted-foreground">Sponsors see the goal, verified amount and deadline — never Amina&apos;s private explanation or documents. Contributions can never exceed the remaining gap.</p>
      </div>
    </div>
  );
}

export function SceneSecured({ state }: { state: AppState }) {
  const opp = oppOf(state, DEMO_OPPORTUNITY_ID)!;
  const p = oppProgress(state, opp);
  const funded = p.request && ["Fully Funded", "Completed"].includes(p.request.status);
  return (
    <div className="space-y-5">
      {funded ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4 rounded-xl border border-primary/30 bg-primary-light/60 p-5">
          <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-primary" />
          <div>
            <p className="text-xl font-semibold tracking-tight">Your opportunity is now fully funded.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Amina&apos;s seat for the {opp.title} is secured for {fmtDateLong(opp.deadline)}.
            </p>
          </div>
        </motion.div>
      ) : (
        <p className="text-sm text-warning">Complete the funding scene to secure the opportunity.</p>
      )}
      <div className="rounded-xl border p-5">
        <p className="mb-3 text-[13px] font-medium">Final breakdown</p>
        <GapBreakdown b={p} height="h-4" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Big label="Personal funds" value={p.personal} />
          <Big label="Fee waiver" value={p.confirmedSavings + p.estimatedSavings} tone="primary" />
          <Big label="Sponsor assistance" value={p.assistance} tone="primary" />
          <Big label="Remaining financial gap" value={p.remaining} />
        </div>
      </div>
    </div>
  );
}

export function SceneImpact({ state, request, onComplete }: { state: AppState; request?: FundingRequest; onComplete: () => void }) {
  if (!request) return null;
  const c = state.contributions.find((x) => x.requestId === request.id && x.source === "sponsor");
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <p className="font-medium">Educational opportunity enabled</p>
          <p className="text-muted-foreground">An industry-recognised data analyst credential — for {usd(60)} of sponsor money instead of {usd(110)}, thanks to cost reduction first.</p>
        </div>
        {request.status === "Fully Funded" ? (
          <Button variant="outline" onClick={onComplete}>
            <BadgeCheck /> Institution confirms payment
          </Button>
        ) : (
          <StatusBadge status={request.status} />
        )}
      </div>
      {c ? <ImpactReceipt state={state} contribution={c} /> : <p className="text-sm text-muted-foreground">The receipt appears after the sponsor contribution.</p>}
    </div>
  );
}
