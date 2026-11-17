"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BadgeCheck, LogOut, RotateCcw } from "lucide-react";
import type { Role } from "@/lib/types";
import { Hydrated, useStore } from "@/lib/store";
import { applyEnginePlan, approveRequest, confirmCompleted, currentSponsor, fundRequest, remainingOf, setDemo, setRole, setSponsor } from "@/lib/actions";
import { DEMO_OPPORTUNITY_ID, DEMO_SPONSOR_ID } from "@/lib/seed";
import { oppOf, requestForOpp } from "@/lib/selectors";
import { planFor } from "@/lib/plan";
import { fmtMultiplier, requestImpact } from "@/lib/impact";
import { aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { AnimatedNumber } from "@/components/shared/kit";
import { ROLE_META } from "@/components/app/nav";

const SCENES: { tag: string; role: Role; cta: string }[] = [
  { tag: "The barrier", role: "student", cta: "Run BridgeEngine" },
  { tag: "BridgeEngine", role: "student", cta: "Verify as her school" },
  { tag: "Verified", role: "institution", cta: "Fund as a sponsor" },
  { tag: "Funded", role: "sponsor", cta: "See the impact" },
  { tag: "Impact", role: "sponsor", cta: "Replay" },
];

function Demo() {
  const { state, dispatch, reset } = useStore();
  const stage = Math.min(state.demo.stage, SCENES.length - 1);
  const opp = oppOf(state, DEMO_OPPORTUNITY_ID);
  const plan = useMemo(() => (opp ? planFor(state, opp) : null), [opp, state]);
  const r = requestForOpp(state, DEMO_OPPORTUNITY_ID);
  const sponsor = currentSponsor(state);
  const demoSponsor = state.sponsors.find((x) => x.id === DEMO_SPONSOR_ID);
  const pristine = !r && demoSponsor?.balance === demoSponsor?.startingBalance;

  useEffect(() => {
    const role = SCENES[stage].role;
    if (state.role !== role) dispatch(setRole(role));
    if (state.currentSponsorId !== DEMO_SPONSOR_ID) dispatch(setSponsor(DEMO_SPONSOR_ID));
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback((n: number) => dispatch(setDemo({ stage: Math.max(0, Math.min(SCENES.length - 1, n)) })), [dispatch]);

  const advance = useCallback(() => {
    if (!opp || !plan) return;
    if (stage === 0 && !r) dispatch(applyEnginePlan(opp.id, plan, true));
    if (stage === 1 && r && ["Submitted", "Under Review"].includes(r.status)) dispatch(approveRequest(r.id));
    if (stage === 2 && r && remainingOf(r) > 0) dispatch(fundRequest(r.id, remainingOf(r), "sponsor"));
    if (stage === 3 && r?.status === "Fully Funded") dispatch(confirmCompleted(r.id));
    if (stage === 4) {
      reset();
      return;
    }
    go(stage + 1);
  }, [dispatch, go, opp, plan, r, reset, stage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === "ArrowRight") advance();
      if (e.key === "ArrowLeft") go(stage - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, go, stage]);

  if (!opp || !plan) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-medium">Demo data is missing.</p>
        <Button onClick={reset}>
          <RotateCcw /> Restart demo
        </Button>
      </div>
    );
  }

  const total = plan.totalCost;
  const own = plan.studentFunds;
  const sumKind = (k: string) => plan.phases.filter((p) => p.kind === k).flatMap((p) => p.findings).reduce((a, f) => a + f.amount, 0);
  const borrowed = stage >= 1 ? sumKind("borrow") : 0;
  const school = stage >= 1 ? sumKind("institutional") : 0;
  const otherSavings = stage >= 1 ? plan.reductionsTotal - sumKind("borrow") - sumKind("institutional") : 0;
  const savings = borrowed + school + otherSavings;
  const sponsorPart = stage >= 3 ? plan.sponsorAmount : 0;
  const gap = Math.max(total - own - savings - sponsorPart, 0);
  const impact = r ? requestImpact(r, state.contributions) : null;

  const captions = [
    <>Mariam, Grade 11 in Abu Dhabi, wants to enter a STEM competition. It costs {aed(total)}; she has {aed(own)}.</>,
    <>BridgeEngine found a kit to borrow ({aed(sumKind("borrow"))}) and school travel support ({aed(sumKind("institutional"))}). Sponsors are asked for {aed(plan.sponsorAmount)}, not {aed(plan.initialGap)}.</>,
    <>Her school checked the costs and confirmed the help.</>,
    <>A sponsor covered the last {aed(plan.sponsorAmount)} — paid straight to the providers.</>,
    <>
      {aed(impact?.resolved ?? plan.initialGap)} of barriers resolved with {aed(impact?.sponsor ?? plan.sponsorAmount)} from a sponsor.
    </>,
  ];
  const big = stage === 4 ? fmtMultiplier(impact?.multiplier ?? null) : null;
  const label = ["missing", "left to fund", "verified need", "left — fully funded", "impact multiplier"][stage];
  const RoleIcon = ROLE_META[SCENES[stage].role].icon;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl flex-col px-4 py-8 md:py-12">
      <ol className="grid grid-cols-5 gap-2" aria-label="Demo progress">
        {SCENES.map((s, i) => (
          <li key={s.tag}>
            <button type="button" onClick={() => go(i)} disabled={i > stage} className="w-full text-start disabled:cursor-default focus-visible:outline-none" aria-current={i === stage ? "step" : undefined}>
              <span className="block h-1.5 overflow-hidden rounded-full bg-secondary">
                <motion.span className="block h-full bg-primary" initial={false} animate={{ width: i <= stage ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
              </span>
              <span className={cn("mt-2 hidden text-xs sm:block", i === stage ? "font-medium text-foreground" : "text-muted-foreground")}>{s.tag}</span>
            </button>
          </li>
        ))}
      </ol>

      {stage === 0 && !pristine && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm" role="status">
          <span className="text-muted-foreground">Demo data was changed.</span>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw /> Restart
          </Button>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
        <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <RoleIcon className="h-4 w-4" /> {SCENES[stage].tag}
        </p>
        <div className="mt-4 flex items-center gap-3">
          {stage === 2 && <BadgeCheck className="h-12 w-12 text-primary md:h-16 md:w-16" strokeWidth={1.5} />}
          <p className={cn("text-6xl font-semibold tracking-tight tabular md:text-8xl", (stage === 3 || stage === 4) && "text-primary")}>{big ?? <AnimatedNumber value={gap} />}</p>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">{label}</p>

        <AnimatePresence mode="wait">
          <motion.p key={stage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="mt-8 max-w-xl text-xl font-medium leading-snug md:text-2xl">
            {captions[stage]}
          </motion.p>
        </AnimatePresence>

        <div className="mt-10 w-full max-w-xl">
          <div className="flex h-4 overflow-hidden rounded-full bg-secondary" role="img" aria-label={`Own funds ${aed(own)}, borrowed ${aed(borrowed)}, school ${aed(school)}, sponsor ${aed(sponsorPart)}, remaining ${aed(gap)}`}>
            <motion.div className="bg-slate-400" initial={false} animate={{ width: `${(own / total) * 100}%` }} />
            <motion.div className="bg-emerald-200" initial={false} animate={{ width: `${(borrowed / total) * 100}%` }} transition={{ duration: 0.7 }} />
            <motion.div className="bg-emerald-400" initial={false} animate={{ width: `${((school + otherSavings) / total) * 100}%` }} transition={{ duration: 0.7 }} />
            <motion.div className="bg-primary" initial={false} animate={{ width: `${(sponsorPart / total) * 100}%` }} transition={{ duration: 0.7 }} />
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <Legend color="bg-slate-400" label="Her savings" value={own} />
            <Legend color="bg-emerald-200" label="Borrowed kit" value={borrowed} />
            <Legend color="bg-emerald-400" label="School support" value={school + otherSavings} />
            <Legend color="bg-primary" label="Sponsor" value={sponsorPart} />
          </div>
          {stage >= 3 && <p className="mt-4 text-sm text-muted-foreground">Sponsor balance {aed(sponsor.balance)} of {aed(sponsor.startingBalance)}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => go(stage - 1)} disabled={stage === 0}>
          <ArrowLeft /> Back
        </Button>
        {stage === 4 && (
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/student">Explore the app</Link>
          </Button>
        )}
        <Button size="lg" onClick={advance}>
          {stage === 4 ? <RotateCcw /> : null} {SCENES[stage].cta} {stage < 4 && <ArrowRight />}
        </Button>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Fictional student · simulated money · each step updates the real dashboards</p>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} /> {label} <span className="font-medium text-foreground tabular">{aed(value)}</span>
    </span>
  );
}

function DemoHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Logo />
        <span className="hidden text-sm text-muted-foreground sm:inline">· 90-second demo</span>
        <Button asChild variant="ghost" size="sm" className="ms-auto">
          <Link href="/">
            <LogOut /> Exit
          </Link>
        </Button>
      </div>
    </header>
  );
}

export default function DemoPage() {
  return (
    <Hydrated fallback={<div className="mx-auto mt-24 h-96 max-w-3xl animate-pulse rounded-xl bg-muted" />}>
      <DemoHeader />
      <main id="main">
        <Demo />
      </main>
    </Hydrated>
  );
}
