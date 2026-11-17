"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, LogOut, RotateCcw } from "lucide-react";
import type { Role } from "@/lib/types";
import { Hydrated, useStore } from "@/lib/store";
import { applyEnginePlan, approveRequest, confirmCompleted, fundRequest, remainingOf, setDemo, setRole, setSponsor } from "@/lib/actions";
import { DEMO_OPPORTUNITY_ID, DEMO_SPONSOR_ID } from "@/lib/seed";
import { oppOf, requestForOpp } from "@/lib/selectors";
import { planFor } from "@/lib/plan";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { ROLE_META } from "@/components/app/nav";
import { SceneEngine, SceneFund, SceneImpact, SceneScan, SceneSecured, SceneStudent, SceneVerify } from "@/components/demo/scenes";

interface Scene {
  title: string;
  role: Role;
  story: string;
  task: string;
  link: { href: string; label: string };
}

const SCENES: Scene[] = [
  { title: "Student problem", role: "student", story: "Amina has earned a seat on a $180 certification exam. She has $70 — leaving a $110 gap that could cost her the opportunity.", task: "Meet Amina, then continue.", link: { href: "/student", label: "Open the student dashboard" } },
  { title: "Financial analysis", role: "student", story: "The Financial Barrier Scanner turns “I can't afford it” into an exact, itemised shortfall with a deadline and urgency.", task: "Run the Barrier Scanner.", link: { href: "/student/scanner", label: "Open the full scanner" } },
  { title: "BridgeEngine", role: "student", story: "BridgeEngine checks waivers, free alternatives, discounts, borrowing, institutional help and grants — in that order — before anyone is asked for money.", task: "Activate BridgeEngine and submit the reduced request.", link: { href: "/student/engine", label: "Open BridgeEngine" } },
  { title: "Verification", role: "institution", story: "Amina's school reviews the request privately. Verifying it confirms the estimated waiver and publishes the remaining need to sponsors.", task: "Review and verify the $60 request.", link: { href: "/institution", label: "Open the institution dashboard" } },
  { title: "Funding", role: "sponsor", story: "A sponsor with a $500 simulated balance sees only the verified goal and the exact remaining amount.", task: "Contribute $60 and watch every dashboard update.", link: { href: "/sponsor/marketplace", label: "Open the marketplace" } },
  { title: "Opportunity secured", role: "student", story: "Back on Amina's dashboard, the gap is closed and every source is accounted for — nothing counted twice.", task: "Review the final breakdown.", link: { href: "/student", label: "Open Amina's dashboard" } },
  { title: "Impact", role: "sponsor", story: "The sponsor receives a transparent impact receipt showing exactly how cost reduction and targeted assistance resolved the barrier.", task: "Review the receipt — optionally confirm the provider payment.", link: { href: "/sponsor", label: "Open the sponsor dashboard" } },
];

