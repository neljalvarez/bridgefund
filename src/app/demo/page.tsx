"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, LogOut, RotateCcw } from "lucide-react";
import type { Role } from "@/lib/types";
import { useStore } from "@/lib/store";
import { applyEnginePlan, approveRequest, fundRequest, remainingOf, setDemo, setRole } from "@/lib/actions";
import { DEMO_OPPORTUNITY_ID } from "@/lib/seed";
import { oppOf, requestForOpp } from "@/lib/selectors";
import { planFor } from "@/lib/plan";
import { usd } from "@/lib/format";
import { Window } from "@/components/ui/Window";
import { ROLE_META } from "@/components/layout/nav";
import { EngineStage, ImpactStage, ScanStage, SponsorStage, StudentIntro, UnlockStage, VerifyStage } from "@/components/demo/stages";

interface StageDef {
  title: string;
  kicker: string;
  role: Role;
  narrative: string;
  task: string;
  link?: { href: string; label: string };
}

const STAGES: StageDef[] = [
  { kicker: "Stage 1", title: "Meet the student", role: "student", narrative: "Amina has earned a seat on a career-changing certification exam. The exam costs $180. She has saved $70.", task: "Read Amina's situation, then press Next." },
  { kicker: "Stage 2", title: "Identify the barrier", role: "student", narrative: "Instead of a vague “I can't afford it”, the Financial Barrier Scanner calculates the exact shortfall, the urgency and every line item.", task: "Run the Barrier Scanner.", link: { href: "/student/scanner", label: "Open the full scanner" } },
  { kicker: "Stage 3", title: "Activate BridgeEngine", role: "student", narrative: "BridgeEngine checks fee waivers, free alternatives, discounts, borrowable equipment and grants — in that order — before anyone is asked for money.", task: "Activate BridgeEngine, then submit the reduced request.", link: { href: "/student/engine", label: "Open BridgeEngine" } },
  { kicker: "Stage 4", title: "Institutional verification", role: "institution", narrative: "Amina's school verifies the need privately. Her reason and documents never leave the verifier.", task: "Approve and verify the request.", link: { href: "/institution", label: "Open the verification desk" } },
  { kicker: "Stage 5", title: "Sponsor assistance", role: "sponsor", narrative: "A sponsor with a $500 simulated pool sees only the verified goal and the exact remaining amount.", task: "Contribute $60 and watch the balance update.", link: { href: "/sponsor", label: "Open the sponsor marketplace" } },
  { kicker: "Stage 6", title: "Opportunity unlocked", role: "student", narrative: "Back on Amina's quest journal, the last section of the bridge falls into place.", task: "Watch the bridge complete.", link: { href: "/student", label: "Open Amina's quest journal" } },
  { kicker: "Stage 7", title: "Demonstrate impact", role: "sponsor", narrative: "The sponsor receives a digital impact receipt showing exactly how cost reduction and targeted assistance resolved the barrier.", task: "Review the receipt — print or download it from My Impact.", link: { href: "/sponsor/contributions", label: "Open My Impact" } },
];

