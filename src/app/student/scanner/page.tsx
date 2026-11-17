"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookmarkPlus, Sparkles, Wand2 } from "lucide-react";
import type { Expense, OpportunityCategory } from "@/lib/types";
import { useStore } from "@/lib/store";
import { addOpportunity } from "@/lib/actions";
import { currentStudent } from "@/lib/selectors";
import { OPP_CATEGORIES, OPP_CATEGORY_LABEL, daysUntil, isoDaysFromNow, uid } from "@/lib/format";
import { Field, PageHeader } from "@/components/ui/primitives";
import { Window } from "@/components/ui/Window";
import { BarrierReport, computeReport } from "@/components/student/BarrierReport";
import { ExpenseEditor } from "@/components/student/ExpenseEditor";
import { PixelSprite } from "@/components/pixel/PixelSprite";

interface Form {
  title: string;
  provider: string;
  category: OpportunityCategory;
  deadline: string; // yyyy-mm-dd
  expenses: Expense[];
  funds: string;
  hasAssistance: boolean;
  assistance: string;
  institutionId: string;
  outcome: string;
}

const toInput = (iso: string) => iso.slice(0, 10);

const QUESTIONS = [
  { key: "opp", q: "What opportunity are you pursuing?" },
  { key: "deadline", q: "What is the deadline?" },
  { key: "expenses", q: "What expenses are required?" },
  { key: "funds", q: "How much can you already afford?" },
  { key: "assist", q: "Have you received any financial assistance?" },
  { key: "inst", q: "Which educational institution is involved?" },
] as const;