function Demo() {
  const { state, dispatch, reset } = useStore();
  const stage = Math.min(state.demo.stage, SCENES.length - 1);
  const s = SCENES[stage];
  const opp = oppOf(state, DEMO_OPPORTUNITY_ID);
  const request = requestForOpp(state, DEMO_OPPORTUNITY_ID);
  const submitted = request && request.status !== "Draft" ? request : undefined;
  const plan = useMemo(() => (opp ? planFor(state, opp) : null), [opp, state]);
  const fullyFunded = !!request && request.funded > 0 && remainingOf(request) <= 0;

  const done = [true, state.demo.scanned, !!submitted, !!request && ["Verified", "Partially Funded", "Fully Funded", "Completed"].includes(request.status), fullyFunded, fullyFunded, fullyFunded];
  const pristine = !request && state.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)?.balance === 500;

  useEffect(() => {
    if (state.role !== s.role) dispatch(setRole(s.role));
    if (state.currentSponsorId !== DEMO_SPONSOR_ID) dispatch(setSponsor(DEMO_SPONSOR_ID));
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = useCallback(
    (i: number) => {
      if (!opp || !plan) return;
      if (i === 1) dispatch(setDemo({ scanned: true }));
      if (i === 2 && !submitted) dispatch(applyEnginePlan(opp.id, plan, true), { success: `${usd(plan.sponsorAmount)} request submitted`, description: `${usd(plan.reductionsTotal)} saved before asking sponsors.` });
      if (i === 3 && request) dispatch(approveRequest(request.id), { success: `${request.ref} verified`, description: "Waiver confirmed. Need published to sponsors." });
      if (i === 4 && request) dispatch(fundRequest(request.id, remainingOf(request), "sponsor"), { success: `${usd(remainingOf(request))} contributed`, description: "Student, institution and sponsor dashboards updated." });
    },
    [dispatch, opp, plan, request, submitted],
  );

  const go = useCallback((to: number) => {
    dispatch(setDemo({ stage: Math.max(0, Math.min(SCENES.length - 1, to)) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  const next = () => (done[stage] ? go(stage + 1) : act(stage));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName) || document.querySelector('[role="dialog"]')) return;
      if (e.key === "ArrowRight" && stage < SCENES.length - 1) next();
      if (e.key === "ArrowLeft") go(stage - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

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

  const RoleIcon = ROLE_META[s.role].icon;
  const last = stage === SCENES.length - 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      {stage === 0 && !pristine && (
        <div className="mb-5 flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/40 sm:flex-row sm:items-center sm:justify-between" role="status">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" /> Demo data has changed since the last reset. Restart for the exact $500 → $440 walkthrough.
          </span>
          <Button size="sm" variant="outline" onClick={reset}>
            Restart demo
          </Button>
        </div>
      )}

      <nav aria-label="Demo progress" className="mb-6">
        <ol className="grid grid-cols-7 gap-2">
          {SCENES.map((sc, i) => (
            <li key={sc.title}>
              <button type="button" onClick={() => go(i)} className="group w-full text-left focus-visible:outline-none" aria-current={i === stage ? "step" : undefined}>
                <span className={cn("block h-1.5 rounded-full transition-colors", i < stage ? "bg-primary" : i === stage ? "bg-primary/60" : "bg-secondary group-hover:bg-muted-foreground/30")} />
                <span className={cn("mt-2 hidden items-center gap-1 text-xs md:flex", i === stage ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {i < stage ? <Check className="h-3 w-3 text-primary" /> : <span className="tabular">{i + 1}.</span>} {sc.title}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-muted-foreground md:hidden">
          Scene {stage + 1} of {SCENES.length} · {s.title}
        </p>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={stage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <Card>
                <CardContent className="space-y-4 p-5">
                  <p className="text-xs font-medium text-primary">Scene {stage + 1} of {SCENES.length}</p>
                  <h1 className="text-2xl font-semibold tracking-tight">{s.title}</h1>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{s.story}</p>
                  <div className="rounded-lg border border-dashed p-3">
                    <p className="text-xs text-muted-foreground">Your move</p>
                    <p className="mt-0.5 flex items-start gap-2 text-sm font-medium">
                      {done[stage] ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />} {s.task}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
                      Viewing as
                      <Badge variant="accent">
                        <RoleIcon /> {ROLE_META[s.role].label}
                      </Badge>
                    </span>
                    <Link href={s.link.href} className="font-medium text-primary hover:underline">
                      {s.link.label}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => go(stage - 1)} disabled={stage === 0}>
              <ArrowLeft /> Back
            </Button>
            {last ? (
              <Button asChild className="flex-1">
                <Link href="/">
                  Finish <Check />
                </Link>
              </Button>
            ) : (
              <Button className="flex-1" variant={done[stage] ? "default" : "soft"} onClick={next}>
                {done[stage] ? (
                  <>
                    Next <ArrowRight />
                  </>
                ) : (
                  "Do it for me"
                )}
              </Button>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground">Use ← → keys. Every action updates the real student, institution and sponsor dashboards.</p>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <RoleIcon className="h-3.5 w-3.5" /> {ROLE_META[s.role].label} view
            </span>
            <span>Simulated environment · no real money</span>
          </div>
          <CardContent className="p-5 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div key={stage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {stage === 0 && <SceneStudent state={state} />}
                {stage === 1 && <SceneScan state={state} scanned={state.demo.scanned} onScan={() => act(1)} />}
                {stage === 2 && <SceneEngine key={submitted ? "submitted" : "new"} state={state} plan={plan} request={submitted} onSubmit={() => act(2)} />}
                {stage === 3 && <SceneVerify state={state} request={submitted} onApprove={() => act(3)} />}
                {stage === 4 && <SceneFund state={state} request={submitted} onContribute={() => act(4)} />}
                {stage === 5 && <SceneSecured state={state} />}
                {stage === 6 && <SceneImpact state={state} request={submitted} onComplete={() => submitted && dispatch(confirmCompleted(submitted.id), { success: "Provider payment confirmed", description: "The receipt now shows a completion date." })} />}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DemoHeader() {
  const { reset } = useStore();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Logo />
        <Badge variant="accent" className="hidden sm:inline-flex">
          Interactive demo · ~2 minutes
        </Badge>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw /> Restart Demo
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <LogOut /> Exit Demo
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default function DemoPage() {
  return (
    <Hydrated fallback={<div className="mx-auto mt-24 h-96 max-w-5xl animate-pulse rounded-xl bg-muted" />}>
      <DemoHeader />
      <main id="main">
        <Demo />
      </main>
    </Hydrated>
  );
}
