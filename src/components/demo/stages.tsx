"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, CalendarClock, CheckCircle2, FileCheck2, HandCoins, Lock, ScanLine, Send, Wand2 } from "lucide-react";
import type { AppState, FundingRequest } from "@/lib/types";
import type { EnginePlan } from "@/lib/engine";
import { DEMO_OPPORTUNITY_ID } from "@/lib/seed";
import { institutionOf, oppOf, oppProgress, studentOf } from "@/lib/selectors";
import { remainingOf } from "@/lib/actions";
import { VERIFICATION_LABEL, fmtDateLong, relDays, usd } from "@/lib/format";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import { BarrierReport } from "@/components/student/BarrierReport";
import { EngineRun } from "@/components/student/EngineRun";
import { BridgePanel } from "@/components/student/BridgePanel";
import { ImpactReceipt } from "@/components/sponsor/ImpactReceipt";
import { AnimatedMoney, ChunkyProgress, PixelLoader, StatusBadge } from "@/components/ui/primitives";
import { StackedBar } from "@/components/ui/charts";

export function StudentIntro({ state }: { state: AppState }) {
  const opp = oppOf(state, DEMO_OPPORTUNITY_ID)!;
  const st = studentOf(state, opp.studentId)!;
  const inst = institutionOf(state, st.institutionId);
  return (
    <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-2">
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex h-36 w-32 items-center justify-center border-2 border-line bg-raised">
          <PixelSprite name="student" scale={8} />
        </motion.div>
        <span className="demo-label">Fictional student</span>
      </div>
      <div className="space-y-3">
        <div>
          <p className="font-pixel text-3xl">{st.firstName}</p>
          <p className="text-sm text-muted">
            {st.grade} · {inst?.name} · {st.city}, {st.country}
          </p>
        </div>
        <p className="text-sm">
          Amina passed her practice test and earned a seat on the <strong>{opp.title}</strong> — the credential employers ask for in entry-level data analyst roles.
        </p>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="border-2 border-line bg-bg p-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Exam fee</dt>
            <dd className="font-pixel text-2xl">{usd(180)}</dd>
          </div>
          <div className="border-2 border-line bg-bg p-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">She has saved</dt>
            <dd className="font-pixel text-2xl text-forest">{usd(opp.studentFunds)}</dd>
          </div>
          <div className="border-2 border-line bg-bg p-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Deadline</dt>
            <dd className="font-pixel text-2xl">{relDays(opp.deadline).replace("in ", "")}</dd>
          </div>
        </dl>
        <p className="border-l-4 border-terra pl-3 text-sm text-muted">Without help, she would have to give up her seat — and wait at least another year.</p>
      </div>
    </div>
  );
}

export function ScanStage({ state, scanned, onScan }: { state: AppState; scanned: boolean; onScan: () => void }) {
  const opp = oppOf(state, DEMO_OPPORTUNITY_ID)!;
  const [scanning, setScanning] = useState(false);
  const run = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onScan();
    }, 1400);
  };
  if (!scanned) {
    return (
      <div className="relative flex flex-col items-center gap-4 overflow-hidden border-2 border-dashed border-line/50 py-12 text-center">
        {scanning && (
          <motion.div className="absolute inset-x-0 h-1 bg-gold" initial={{ top: 0 }} animate={{ top: "100%" }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} aria-hidden />
        )}
        <ScanLine size={36} className="text-forest" aria-hidden />
        <p className="max-w-sm text-sm text-muted">The Barrier Scanner asks what the opportunity is, the deadline, every required expense and what the student can already afford.</p>
        {scanning ? (
          <PixelLoader label="Scanning expenses…" />
        ) : (
          <button type="button" className="btn-primary px-5 py-2.5" onClick={run}>
            <ScanLine size={16} /> Run the Barrier Scanner
          </button>
        )}
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <BarrierReport
        input={{
          title: opp.title,
          provider: opp.provider,
          institution: institutionOf(state, opp.institutionId)?.name,
          deadline: opp.deadline,
          expenses: opp.expenses,
          studentFunds: opp.studentFunds,
          priorAssistance: opp.priorAssistance,
        }}
      />
    </motion.div>
  );
}

