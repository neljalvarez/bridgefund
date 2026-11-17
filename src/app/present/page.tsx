"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, Expand, HandCoins, Minimize, RotateCcw, ScanSearch, Scissors, Send, ShieldCheck, Timer, X } from "lucide-react";
import type { AppState, StrategyId } from "@/lib/types";
import { createSeedState, DEMO_OPPORTUNITY_ID } from "@/lib/seed";
import { applyEnginePlan, approveRequest, confirmCompleted, fundRequest, remainingOf, currentSponsor } from "@/lib/actions";
import { oppOf, requestForOpp } from "@/lib/selectors";
import { planFor, strategiesFor } from "@/lib/plan";
import { simulate } from "@/lib/simulator";
import { summary, SCENARIOS } from "@/lib/business";
import { MARKETS } from "@/lib/regions";
import { fmtMultiplier } from "@/lib/impact";
import { usd } from "@/lib/format";
import { useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { DemoBadge } from "@/components/shared/kit";
import { EngineRun } from "@/components/student/EngineRun";
import { StrategyComparisonView } from "@/components/student/StrategyComparison";
import { RequestBreakdown, StatusTrack } from "@/components/shared/RequestBreakdown";
import { MultiplierStrip } from "@/components/demo/scenes";
import { GapDemo } from "@/components/marketing/GapDemo";

/* -------------------------------------------------------------- */

const SECTIONS = [
  { title: "The problem", seconds: 20 },
  { title: "Existing solution limitations", seconds: 20 },
  { title: "Introducing BridgeFund", seconds: 20 },
  { title: "BridgeEngine demonstration", seconds: 30 },
  { title: "Live student journey", seconds: 35 },
  { title: "Measurable social impact", seconds: 25 },
  { title: "Business model and scalability", seconds: 20 },
  { title: "Future vision", seconds: 10 },
];
const TOTAL = SECTIONS.reduce((a, s) => a + s.seconds, 0);

const H = ({ children, kicker }: { children: React.ReactNode; kicker: string }) => (
  <div className="mb-6">
    <p className="text-sm font-medium text-primary">{kicker}</p>
    <h2 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{children}</h2>
  </div>
);

function Problem() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <H kicker="01 · The problem">Small costs close big doors.</H>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Amina earned a seat on a <strong className="text-foreground">$180</strong> data-analyst certification exam. She has saved <strong className="text-foreground">$70</strong>. The registration deadline is weeks away. A <strong className="text-foreground">$110</strong> gap is all that stands between her and the credential.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">Amina is a fictional student. Her situation is not.</p>
      </div>
      <div className="grid gap-3">
        {[
          { v: "~30%", l: "of families in Kenya borrow to pay for education", s: "UNESCO GEM Report 2021/2" },
          { v: "33%", l: "of education spending is borne by households in low-income countries", s: "UNESCO GEM Report 2017/8" },
          { v: "+9 pts", l: "graduation within three terms after small emergency grants at Georgia State", s: "Ithaka S+R, 2022" },
        ].map((x) => (
          <Card key={x.l} className="flex items-center gap-5 p-5">
            <span className="w-24 shrink-0 text-3xl font-semibold tabular text-primary">{x.v}</span>
            <span>
              <span className="block text-sm">{x.l}</span>
              <span className="text-xs text-muted-foreground">{x.s}</span>
            </span>
          </Card>
        ))}
        <Link href="/why#evidence" target="_blank" className="text-xs font-medium text-primary hover:underline">
          Sources and full citations →
        </Link>
      </div>
    </div>
  );
}

function Limitations() {
  const rows = [
    { n: "Crowdfunding", t: "Asks for the whole gap; outcomes track the size of the organiser's network." },
    { n: "Scholarship directories", t: "Great for big awards, but discovery is not delivery — and rarely for a $110 exam fee." },
    { n: "Student loans", t: "Debt is disproportionate for a small, one-off cost." },
    { n: "Financial literacy apps", t: "Build long-term skills, but can't pay a fee due next week." },
    { n: "Emergency funds", t: "Valuable, but often manual, and pay full price for costs that could be waived." },
  ];
  return (
    <div>
      <H kicker="02 · Existing solution limitations">Good tools — built for different jobs.</H>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <Card key={r.n} className="p-5">
            <p className="font-semibold">{r.n}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.t}</p>
          </Card>
        ))}
        <Card className="flex flex-col justify-center border-primary/40 bg-primary-light/40 p-5 dark:bg-primary/10">
          <p className="font-semibold text-primary">The missing piece</p>
          <p className="mt-2 text-sm leading-relaxed">Nobody reduces the cost first, verifies the need, and funds exactly what remains — before the deadline.</p>
        </Card>
      </div>
    </div>
  );
}