export default function ScannerPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const student = currentStudent(state);
  const blank: Form = {
    title: "",
    provider: "",
    category: "examination",
    deadline: "",
    expenses: [],
    funds: "",
    hasAssistance: false,
    assistance: "",
    institutionId: student.institutionId,
    outcome: "",
  };
  const [f, setF] = useState<Form>(blank);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const set = (patch: Partial<Form>) => setF((x) => ({ ...x, ...patch }));
  const inst = state.institutions.find((i) => i.id === f.institutionId);
  const deadlineIso = f.deadline ? new Date(`${f.deadline}T12:00:00`).toISOString() : "";
  const reportInput = {
    title: f.title,
    provider: f.provider,
    institution: inst?.name,
    deadline: deadlineIso,
    expenses: f.expenses,
    studentFunds: Number(f.funds) || 0,
    priorAssistance: f.hasAssistance ? Number(f.assistance) || 0 : 0,
  };

  const validate = (i: number) => {
    const e: Record<string, string> = {};
    if (i === 0 && !f.title.trim()) e.title = "Tell us the name of the opportunity.";
    if (i === 1) {
      if (!f.deadline) e.deadline = "Choose a deadline date.";
      else if (daysUntil(deadlineIso) < 0) e.deadline = "That date has already passed — pick a future deadline.";
    }
    if (i === 2) {
      if (f.expenses.length === 0) e.expenses = "Add at least one expense.";
      else if (f.expenses.some((x) => !x.label.trim() || !(x.amount > 0))) e.expenses = "Every expense needs a description and an amount above $0.";
    }
    if (i === 3 && f.funds !== "" && isNaN(Number(f.funds))) e.funds = "Enter a number (0 is fine).";
    if (i === 4 && f.hasAssistance && !(Number(f.assistance) > 0)) e.assistance = "Enter the amount you received.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  const loadExample = () => {
    setF({
      ...blank,
      title: "Cloud Fundamentals certification exam",
      provider: "Open Skills Certification Board",
      category: "certification",
      deadline: toInput(isoDaysFromNow(15)),
      expenses: [
        { id: uid("e"), label: "Exam registration fee", category: "registration", amount: 150, confirmed: true },
        { id: uid("e"), label: "Official practice test pack", category: "materials", amount: 30, confirmed: false },
        { id: uid("e"), label: "Bus fare to test centre", category: "travel", amount: 12, confirmed: false },
      ],
      funds: "40",
      outcome: "A cloud credential for entry-level IT support roles.",
    });
    setErrors({});
    setStep(QUESTIONS.length - 1);
  };

  const save = (thenEngine: boolean) => {
    const id = uid("o");
    dispatch(
      addOpportunity(
        {
          title: f.title.trim(),
          provider: f.provider.trim() || "—",
          category: f.category,
          deadline: deadlineIso,
          institutionId: f.institutionId,
          expenses: f.expenses,
          studentFunds: Number(f.funds) || 0,
          priorAssistance: f.hasAssistance ? Number(f.assistance) || 0 : 0,
          outcome: f.outcome.trim() || f.title.trim(),
        },
        id,
      ),
      { toast: { title: "Saved to your quest journal", tone: "success" }, sound: "success" },
    );
    router.push(thenEngine ? `/student/engine?opp=${id}` : "/student");
  };

  const r = computeReport(reportInput);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        kicker="Financial barrier scanner"
        title="What's standing in your way?"
        description="Answer six short questions. We'll turn them into an exact, itemised barrier report — the first step to closing it."
        actions={
          <button type="button" className="btn-ghost btn-sm" onClick={loadExample}>
            <Sparkles size={14} /> Load an example
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Window title={done ? "Scan complete" : `Question ${step + 1} of ${QUESTIONS.length}`} tone="forest">
          <ol className="mb-5 flex gap-1" aria-label="Scanner progress">
            {QUESTIONS.map((q, i) => (
              <li key={q.key} className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (i <= step || done) {
                      setDone(false);
                      setStep(i);
                    }
                  }}
                  className={`block h-2.5 w-full border border-line ${i < step || done ? "bg-forest" : i === step ? "bg-gold" : "bg-raised"}`}
                  aria-label={`Question ${i + 1}: ${q.q}`}
                  aria-current={i === step && !done ? "step" : undefined}
                />
              </li>
            ))}
          </ol>

          {done ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <PixelSprite name="scroll" scale={5} />
                <div>
                  <p className="font-pixel text-xl">Barrier identified: {r.gap > 0 ? `$${r.gap} gap` : "no gap"}</p>
                  <p className="text-sm text-muted">
                    {r.gap > 0
                      ? "Next, BridgeEngine will look for waivers, free alternatives, discounts, borrowable equipment and grants before asking any sponsor."
                      : "You can already afford this opportunity. Save it to track the deadline."}
                  </p>
                </div>
              </div>
              <Field label="What could this opportunity lead to? (optional)" htmlFor="outcome">
                <input id="outcome" className="input" value={f.outcome} onChange={(e) => set({ outcome: e.target.value })} placeholder="e.g. An entry-level data analyst role" />
              </Field>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-primary" onClick={() => save(true)}>
                  <Wand2 size={16} /> Save & run BridgeEngine
                </button>
                <button type="button" className="btn-ghost" onClick={() => save(false)}>
                  <BookmarkPlus size={16} /> Save to journal
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setF(blank);
                    setStep(0);
                    setDone(false);
                  }}
                >
                  Start over
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                  <p className="mb-4 font-pixel text-2xl leading-tight">{QUESTIONS[step].q}</p>

                  {step === 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Field label="Opportunity" htmlFor="title" error={errors.title}>
                          <input id="title" className="input" value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Associate Data Analyst Certification exam" autoFocus />
                        </Field>
                      </div>
                      <Field label="Organiser (optional)" htmlFor="provider">
                        <input id="provider" className="input" value={f.provider} onChange={(e) => set({ provider: e.target.value })} placeholder="e.g. exam board, university" />
                      </Field>
                      <Field label="Type" htmlFor="category">
                        <select id="category" className="input" value={f.category} onChange={(e) => set({ category: e.target.value as OpportunityCategory })}>
                          {OPP_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {OPP_CATEGORY_LABEL[c]}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  )}

                  {step === 1 && (
                    <Field label="Deadline to pay or register" htmlFor="deadline" error={errors.deadline}>
                      <input id="deadline" type="date" className="input max-w-xs" value={f.deadline} onChange={(e) => set({ deadline: e.target.value })} autoFocus />
                    </Field>
                  )}

                  {step === 2 && (
                    <div>
                      <ExpenseEditor expenses={f.expenses} onChange={(expenses) => set({ expenses })} />
                      {errors.expenses && (
                        <p className="mt-2 text-xs font-semibold text-terraink" role="alert">
                          {errors.expenses}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted">Tick “Confirmed” when the amount comes from an official source; leave it unticked for estimates.</p>
                    </div>
                  )}

                  {step === 3 && (
                    <Field label="Money you can put toward this (USD)" htmlFor="funds" hint="Savings, family contribution, part-time earnings — 0 is fine." error={errors.funds}>
                      <input id="funds" inputMode="decimal" className="input max-w-xs font-pixel text-lg" value={f.funds} onChange={(e) => set({ funds: e.target.value.replace(/[^\d.]/g, "") })} placeholder="0" autoFocus />
                    </Field>
                  )}

                  {step === 4 && (
                    <div className="space-y-3">
                      <div className="flex gap-2" role="radiogroup" aria-label="Received assistance?">
                        {[false, true].map((v) => (
                          <button key={String(v)} type="button" role="radio" aria-checked={f.hasAssistance === v} onClick={() => set({ hasAssistance: v })} className={`btn ${f.hasAssistance === v ? "bg-forest text-onforest" : "bg-surface"}`}>
                            {v ? "Yes" : "Not yet"}
                          </button>
                        ))}
                      </div>
                      {f.hasAssistance && (
                        <Field label="Amount already received (USD)" htmlFor="assist" error={errors.assistance}>
                          <input id="assist" inputMode="decimal" className="input max-w-xs" value={f.assistance} onChange={(e) => set({ assistance: e.target.value.replace(/[^\d.]/g, "") })} />
                        </Field>
                      )}
                    </div>
                  )}

                  {step === 5 && (
                    <Field label="Institution" htmlFor="inst" hint="Your school or nonprofit will verify any request privately.">
                      <select id="inst" className="input" value={f.institutionId} onChange={(e) => set({ institutionId: e.target.value })}>
                        {state.institutions.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name} — {i.city}, {i.country}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex justify-between">
                <button type="button" className="btn-ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" className="btn-primary">
                  {step === QUESTIONS.length - 1 ? "Generate report" : "Next"} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </Window>

        <Window title="barrier_report.txt" tone="ink" className="lg:sticky lg:top-24 lg:self-start">
          <BarrierReport input={reportInput} />
        </Window>
      </div>
    </div>
  );
}