export function EngineStage({ plan, request, onSubmit }: { plan: EnginePlan; request?: FundingRequest; onSubmit: () => void }) {
  const [runKey, setRunKey] = useState(0);
  const [started, setStarted] = useState(!!request);
  const [finished, setFinished] = useState(!!request);
  if (!started) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <PixelSprite name="chest" scale={8} />
        <p className="max-w-sm text-sm text-muted">
          Gap to resolve: <span className="font-pixel text-lg text-ink">{usd(plan.initialGap)}</span>. Watch BridgeEngine check six priorities in order.
        </p>
        <button
          type="button"
          className="btn-primary px-5 py-2.5"
          onClick={() => {
            setStarted(true);
            setRunKey((k) => k + 1);
          }}
        >
          <Wand2 size={16} /> Activate BridgeEngine
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <EngineRun plan={plan} runKey={runKey} speed={650} onDone={() => setFinished(true)} />
      {finished &&
        (request ? (
          <p className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} className="text-forest" /> Request {request.ref} for {usd(request.amount)} submitted for verification. <StatusBadge status={request.status} />
          </p>
        ) : (
          <button type="button" className="btn-primary" onClick={onSubmit}>
            <Send size={16} /> Submit {usd(plan.sponsorAmount)} request for verification
          </button>
        ))}
    </div>
  );
}