function Introducing() {
  const steps = [
    { icon: ScanSearch, t: "Identify", b: "Itemise the exact barrier" },
    { icon: Scissors, t: "Reduce", b: "Waivers, alternatives, borrowing" },
    { icon: ShieldCheck, t: "Verify", b: "The school confirms the need" },
    { icon: HandCoins, t: "Fund", b: "Sponsors cover only what remains" },
  ];
  return (
    <div>
      <H kicker="03 · Introducing BridgeFund">Reduce the cost first. Then fund only what remains.</H>
      <ol className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.t} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
              <s.icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">
                {i + 1}. {s.t}
              </span>
              <span className="text-xs text-muted-foreground">{s.b}</span>
            </span>
          </li>
        ))}
      </ol>
      <GapDemo />
    </div>
  );
}

function EngineSection({ sb }: { sb: AppState }) {
  const opp = oppOf(sb, DEMO_OPPORTUNITY_ID)!;
  const plan = useMemo(() => planFor(sb, opp), [sb, opp]);
  const cmp = useMemo(() => strategiesFor(sb, opp), [sb, opp]);
  const [view, setView] = useState<"run" | "strategies">("run");
  const [sel, setSel] = useState<StrategyId | undefined>(cmp.recommended);
  const [runKey, setRunKey] = useState(0);
  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <H kicker="04 · BridgeEngine 2.0">Seven checks. Three strategies. No guarantees, only honest estimates.</H>
        <div role="tablist" className="mb-6 inline-flex shrink-0 rounded-lg border bg-muted/50 p-1">
          {(["run", "strategies"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} type="button" onClick={() => setView(v)} className={cn("rounded-md px-3 py-1.5 text-sm font-medium", view === v ? "bg-background shadow-sm" : "text-muted-foreground")}>
              {v === "run" ? "Live analysis" : "Strategy comparison"}
            </button>
          ))}
        </div>
      </div>
      {view === "run" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="min-w-0">
            <EngineRun plan={plan} runKey={runKey} seededAt={sb.seededAt} speed={550} onDone={() => undefined} />
          </div>
          <Card className="h-fit space-y-3 p-5">
            <p className="text-sm text-muted-foreground">Gap before</p>
            <p className="text-3xl font-semibold tabular">{usd(plan.initialGap)}</p>
            <p className="text-sm text-muted-foreground">Sponsor ask after</p>
            <p className="text-3xl font-semibold tabular text-primary">{usd(plan.sponsorAmount)}</p>
            <Button variant="outline" size="sm" onClick={() => setRunKey((k) => k + 1)}>
              <RotateCcw /> Replay
            </Button>
          </Card>
        </div>
      ) : (
        <StrategyComparisonView cmp={cmp} selected={sel} onSelect={setSel} />
      )}
    </div>
  );
}

