"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BarChart3, BadgeCheck, Check, Compass, LogOut, MapPin, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import type { AppState, Role } from "@/lib/types";
import { Hydrated, useLocale, useStore } from "@/lib/store";
import { setDemo, setRole, setSponsor } from "@/lib/actions";
import { DEMO_STEPS } from "@/lib/demo";
import { DEMO_OPPORTUNITY_ID, DEMO_SPONSOR_ID, DEMO_STUDENT_ID } from "@/lib/seed";
import { oppOf, requestForOpp } from "@/lib/selectors";
import { planFor } from "@/lib/plan";
import { fmtMultiplier, requestImpact } from "@/lib/impact";
import { anonId } from "@/lib/uae";
import { aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { AnimatedNumber, DemoBadge } from "@/components/shared/kit";
import { GapBar, GAP_COLORS } from "@/components/shared/GapBar";
import { PHASE_ICON } from "@/components/student/EngineRun";
import { ROLE_META } from "@/components/app/nav";
import { JudgeMode } from "@/components/app/JudgeMode";

/** English / Arabic for the demo's own words (Arabic shown when the interface is in Arabic). */
function useL() {
  const ar = useLocale() === "ar";
  return (en: string, arabic: string) => (ar ? arabic : en);
}

const SCENES: { tag: [string, string]; role: Role; cta: [string, string]; who: [string, string] }[] = [
  { tag: ["The barrier", "العائق"], role: "student", who: ["Student", "الطالبة"], cta: ["Run BridgeEngine", "شغّل BridgeEngine"] },
  { tag: ["BridgeEngine", "BridgeEngine"], role: "student", who: ["Student", "الطالبة"], cta: ["Send to her school", "أرسل إلى مدرستها"] },
  { tag: ["Verified", "تم التحقق"], role: "institution", who: ["School", "المدرسة"], cta: ["Fund as a sponsor", "موّل كداعم"] },
  { tag: ["Funded", "تم التمويل"], role: "sponsor", who: ["Sponsor", "الداعم"], cta: ["See the result", "اعرض النتيجة"] },
  { tag: ["Secured", "النتيجة"], role: "sponsor", who: ["Result", "النتيجة"], cta: ["Replay demo", "أعد العرض"] },
];

function Demo() {
  const { state, dispatch, reset } = useStore();
  const L = useL();
  const stage = Math.min(state.demo.stage, SCENES.length - 1);
  const opp = oppOf(state, DEMO_OPPORTUNITY_ID);
  const plan = useMemo(() => (opp ? planFor(state, opp) : null), [opp, state]);
  const sponsor = state.sponsors.find((x) => x.id === DEMO_SPONSOR_ID);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const role = SCENES[stage].role;
    if (state.role !== role) dispatch(setRole(role));
    if (state.currentSponsorId !== DEMO_SPONSOR_ID) dispatch(setSponsor(DEMO_SPONSOR_ID));
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback((n: number) => dispatch(setDemo({ stage: Math.max(0, Math.min(SCENES.length - 1, n)) })), [dispatch]);

  const advance = useCallback(() => {
    if (busy) return;
    setBusy(true);
    window.setTimeout(() => setBusy(false), 450); // debounce double-clicks during a live pitch
    if (stage === 4) {
      reset({ silent: true });
      return;
    }
    // Starting over from step 1 always begins from clean demo data, whatever a judge did before.
    if (stage === 0) reset({ silent: true });
    dispatch(DEMO_STEPS[stage]);
    go(stage + 1);
  }, [busy, dispatch, go, reset, stage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"]') || e.altKey || e.metaKey || e.ctrlKey) return;
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      const rtl = document.documentElement.dir === "rtl"; // "forward" points left in Arabic
      if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) advance();
      if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) go(stage - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, go, stage]);

  if (!opp || !plan || !sponsor) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-medium">Demo data is missing.</p>
        <Button onClick={() => reset()}>
          <RotateCcw /> Restore demo data
        </Button>
      </div>
    );
  }

  const sumKind = (k: string) => plan.phases.filter((p) => p.kind === k).flatMap((p) => p.findings).reduce((a, f) => a + f.amount, 0);
  const borrowed = stage >= 1 ? sumKind("borrow") : 0;
  const school = stage >= 1 ? plan.reductionsTotal - sumKind("borrow") : 0;
  const sponsorPart = stage >= 3 ? plan.sponsorAmount : 0;
  const gap = Math.max(plan.totalCost - plan.studentFunds - borrowed - school - sponsorPart, 0);
  const segments = [
    { key: "own", label: L("Her savings", "مدخراتها"), value: plan.studentFunds, color: GAP_COLORS.own },
    { key: "borrow", label: L("Borrowed kit", "عُدّة مستعارة"), value: borrowed, color: GAP_COLORS.borrow },
    { key: "school", label: L("School support", "دعم المدرسة"), value: school, color: GAP_COLORS.school },
    { key: "sponsor", label: L("Sponsor", "الداعم"), value: sponsorPart, color: GAP_COLORS.sponsor },
  ];

  if (stage === 4) return <Success state={state} plan={{ initialGap: plan.initialGap, total: plan.totalCost, own: plan.studentFunds, borrowed, school, sponsor: plan.sponsorAmount }} segments={segments} onReplay={advance} onBack={() => go(3)} />;

  const caption = [
    L(`Mariam, Grade 11 in Abu Dhabi, made the national STEM competition. It costs ${aed(plan.totalCost)}. She has ${aed(plan.studentFunds)}.`, `مريم، طالبة في الصف الحادي عشر في أبوظبي، تأهلت لمسابقة وطنية في العلوم والتكنولوجيا. التكلفة ${aed(plan.totalCost)}، ولديها ${aed(plan.studentFunds)}.`),
    L(`BridgeEngine cut ${aed(plan.reductionsTotal)} before asking anyone for money.`, `خفّض BridgeEngine التكلفة بمقدار ${aed(plan.reductionsTotal)} قبل أن يطلب المال من أي أحد.`),
    L("Her school verified every cost — sponsors see an anonymous, checked need.", "تحققت مدرستها من كل تكلفة — ويرى الداعمون احتياجًا موثّقًا دون اسمها."),
    L(`A sponsor closed the last ${aed(plan.sponsorAmount)}, paid straight to the providers.`, `غطّى داعمٌ آخر ${aed(plan.sponsorAmount)}، ودُفعت مباشرة إلى مقدمي الخدمة.`),
  ][stage];
  const label = [L("missing", "ناقص"), L("left for sponsors", "متبقٍ للداعمين"), L("verified need", "احتياج موثّق"), L("missing — fully covered", "ناقص — مغطّى بالكامل")][stage];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col px-4 py-6 md:py-10">
      <Progress stage={stage} go={go} />

      <div className="grid flex-1 grid-cols-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-10">
        <div>
          <RoleChip role={SCENES[stage].role} who={L(...SCENES[stage].who)} tag={L(...SCENES[stage].tag)} />
          <div className="mt-4 flex items-center gap-3">
            {stage === 2 && <BadgeCheck className="h-12 w-12 shrink-0 text-primary md:h-14 md:w-14" strokeWidth={1.5} aria-hidden />}
            <p className={cn("text-6xl font-semibold tracking-tight md:text-7xl", stage === 3 && "text-primary")} aria-live="polite">
              <AnimatedNumber value={gap} />
            </p>
          </div>
          <p className="mt-1 text-lg text-muted-foreground">{label}</p>
          <AnimatePresence mode="wait">
            <motion.p key={stage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="mt-6 max-w-lg text-xl font-medium leading-snug md:text-2xl">
              {caption}
            </motion.p>
          </AnimatePresence>
          <GapBar className="mt-8 max-w-lg" total={plan.totalCost} segments={segments} size="lg" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={stage} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }}>
            {stage === 0 && <CostScreen opp={opp} own={plan.studentFunds} gap={plan.initialGap} />}
            {stage === 1 && <EngineScreen plan={plan} />}
            {stage === 2 && <VerifyScreen state={state} />}
            {stage === 3 && <SponsorScreen sponsorName={sponsor.name} balance={sponsor.balance} start={sponsor.startingBalance} amount={plan.sponsorAmount} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-5">
        <Button variant="ghost" onClick={() => go(stage - 1)} disabled={stage === 0}>
          <ArrowLeft /> {L("Back", "رجوع")}
        </Button>
        <p className="hidden text-xs text-muted-foreground md:block">{L("Fictional student · simulated money · press → to continue", "طالبة خيالية · أموال محاكاة · اضغط ← للمتابعة")}</p>
        <Button size="lg" onClick={advance} disabled={busy}>
          {L(...SCENES[stage].cta)} <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function Progress({ stage, go }: { stage: number; go: (n: number) => void }) {
  const L = useL();
  return (
    <ol className="grid grid-cols-5 gap-2" aria-label="Demo progress">
      {SCENES.map((s, i) => {
        const Icon = i === 4 ? Sparkles : ROLE_META[s.role].icon;
        return (
          <li key={s.tag[0]}>
            <button type="button" onClick={() => go(i)} disabled={i > stage} className="w-full rounded-sm text-start disabled:cursor-default" aria-current={i === stage ? "step" : undefined} aria-label={`${L("Step", "الخطوة")} ${i + 1}: ${L(...s.tag)} (${L(...s.who)})`}>
              <span className="block h-1.5 overflow-hidden rounded-full bg-secondary">
                <motion.span className="block h-full bg-primary" initial={false} animate={{ width: i <= stage ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
              </span>
              <span className={cn("mt-2 flex items-center gap-1.5 text-xs", i === stage ? "font-medium text-foreground" : "text-muted-foreground")}>
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="hidden truncate sm:inline">{L(...s.tag)}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function RoleChip({ role, who, tag }: { role: Role; who: string; tag: string }) {
  const Icon = ROLE_META[role].icon;
  const L = useL();
  return (
    <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm">
      <Icon className="h-4 w-4 text-primary" aria-hidden />
      <span className="font-medium">{L(`${who} view`, `واجهة ${who}`)}</span>
      <span className="text-muted-foreground">· {tag}</span>
    </p>
  );
}

function Screen({ title, children, foot }: { title: string; children: React.ReactNode; foot?: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
        </span>
        <p className="ms-2 truncate text-sm font-medium">{title}</p>
      </div>
      <div className="p-5">{children}</div>
      {foot && <div className="border-t bg-muted/40 px-5 py-3 text-sm">{foot}</div>}
    </div>
  );
}

const Row = ({ label, value, tone, delay = 0, icon }: { label: React.ReactNode; value: string; tone?: "save" | "muted" | "strong"; delay?: number; icon?: React.ReactNode }) => (
  <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }} className="flex items-center justify-between gap-3 py-2.5">
    <span className={cn("flex min-w-0 items-center gap-2.5", tone === "muted" && "text-muted-foreground", tone === "strong" && "font-medium")}>
      {icon}
      <span className="truncate">{label}</span>
    </span>
    <span className={cn("tabular", tone === "save" && "font-medium text-primary", tone === "strong" && "font-semibold", tone === "muted" && "text-muted-foreground")}>{value}</span>
  </motion.li>
);

function CostScreen({ opp, own, gap }: { opp: NonNullable<ReturnType<typeof oppOf>>; own: number; gap: number }) {
  const L = useL();
  const AR: Record<string, string> = { "Project materials": "مواد المشروع", Transportation: "المواصلات", "Competition-related expenses": "مصاريف المسابقة" };
  return (
    <Screen title={L("Get assistance · Costs", "طلب الدعم · التكاليف")} foot={<span className="flex justify-between font-medium"><span>{L("Her gap", "فجوتها")}</span><span className="tabular text-warning">{aed(gap)}</span></span>}>
      <ul className="divide-y text-sm">
        {opp.expenses.map((e, i) => (
          <Row key={e.id} label={L(e.label, AR[e.label] ?? e.label)} value={aed(e.amount)} delay={i * 0.12} />
        ))}
        <Row label={L("Her own savings", "مدخراتها")} value={`−${aed(own)}`} tone="muted" delay={0.4} />
      </ul>
    </Screen>
  );
}

function EngineScreen({ plan }: { plan: NonNullable<ReturnType<typeof planFor>> }) {
  const L = useL();
  const found = plan.phases.filter((p) => p.kind !== "sponsor").flatMap((p) => p.findings);
  return (
    <Screen
      title={L("BridgeEngine · 7 sources checked", "BridgeEngine · فحص 7 مصادر")}
      foot={
        <span className="flex justify-between font-medium">
          <span>{L("Sponsors are asked for", "يُطلب من الداعمين")}</span>
          <span className="tabular">
            {aed(plan.sponsorAmount)} <span className="font-normal text-muted-foreground line-through">{aed(plan.initialGap)}</span>
          </span>
        </span>
      }
    >
      <ul className="divide-y text-sm">
        {found.map((f, i) => {
          const Icon = PHASE_ICON[f.kind];
          return <Row key={f.id} label={L(f.title, f.kind === "borrow" ? "استعارة عُدّة مشروع STEM" : f.kind === "institutional" ? "دعم المدرسة للتنقل (مثال)" : f.title)} value={`−${aed(f.amount)}`} tone="save" delay={0.15 + i * 0.35} icon={<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary dark:bg-primary/15"><Icon className="h-4 w-4" aria-hidden /></span>} />;
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">{L("Waivers, free alternatives, discounts, borrowing, school support and grants are checked before sponsors.", "تُفحص الإعفاءات والبدائل المجانية والخصومات والاستعارة ودعم المدرسة والمنح قبل الداعمين.")}</p>
    </Screen>
  );
}

function VerifyScreen({ state }: { state: AppState }) {
  const L = useL();
  const r = requestForOpp(state, DEMO_OPPORTUNITY_ID);
  const student = state.students.find((s) => s.id === DEMO_STUDENT_ID);
  const school = state.institutions.find((i) => i.id === r?.institutionId);
  const checks = [
    { l: L("Enrolment confirmed", "تأكيد التسجيل"), ok: !!r?.checks?.enrollment },
    { l: L("Costs match the organiser's quotes", "التكاليف مطابقة لعروض المنظِّم"), ok: !!r?.checks?.expenses },
    { l: L("Guardian consent recorded", "موافقة ولي الأمر مسجّلة"), ok: r?.guardianConsent === "Given" },
    { l: L("Kit reserved from the lending library", "حجز العُدّة من مكتبة الإعارة"), ok: !!r?.reductions.some((x) => x.kind === "borrow" && x.confirmed) },
    { l: L("No duplicate funding found", "لا يوجد تمويل مكرر"), ok: true },
  ];
  return (
    <Screen title={`${school?.name ?? "School"} · ${L("Verification", "التحقق")}`} foot={<span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden /> <span>{L("Sponsors will see", "سيرى الداعمون")} <strong className="font-medium text-foreground">{anonId(DEMO_STUDENT_ID)}</strong> · {student?.emirate} — {L("never her name", "وليس اسمها")}</span></span>}>
      <ul className="space-y-1 text-sm">
        {checks.map((c, i) => (
          <motion.li key={c.l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.18 }} className="flex items-center gap-3 py-1.5">
            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", c.ok ? "bg-primary text-primary-foreground" : "border text-muted-foreground")}>
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
            {c.l}
            <span className="sr-only">{c.ok ? L("— done", "— تم") : L("— pending", "— قيد الانتظار")}</span>
          </motion.li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">{L("Checks advise staff — a person approves, never an algorithm.", "الفحوص تساعد الموظفين — يوافق إنسان، لا خوارزمية.")}</p>
    </Screen>
  );
}

function SponsorScreen({ sponsorName, balance, start, amount }: { sponsorName: string; balance: number; start: number; amount: number }) {
  const L = useL();
  return (
    <Screen title={`${sponsorName} · ${L("Verified needs", "احتياجات موثّقة")}`} foot={<span className="text-muted-foreground">{L("Paid directly to the providers · no cash to students · simulated", "يُدفع مباشرة لمقدمي الخدمة · لا نقد للطلاب · محاكاة")}</span>}>
      <div className="rounded-xl border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{L("STEM competition project", "مشروع مسابقة STEM")}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" aria-hidden /> {anonId(DEMO_STUDENT_ID)} · {L("Abu Dhabi · verified", "أبوظبي · موثّق")}
            </p>
          </div>
          <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/15">{L("Funded", "مموّل")}</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.9, delay: 0.2 }} />
        </div>
        <p className="mt-2 text-sm">
          <span className="font-medium tabular">{aed(amount)}</span> <span className="text-muted-foreground">{L("contributed · 100% of the need", "مساهمة · 100% من الاحتياج")}</span>
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs text-muted-foreground">{L("Budget before", "الميزانية قبل")}</p>
          <p className="mt-0.5 text-lg font-semibold tabular">{aed(start)}</p>
        </div>
        <div className="rounded-xl bg-primary-light p-3 dark:bg-primary/15">
          <p className="text-xs text-primary">{L("Budget left", "الميزانية المتبقية")}</p>
          <p className="mt-0.5 text-lg font-semibold tabular">
            <AnimatedNumber value={balance} />
          </p>
        </div>
      </div>
    </Screen>
  );
}

function Success({ state, plan, segments, onReplay, onBack }: { state: AppState; plan: { initialGap: number; total: number; own: number; borrowed: number; school: number; sponsor: number }; segments: { key: string; label: string; value: number; color: string }[]; onReplay: () => void; onBack: () => void }) {
  const r = requestForOpp(state, DEMO_OPPORTUNITY_ID);
  const impact = r ? requestImpact(r, state.contributions) : null;
  const multiplier = fmtMultiplier(impact?.multiplier ?? (plan.sponsor ? plan.initialGap / plan.sponsor : null));
  const conserved = plan.initialGap - plan.sponsor;
  const L = useL();
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-4xl flex-col px-4 py-5 md:py-6">
      <Progress stage={4} go={(n) => (n < 4 ? onBack() : undefined)} />
      <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <motion.span className="absolute inset-0 rounded-full bg-primary/15" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: [0.6, 1.5, 1.25], opacity: [0, 0.7, 0] }} transition={{ duration: 1.6, delay: 0.2 }} aria-hidden />
          <motion.span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
            <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
          </motion.span>
        </div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 text-balance text-4xl font-semibold tracking-tight md:text-[3.5rem] md:leading-[1.1]">
          {L("An opportunity secured.", "فرصةٌ مضمونة.")}
          <span className="block text-primary">{L("A future unlocked.", "ومستقبلٌ مفتوح.")}</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 text-lg text-muted-foreground">
          {L("Mariam competes. Her providers are paid. Her school has the record.", "مريم تشارك في المسابقة. دُفعت التكاليف لمقدمي الخدمة. ولدى مدرستها السجل الكامل.")}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-8 grid grid-cols-1 w-full gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">{L("Her gap", "فجوتها")}</p>
            <p className="mt-1 flex items-baseline justify-center gap-2 text-2xl font-semibold tabular">
              <span className="text-muted-foreground line-through decoration-2">{aed(plan.initialGap)}</span>
              <ArrowRight className="h-4 w-4 self-center text-muted-foreground" aria-hidden />
              <span className="text-primary">{aed(0)}</span>
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">{L("Impact multiplier", "مضاعِف الأثر")}</p>
            <p className="mt-1 text-2xl font-semibold tabular text-primary">{multiplier}</p>
            <p className="text-xs text-muted-foreground">{L(`${aed(plan.initialGap)} resolved per ${aed(plan.sponsor)} of sponsor money`, `${aed(plan.initialGap)} من العوائق مقابل ${aed(plan.sponsor)} من أموال الداعمين`)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">{L("Sponsor money conserved", "أموال داعمين موفَّرة")}</p>
            <p className="mt-1 text-2xl font-semibold tabular">{aed(conserved)}</p>
            <p className="text-xs text-muted-foreground">{L("free to help the next student", "متاحة لمساعدة الطالب التالي")}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-3 w-full rounded-2xl border bg-card p-5 text-start">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">{L(`How ${aed(plan.total)} was covered`, `كيف تمت تغطية ${aed(plan.total)}`)}</span>
            <DemoBadge>{L("Simulated", "محاكاة")}</DemoBadge>
          </div>
          <GapBar total={plan.total} segments={segments} size="lg" />
        </motion.div>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onReplay}>
          <RotateCcw /> {L("Replay demo", "أعد العرض")}
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" size="lg">
            <Link href="/impact">
              <BarChart3 /> {L("Impact analytics", "تحليلات الأثر")}
            </Link>
          </Button>
          <JudgeMode>
            <Button size="lg">
              <Compass /> {L("Explore freely", "استكشف بحرية")}
            </Button>
          </JudgeMode>
        </div>
      </div>
    </div>
  );
}

function DemoHeader() {
  const L = useL();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Logo />
        <span className="hidden text-sm text-muted-foreground sm:inline">· {L("90-second demo", "عرض في 90 ثانية")}</span>
        <span className="ms-auto" />
        <JudgeMode>
          <Button variant="ghost" size="sm" aria-label={L("Explore freely", "استكشف بحرية")}>
            <Compass /> <span className="hidden sm:inline">{L("Explore freely", "استكشف بحرية")}</span>
          </Button>
        </JudgeMode>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <LogOut className="rtl:rotate-180" /> {L("Exit", "خروج")}
          </Link>
        </Button>
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