export function VerifyStage({ state, request, onApprove }: { state: AppState; request?: FundingRequest; onApprove: () => void }) {
  if (!request) return <p className="text-sm text-muted">Complete stage 3 first — BridgeEngine creates the request.</p>;
  const st = studentOf(state, request.studentId)!;
  const inst = institutionOf(state, st.institutionId);
  const approved = !["Submitted", "Under Review"].includes(request.status);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-2 border-line bg-raised/50 px-3 py-2">
        <p className="text-sm font-semibold">
          {inst?.name} · verification queue
        </p>
        <StatusBadge status={request.status} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="label">Request</p>
          <p className="font-semibold">
            {request.ref} · {request.purpose}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li className="flex justify-between">
              <span>Exam fee</span>
              <span className="font-mono">{usd(request.totalCost)}</span>
            </li>
            <li className="flex justify-between text-forest">
              <span>Student contribution</span>
              <span className="font-mono">−{usd(request.studentFunds)}</span>
            </li>
            {request.reductions.map((r) => (
              <li key={r.id} className="flex justify-between text-forest">
                <span>{r.title}</span>
                <span className="font-mono">−{usd(r.amount)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-line/30 pt-1 font-semibold">
              <span>Requested</span>
              <span className="font-mono">{usd(request.amount)}</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="label flex items-center gap-1">
            <Lock size={11} /> Visible only to the verifier
          </p>
          <p className="text-sm">{request.reason}</p>
          <ul className="mt-2 space-y-1 text-xs">
            {request.documents.map((d) => (
              <li key={d.name} className="flex items-center gap-1.5">
                <FileCheck2 size={13} className="text-forest" /> {d.name}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Method: {VERIFICATION_LABEL[request.verification]}</p>
        </div>
      </div>
      {approved ? (
        <motion.p initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="stamp rotate-[-4deg] border-forest px-3 py-1.5 text-base text-forest">
          <BadgeCheck size={16} className="mr-1.5" /> Verified by {inst?.name}
        </motion.p>
      ) : (
        <button type="button" className="btn-primary px-5 py-2.5" onClick={onApprove}>
          <CheckCircle2 size={16} /> Approve & verify request
        </button>
      )}
    </div>
  );
}

export function SponsorStage({ state, request, onContribute }: { state: AppState; request?: FundingRequest; onContribute: () => void }) {
  const [processing, setProcessing] = useState(false);
  if (!request) return <p className="text-sm text-muted">Complete the earlier stages first.</p>;
  const verified = !["Submitted", "Under Review", "Draft"].includes(request.status);
  const remaining = remainingOf(request);
  const opp = oppOf(state, request.opportunityId);
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
      <div className="border-2 border-line bg-surface p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
          <BadgeCheck size={14} className="text-forest" /> Verified need · {request.ref}
        </p>
        <p className="mt-1 font-semibold">{request.purpose}</p>
        <p className="text-xs text-muted">
          Amina · Nairobi, Kenya · <CalendarClock size={11} className="inline" /> {relDays(request.deadline)}
        </p>
        <p className="mt-2 text-sm">
          <span className="text-muted">Potential outcome:</span> {opp?.outcome}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Remaining gap</p>
            <p className="font-pixel text-3xl">
              <AnimatedMoney value={remaining} />
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <ChunkyProgress value={request.funded} max={request.amount} tone="terra" className="mt-2" label="Funding progress" />
        {!verified ? (
          <p className="mt-3 text-sm text-terraink">Verify the request in stage 4 first.</p>
        ) : remaining > 0 ? (
          <button
            type="button"
            className="btn-primary mt-4 w-full"
            disabled={processing}
            onClick={() => {
              setProcessing(true);
              setTimeout(() => {
                setProcessing(false);
                onContribute();
              }, 900);
            }}
          >
            {processing ? <PixelLoader label="Processing simulated payment…" /> : (
              <>
                <HandCoins size={16} /> Contribute {usd(remaining)}
              </>
            )}
          </button>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-forest">
            <CheckCircle2 size={16} /> Fully funded — paid directly to the exam board
          </p>
        )}
      </div>
      <div className="space-y-3">
        <div className="border-2 border-line bg-forest p-3 text-onforest">
          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Juniper Demo Fund · pool</p>
          <p className="font-pixel text-4xl">
            <AnimatedMoney value={state.sponsor.balance} />
          </p>
          <p className="text-xs opacity-80">of {usd(state.sponsor.startingBalance)} simulated funds</p>
        </div>
        <p className="text-xs text-muted">The sponsor sees the goal, the verified amount and the deadline — never Amina&apos;s private reason or documents.</p>
      </div>
    </div>
  );
}

export function UnlockStage({ state }: { state: AppState }) {
  const opp = oppOf(state, DEMO_OPPORTUNITY_ID)!;
  const p = oppProgress(state, opp);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="space-y-4">
      {show && <BridgePanel p={p} />}
      {p.unlocked ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4 }} className="border-2 border-line bg-forest p-4 text-center text-onforest">
          <p className="font-pixel text-3xl">Opportunity Unlocked</p>
          <p className="mt-1 text-sm">Amina&apos;s remaining funding gap is now {usd(p.remaining)}. Her exam seat is secured for {fmtDateLong(opp.deadline)}.</p>
        </motion.div>
      ) : (
        <p className="text-sm text-terraink">Remaining gap {usd(p.remaining)} — complete the sponsor stage to unlock.</p>
      )}
    </div>
  );
}

export function ImpactStage({ state, request }: { state: AppState; request?: FundingRequest }) {
  if (!request) return null;
  const c = state.contributions.find((x) => x.requestId === request.id && x.source === "sponsor");
  const waiver = request.reductions.reduce((a, r) => a + r.amount, 0);
  return (
    <div className="space-y-5">
      <div>
        <p className="label">How $180 was resolved</p>
        <StackedBar
          total={request.totalCost}
          parts={[
            { label: "Amina's savings", value: request.studentFunds, color: "#294C3D" },
            { label: "Fee waiver (cost reduction)", value: waiver, color: "#D8AA55" },
            { label: "Verified sponsor", value: request.funded, color: "#C97052" },
          ]}
        />
        <p className="mt-2 text-sm">
          The sponsor was asked for <strong>{usd(request.amount)}</strong> instead of <strong>{usd(request.totalCost - request.studentFunds)}</strong> — {Math.round((waiver / (request.totalCost - request.studentFunds)) * 100)}% less, because cost reduction came first.
        </p>
      </div>
      {c ? <ImpactReceipt state={state} contribution={c} /> : <p className="text-sm text-muted">The impact receipt appears after the sponsor contribution.</p>}
    </div>
  );
}