function Journey({ sb, setSb }: { sb: AppState; setSb: (fn: (s: AppState) => AppState) => void }) {
  const opp = oppOf(sb, DEMO_OPPORTUNITY_ID)!;
  const plan = useMemo(() => planFor(sb, opp), [sb, opp]);
  const r = requestForOpp(sb, DEMO_OPPORTUNITY_ID);
  const sponsor = currentSponsor(sb);
  const steps = [
    { label: "Student submits", icon: Send, done: !!r && r.status !== "Draft", run: () => setSb(applyEnginePlan(opp.id, plan, true)) },
    { label: "School verifies", icon: BadgeCheck, done: !!r && ["Verified", "Partially Funded", "Fully Funded", "Completed"].includes(r.status), run: () => r && setSb(approveRequest(r.id)) },
    { label: "Sponsor funds", icon: HandCoins, done: !!r && ["Fully Funded", "Completed"].includes(r.status), run: () => r && setSb(fundRequest(r.id, remainingOf(r), "sponsor")) },
    { label: "Provider paid", icon: Check, done: r?.status === "Completed", run: () => r && setSb(confirmCompleted(r.id)) },
  ];
  const next = steps.findIndex((s) => !s.done);
  return (
    <div>
      <H kicker="05 · Live student journey">One request, three roles, one shared record.</H>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {steps.map((s, i) => (
            <Button key={s.label} className="w-full justify-start" variant={s.done ? "soft" : i === next ? "default" : "outline"} disabled={i !== next} onClick={s.run}>
              {s.done ? <Check /> : <s.icon />} {i + 1}. {s.label}
            </Button>
          ))}
          <div className="rounded-lg border p-3 text-sm">
            <p className="text-xs text-muted-foreground">{sponsor.name} balance</p>
            <p className="text-xl font-semibold tabular">{usd(sponsor.balance)}</p>
          </div>
          <p className="text-xs text-muted-foreground">Runs in a sandbox — the presentation never changes your demo data. Payments are simulated.</p>
        </div>
        <Card className="min-w-0 space-y-4 p-5">
          {r ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {r.ref} · {r.purpose}
                </p>
                <Badge variant="outline" className="border-dashed">
                  Simulated
                </Badge>
              </div>
              <StatusTrack status={r.status} />
              <RequestBreakdown r={r} state={sb} compact />
              {["Fully Funded", "Completed"].includes(r.status) && <MultiplierStrip state={sb} request={r} />}
            </>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              <p className="text-lg font-medium text-foreground">Amina&apos;s plan is ready: {usd(plan.reductionsTotal)} of reductions, {usd(plan.sponsorAmount)} left to fund.</p>
              <p className="mt-1 text-sm">Press “Student submits” to start.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ImpactSection() {
  const sim = simulate({ cost: 180, studentFunds: 70, waivers: 50, borrowing: 0, institutional: 0, sponsorBudget: 500, crowdFee: 0 });
  return (
    <div>
      <H kicker="06 · Measurable social impact">The BridgeFund Impact Multiplier.</H>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Financial barriers resolved ÷ sponsor funding used</p>
          <div className="mt-4 flex flex-wrap items-baseline gap-3 text-2xl font-semibold tabular md:text-3xl">
            <span>{usd(sim.shortfall)}</span>
            <span className="text-muted-foreground">÷</span>
            <span>{usd(sim.bridgeSponsorNeeded)}</span>
            <span className="text-muted-foreground">=</span>
            <span className="text-5xl text-primary">{fmtMultiplier(sim.multiplier)}</span>
          </div>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Original shortfall (after Amina&apos;s $70)</span>
              <span className="tabular">{usd(sim.shortfall)}</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Fee waiver secured</span>
              <span className="tabular">{usd(sim.reductions)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Sponsor funding required</span>
              <span className="tabular">{usd(sim.bridgeSponsorNeeded)}</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Student&apos;s own funds are never counted as platform impact.</p>
        </Card>
        <div className="grid gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">With a $500 sponsor budget, opportunities like Amina&apos;s could be rescued</p>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-4xl font-semibold tabular">{sim.opportunitiesA}</p>
                <p className="text-xs text-muted-foreground">funding the full gap</p>
              </div>
              <div>
                <p className="text-4xl font-semibold tabular text-primary">{sim.opportunitiesB}</p>
                <p className="text-xs text-muted-foreground">reducing costs first</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 text-sm text-muted-foreground">
            We report three things separately: <strong className="text-foreground">barriers resolved</strong>, <strong className="text-foreground">participation</strong>, and <strong className="text-foreground">confirmed outcomes</strong>.{" "}
            <Link href="/impact" target="_blank" className="font-medium text-primary hover:underline">
              Open the impact dashboard →
            </Link>
          </Card>
          <DemoBadge>Simulation estimate</DemoBadge>
        </div>
      </div>
    </div>
  );
}

function Business() {
  const s = summary({ clients: 12, price: 250, programs: 2, programFee: 400, opex: 7000, requestsPerClient: 15, verificationCost: 2.5, cac: 800 }, "moderate");
  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;
  return (
    <div>
      <H kicker="07 · Business model and scalability">Students never pay. Institutions and programmes do.</H>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <p className="font-semibold">Revenue</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Institutional subscriptions for verification, lending inventory and analytics</li>
            <li>• Management fees on sponsored CSR and foundation programmes</li>
            <li>• Nonprofit licensing partnerships</li>
          </ul>
          <div className="grid grid-cols-3 gap-3 border-t pt-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Break-even</p>
              <p className="text-xl font-semibold tabular">{s.breakEvenClients} schools</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Break-even month</p>
              <p className="text-xl font-semibold tabular">{s.breakEvenMonth ?? "24+"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Month-24 revenue</p>
              <p className="text-xl font-semibold tabular">{fmt(s.rows[23].revenue)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Hypothetical {SCENARIOS.moderate.label.toLowerCase()} scenario. Adjust every assumption on the business page.</p>
        </Card>
        <Card className="p-6">
          <p className="font-semibold">Expansion through institutions</p>
          <ol className="mt-4 space-y-2">
            {MARKETS.map((m) => (
              <li key={m.country} className="flex items-center justify-between text-sm">
                <span>{m.country}</span>
                <Badge variant={m.phase === "Launch market" ? "success" : "neutral"}>{m.phase}</Badge>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">Currencies, programmes, eligibility and language are configured per country. No partnerships agreed yet.</p>
        </Card>
      </div>
    </div>
  );
}

function Vision() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <H kicker="08 · Future vision">No student should miss an opportunity over a gap this small.</H>
      <div className="grid gap-3 text-left sm:grid-cols-3">
        {[
          { t: "Next term", b: "A one-school pilot in Nairobi with manual verification and a lending inventory." },
          { t: "Year one", b: "Regional sponsors, published pilot results, and verified programme data." },
          { t: "Beyond", b: "A shared layer that helps institutions reduce costs before anyone has to fundraise." },
        ].map((x) => (
          <Card key={x.t} className="p-5">
            <p className="font-semibold text-primary">{x.t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{x.b}</p>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/demo">Try the full demo</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/pilot">See the pilot plan</Link>
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- */

function Presentation() {
  const [i, setI] = useState(0);
  const [sb, setSbState] = useState<AppState>(() => createSeedState());
  const setSb = useCallback((fn: (s: AppState) => AppState) => setSbState((s) => fn(s)), []);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [fs, setFs] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const go = useCallback((n: number) => setI(Math.max(0, Math.min(SECTIONS.length - 1, n))), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(i + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(i - 1);
      } else if (/^[1-8]$/.test(e.key)) go(Number(e.key) - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(SECTIONS.length - 1);
      else if (e.key.toLowerCase() === "f") toggleFs();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  function toggleFs() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else root.current?.requestFullscreen?.().catch(() => undefined);
  }

  const planned = SECTIONS.slice(0, i + 1).reduce((a, s) => a + s.seconds, 0);
  const mmss = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  const over = elapsed > planned + 10;

  return (
    <div ref={root} className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-4 border-b px-4 py-3 md:px-8">
        <Logo />
        <nav aria-label="Presentation sections" className="hidden flex-1 justify-center lg:flex">
          <ol className="flex gap-1">
            {SECTIONS.map((s, n) => (
              <li key={s.title}>
                <button type="button" onClick={() => go(n)} aria-current={n === i ? "step" : undefined} className={cn("rounded-md px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", n === i ? "bg-primary-light font-medium text-primary dark:bg-primary/15" : "text-muted-foreground hover:text-foreground")}>
                  {n + 1}. {s.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setRunning((r) => !r)} className={cn("flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs tabular", over ? "border-amber-300 text-warning" : "text-muted-foreground")} aria-label={running ? "Pause timer" : "Resume timer"} title="Pause or resume the timer">
            <Timer className="h-3.5 w-3.5" /> {mmss(elapsed)} / {mmss(TOTAL)}
          </button>
          <Button variant="ghost" size="icon" onClick={toggleFs} aria-label={fs ? "Exit fullscreen" : "Enter fullscreen"}>
            {fs ? <Minimize /> : <Expand />}
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Exit presentation">
            <Link href="/">
              <X />
            </Link>
          </Button>
        </div>
      </header>
      <div className="h-1 bg-secondary">
        <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${((i + 1) / SECTIONS.length) * 100}%` }} />
      </div>

      <main id="main" className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
          <AnimatePresence mode="wait">
            <motion.section key={i} aria-label={SECTIONS[i].title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {i === 0 && <Problem />}
              {i === 1 && <Limitations />}
              {i === 2 && <Introducing />}
              {i === 3 && <EngineSection sb={sb} />}
              {i === 4 && <Journey sb={sb} setSb={setSb} />}
              {i === 5 && <ImpactSection />}
              {i === 6 && <Business />}
              {i === 7 && <Vision />}
            </motion.section>
          </AnimatePresence>
        </div>
      </main>

      <footer className="flex items-center justify-between gap-3 border-t px-4 py-3 md:px-8">
        <Button variant="outline" onClick={() => go(i - 1)} disabled={i === 0}>
          <ArrowLeft /> Back
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {i + 1} / {SECTIONS.length}
          </span>{" "}
          · {SECTIONS[i].title} · ~{SECTIONS[i].seconds}s
          <span className="hidden md:inline"> · ← → or 1–8 to navigate · F for fullscreen</span>
        </p>
        {i < SECTIONS.length - 1 ? (
          <Button onClick={() => go(i + 1)}>
            Next <ArrowRight />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setSbState(createSeedState());
              setElapsed(0);
              go(0);
            }}
          >
            <RotateCcw /> Restart
          </Button>
        )}
      </footer>
    </div>
  );
}

export default function PresentPage() {
  const ready = useHydrated();
  if (!ready) return <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading presentation" />;
  return <Presentation />;
}