export default function DemoPage() {
  const { state, dispatch, reset } = useStore();
  const router = useRouter();
  const stage = Math.min(state.demo.stage, STAGES.length - 1);
  const s = STAGES[stage];
  const opp = oppOf(state, DEMO_OPPORTUNITY_ID);
  const request = requestForOpp(state, DEMO_OPPORTUNITY_ID);
  const plan = useMemo(() => (opp ? planFor(state, opp) : null), [opp, state]);

  const done = [
    true,
    state.demo.scanned,
    !!request && request.status !== "Draft",
    !!request && !["Draft", "Submitted", "Under Review"].includes(request.status),
    !!request && remainingOf(request) <= 0 && request.funded > 0,
    !!request && remainingOf(request) <= 0 && request.funded > 0,
    !!request && request.funded > 0,
  ];

  const pristine = !request && state.sponsor.balance === 500;

  useEffect(() => {
    if (state.role !== s.role) dispatch(setRole(s.role));
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = useCallback(
    (i: number) => {
      if (!opp || !plan) return;
      if (i === 1) dispatch(setDemo({ scanned: true }), { sound: "click" });
      if (i === 2 && !(request && request.status !== "Draft")) dispatch(applyEnginePlan(opp.id, plan, true), { sound: "success", toast: { title: `Request for ${usd(plan.sponsorAmount)} submitted`, tone: "success" } });
      if (i === 3 && request) dispatch(approveRequest(request.id), { sound: "success", toast: { title: `${request.ref} verified`, tone: "success" } });
      if (i === 4 && request) dispatch(fundRequest(request.id, remainingOf(request), "sponsor"), { sound: "unlock", toast: { title: `${usd(remainingOf(request))} contributed`, body: `Sponsor balance updated.`, tone: "success" } });
    },
    [dispatch, opp, plan, request],
  );

  const go = useCallback(
    (to: number) => {
      const next = Math.max(0, Math.min(STAGES.length - 1, to));
      dispatch(setDemo({ stage: next }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [dispatch],
  );

  const onNext = () => {
    if (!done[stage]) act(stage);
    else go(stage + 1);
  };

  const restart = () => {
    reset();
    setTimeout(() => router.push("/demo"), 0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") go(stage - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!opp || !plan) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="font-pixel text-xl">Demo data is missing.</p>
        <button type="button" className="btn-primary mt-4" onClick={restart}>
          <RotateCcw size={16} /> Restart demo
        </button>
      </div>
    );
  }

  const RoleIcon = ROLE_META[s.role].icon;
  const isLast = stage === STAGES.length - 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-pixel text-xs uppercase tracking-[0.2em] text-terraink">Judge demo mode · about 2 minutes</p>
          <h1 className="font-pixel text-3xl">From $110 gap to opportunity unlocked</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost btn-sm" onClick={restart}>
            <RotateCcw size={14} /> Restart
          </button>
          <Link href="/" className="btn-ghost btn-sm">
            <LogOut size={14} /> Exit demo
          </Link>
        </div>
      </div>

      {stage === 0 && !pristine && (
        <div className="mb-4 flex flex-col gap-2 border-2 border-line bg-gold/30 p-3 text-sm sm:flex-row sm:items-center sm:justify-between" role="status">
          <span className="flex items-center gap-2">
            <AlertTriangle size={16} /> Demo data has changed since the last reset. Restart for the exact $500 → $440 walkthrough.
          </span>
          <button type="button" className="btn-ghost btn-sm" onClick={restart}>
            Restart now
          </button>
        </div>
      )}

      <ol className="mb-6 grid grid-cols-7 gap-1.5" aria-label="Demo stages">
        {STAGES.map((st, i) => (
          <li key={st.title}>
            <button
              type="button"
              onClick={() => go(i)}
              className={`flex w-full flex-col items-start gap-1 border-2 border-line px-2 py-1.5 text-left transition-colors ${i === stage ? "bg-gold text-[#232824] shadow-offset-sm" : done[i] && i < stage ? "bg-forest text-onforest" : "bg-surface text-muted hover:bg-raised"}`}
              aria-current={i === stage ? "step" : undefined}
            >
              <span className="flex items-center gap-1 font-pixel text-xs">
                {done[i] && i < stage ? <Check size={12} /> : i + 1}
              </span>
              <span className="hidden text-[11px] font-semibold leading-tight md:block">{st.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <aside className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={stage} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="panel p-5">
              <p className="font-pixel text-xs uppercase tracking-[0.2em] text-terraink">{s.kicker}</p>
              <h2 className="mt-1 font-pixel text-2xl">{s.title}</h2>
              <p className="mt-3 text-sm">{s.narrative}</p>
              <div className="mt-4 border-2 border-dashed border-line/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Your move</p>
                <p className="mt-0.5 flex items-start gap-2 text-sm font-semibold">
                  {done[stage] ? <Check size={16} className="mt-0.5 shrink-0 text-forest" /> : <ArrowRight size={16} className="mt-0.5 shrink-0" />}
                  {s.task}
                </p>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                Viewing as
                <span className="inline-flex items-center gap-1 border-2 border-line bg-forest px-1.5 py-0.5 font-semibold text-onforest">
                  <RoleIcon size={12} /> {ROLE_META[s.role].label}
                </span>
              </p>
              {s.link && (
                <Link href={s.link.href} className="mt-2 inline-block text-xs font-semibold text-forest hover:underline">
                  {s.link.label} →
                </Link>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={() => go(stage - 1)} disabled={stage === 0}>
              <ArrowLeft size={16} /> Back
            </button>
            {isLast ? (
              <Link href="/" className="btn-primary flex-1">
                Finish <Check size={16} />
              </Link>
            ) : (
              <button type="button" className={`flex-1 ${done[stage] ? "btn-primary" : "btn-gold"}`} onClick={onNext}>
                {done[stage] ? (
                  <>
                    Next <ArrowRight size={16} />
                  </>
                ) : (
                  "Do it for me"
                )}
              </button>
            )}
          </div>
          <p className="text-center text-[11px] text-muted">Tip: use ← → arrow keys. Every action updates the real student, sponsor and institution views.</p>
        </aside>

        <Window title={`${ROLE_META[s.role].label} view · ${s.title}`} tone={s.role === "institution" ? "ink" : s.role === "sponsor" ? "terra" : "forest"}>
          <AnimatePresence mode="wait">
            <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {stage === 0 && <StudentIntro state={state} />}
              {stage === 1 && <ScanStage state={state} scanned={state.demo.scanned} onScan={() => act(1)} />}
              {stage === 2 && <EngineStage key={request && request.status !== "Draft" ? "submitted" : "new"} plan={plan} request={request && request.status !== "Draft" ? request : undefined} onSubmit={() => act(2)} />}
              {stage === 3 && <VerifyStage state={state} request={request} onApprove={() => act(3)} />}
              {stage === 4 && <SponsorStage state={state} request={request} onContribute={() => act(4)} />}
              {stage === 5 && <UnlockStage state={state} />}
              {stage === 6 && <ImpactStage state={state} request={request} />}
            </motion.div>
          </AnimatePresence>
        </Window>
      </div>
    </div>
  );
}
