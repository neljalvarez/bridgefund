"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookmarkPlus, Check, FileText, Sparkles, Wand2 } from "lucide-react";
import type { EligibilityProfile, Expense, OpportunityCategory } from "@/lib/types";
import { useStore } from "@/lib/store";
import { addOpportunity, setEligibility } from "@/lib/actions";
import { currentStudent } from "@/lib/selectors";
import { runBridgeEngine } from "@/lib/engine";
import { ALTERNATIVES, GRANTS, WAIVERS } from "@/lib/knowledge";
import { EXPENSE_LABEL, OPP_CATEGORIES, OPP_LABEL, daysUntil, fmtDateLong, isoDaysFromNow, uid, urgencyOf, usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError, PageHeader, UrgencyBadge } from "@/components/shared/kit";
import { ExpenseEditor } from "@/components/student/ExpenseEditor";

const STEPS = ["Opportunity", "Institution", "Deadline", "Expenses", "Funds", "Eligibility"] as const;
const ELIG: { key: keyof EligibilityProfile; q: string }[] = [
  { key: "lowIncome", q: "My household income is below my country's low-income threshold" },
  { key: "publicSchool", q: "I attend (or graduated from) a public school" },
  { key: "firstGeneration", q: "I would be the first in my family to attend university" },
  { key: "hasSchoolLetter", q: "A teacher or counselor can write a short supporting letter" },
];

export default function ScannerPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const student = currentStudent(state);
  const blank = { category: "examination" as OpportunityCategory, title: "", provider: "", institutionId: student.institutionId, deadline: "", expenses: [] as Expense[], funds: "", assistance: "", eligibility: student.eligibility, outcome: "" };
  const [f, setF] = useState(blank);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  const deadlineIso = f.deadline ? new Date(`${f.deadline}T12:00:00`).toISOString() : "";
  const total = f.expenses.reduce((a, e) => a + e.amount, 0);
  const available = Math.min((Number(f.funds) || 0) + (Number(f.assistance) || 0), total);
  const shortfall = Math.max(total - available, 0);
  const inst = state.institutions.find((i) => i.id === f.institutionId);

  const preview = useMemo(
    () =>
      f.expenses.length
        ? runBridgeEngine(
            { category: f.category, country: inst?.country ?? student.country, level: student.level, expenses: f.expenses.filter((e) => e.amount > 0), studentFunds: Number(f.funds) || 0, priorAssistance: Number(f.assistance) || 0, eligibility: f.eligibility },
            { waivers: WAIVERS, alternatives: ALTERNATIVES, grants: GRANTS, resources: state.resources },
          )
        : null,
    [f, inst, student, state.resources],
  );

  const validate = (i: number) => {
    const e: Record<string, string> = {};
    if (i === 0 && !f.title.trim()) e.title = "Name the opportunity you're pursuing.";
    if (i === 2) {
      if (!f.deadline) e.deadline = "Choose the deadline.";
      else if (daysUntil(deadlineIso) < 0) e.deadline = "That date has passed — choose an upcoming deadline.";
    }
    if (i === 3) {
      if (!f.expenses.length) e.expenses = "Add at least one required expense.";
      else if (f.expenses.some((x) => !x.label.trim() || !(x.amount > 0))) e.expenses = "Every expense needs a description and an amount above $0.";
    }
    if (i === 4 && f.funds !== "" && isNaN(Number(f.funds))) e.funds = "Enter a number — $0 is fine.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  const example = () => {
    setF({
      ...blank,
      category: "certification",
      title: "Cloud Fundamentals certification exam",
      provider: "Open Skills Certification Board",
      deadline: isoDaysFromNow(15).slice(0, 10),
      expenses: [
        { id: uid("e"), label: "Certification exam fee", category: "examination", amount: 150, confirmed: true },
        { id: uid("e"), label: "Official practice test pack", category: "materials", amount: 30, confirmed: false },
        { id: uid("e"), label: "Bus fare to test centre", category: "transportation", amount: 12, confirmed: false },
      ],
      funds: "40",
      outcome: "A cloud credential for entry-level IT support roles.",
    });
    setErrors({});
    setStep(STEPS.length - 1);
  };

  const save = (engine: boolean) => {
    const id = uid("o");
    dispatch(setEligibility(f.eligibility));
    dispatch(
      addOpportunity({ title: f.title.trim(), provider: f.provider.trim() || "—", category: f.category, deadline: deadlineIso, institutionId: f.institutionId, expenses: f.expenses, studentFunds: Number(f.funds) || 0, priorAssistance: Number(f.assistance) || 0, outcome: f.outcome.trim() || f.title.trim() }, id),
      { success: "Barrier report saved", description: "Added to your opportunities." },
    );
    router.push(engine ? `/student/engine?opp=${id}` : "/student");
  };

  const byCat = Object.entries(f.expenses.reduce<Record<string, number>>((m, e) => ({ ...m, [e.category]: (m[e.category] ?? 0) + e.amount }), {}));
  const urgency = deadlineIso ? urgencyOf(deadlineIso) : null;

  return (
    <>
      <PageHeader
        title="Add an opportunity"
        description="Six quick questions. Then BridgeEngine takes over."
        actions={
          <Button variant="outline" onClick={example}>
            <Sparkles /> Load an example
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <ol className="mb-8 grid grid-cols-6 gap-1.5" aria-label="Scanner progress">
              {STEPS.map((s, i) => (
                <li key={s}>
                  <button type="button" disabled={i > step && !done} onClick={() => { setDone(false); setStep(i); }} className="w-full text-left disabled:cursor-default" aria-current={i === step && !done ? "step" : undefined}>
                    <span className={cn("block h-1 rounded-full", i < step || done ? "bg-primary" : i === step ? "bg-primary/50" : "bg-secondary")} />
                    <span className={cn("mt-1.5 hidden text-[11px] sm:block", i === step && !done ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</span>
                  </button>
                </li>
              ))}
            </ol>

            {done ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Check className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-semibold">Barrier identified: {usd(shortfall)} shortfall</p>
                    <p className="text-sm text-muted-foreground">{preview && preview.reductionsTotal > 0 ? `BridgeEngine has already spotted up to ${usd(preview.reductionsTotal)} in potential savings.` : "Next, BridgeEngine will look for ways to reduce this cost."}</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="outcome">What could this opportunity lead to? (optional)</Label>
                  <Input id="outcome" className="mt-1.5" value={f.outcome} onChange={(e) => set({ outcome: e.target.value })} placeholder="e.g. An entry-level data analyst role" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => save(true)}>
                    <Wand2 /> Save and run BridgeEngine
                  </Button>
                  <Button variant="outline" onClick={() => save(false)}>
                    <BookmarkPlus /> Save report
                  </Button>
                  <Button variant="ghost" onClick={() => { setF(blank); setStep(0); setDone(false); }}>
                    Start over
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); next(); }}>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="min-h-[220px]">
                    <p className="text-xs font-medium text-muted-foreground">
                      Question {step + 1} of {STEPS.length}
                    </p>
                    {step === 0 && (
                      <div className="mt-2 space-y-4">
                        <h2 className="text-xl font-semibold">What opportunity are you pursuing?</h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <Label>Type of opportunity</Label>
                            <Select value={f.category} onValueChange={(v) => set({ category: v as OpportunityCategory })}>
                              <SelectTrigger className="mt-1.5" aria-label="Type of opportunity">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {OPP_CATEGORIES.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {OPP_LABEL[c]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="provider">Organiser (optional)</Label>
                            <Input id="provider" className="mt-1.5" value={f.provider} onChange={(e) => set({ provider: e.target.value })} placeholder="Exam board, university…" />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor="title">Opportunity name</Label>
                            <Input id="title" className="mt-1.5" value={f.title} onChange={(e) => set({ title: e.target.value })} aria-invalid={!!errors.title} placeholder="e.g. Associate Data Analyst Certification exam" autoFocus />
                            <FieldError>{errors.title}</FieldError>
                          </div>
                        </div>
                      </div>
                    )}
                    {step === 1 && (
                      <div className="mt-2 space-y-4">
                        <h2 className="text-xl font-semibold">Which institution is involved?</h2>
                        <Select value={f.institutionId} onValueChange={(v) => set({ institutionId: v })}>
                          <SelectTrigger aria-label="Institution">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {state.institutions.map((i) => (
                              <SelectItem key={i.id} value={i.id}>
                                {i.name} — {i.city}, {i.country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">Your school or nonprofit verifies any assistance request privately.</p>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="mt-2 space-y-4">
                        <h2 className="text-xl font-semibold">What is the deadline?</h2>
                        <Input type="date" aria-label="Deadline" className="max-w-xs" value={f.deadline} onChange={(e) => set({ deadline: e.target.value })} aria-invalid={!!errors.deadline} />
                        <FieldError>{errors.deadline}</FieldError>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="mt-2 space-y-4">
                        <h2 className="text-xl font-semibold">What expenses are required?</h2>
                        <ExpenseEditor expenses={f.expenses} onChange={(expenses) => set({ expenses })} />
                        <FieldError>{errors.expenses}</FieldError>
                        <p className="text-xs text-muted-foreground">Tick “Confirmed” when an amount comes from an official source; leave it unticked for estimates.</p>
                      </div>
                    )}
                    {step === 4 && (
                      <div className="mt-2 space-y-4">
                        <h2 className="text-xl font-semibold">What can you already afford?</h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="funds">Available personal funds (USD)</Label>
                            <Input id="funds" className="mt-1.5 tabular" inputMode="decimal" value={f.funds} onChange={(e) => set({ funds: e.target.value.replace(/[^\d.]/g, "") })} placeholder="0" autoFocus />
                            <FieldError>{errors.funds}</FieldError>
                          </div>
                          <div>
                            <Label htmlFor="assist">Existing financial assistance (USD)</Label>
                            <Input id="assist" className="mt-1.5 tabular" inputMode="decimal" value={f.assistance} onChange={(e) => set({ assistance: e.target.value.replace(/[^\d.]/g, "") })} placeholder="0" />
                          </div>
                        </div>
                      </div>
                    )}
                    {step === 5 && (
                      <div className="mt-2 space-y-4">
                        <h2 className="text-xl font-semibold">A few eligibility questions</h2>
                        <p className="text-sm text-muted-foreground">These help BridgeEngine find waivers you may qualify for. They stay private and never guarantee eligibility.</p>
                        <div className="space-y-2">
                          {ELIG.map((q) => (
                            <label key={q.key} className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5 text-sm">
                              {q.q}
                              <Switch checked={f.eligibility[q.key]} onCheckedChange={(v) => set({ eligibility: { ...f.eligibility, [q.key]: v } })} />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="mt-8 flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                    <ArrowLeft /> Back
                  </Button>
                  <Button type="submit">
                    {step === STEPS.length - 1 ? "Generate report" : "Continue"} <ArrowRight />
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> Financial barrier report
              </p>
              <CardTitle className="mt-1.5 text-base">{f.title || "Untitled opportunity"}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {OPP_LABEL[f.category]}
                {inst && ` · ${inst.name}`}
                {deadlineIso && ` · due ${fmtDateLong(deadlineIso)}`}
              </p>
            </div>
            {urgency && <UrgencyBadge label={urgency.label} />}
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Total cost", total, ""],
                ["Available funds", available, ""],
                ["Shortfall", shortfall, "text-warning"],
              ].map(([l, v, c]) => (
                <div key={l as string} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[11px] text-muted-foreground">{l}</p>
                  <p className={cn("mt-0.5 text-lg font-semibold tabular", c as string)}>{usd(v as number)}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Expense categories</p>
              {byCat.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add expenses to see the breakdown.</p>
              ) : (
                <ul className="space-y-2">
                  {byCat.map(([c, v]) => (
                    <li key={c}>
                      <div className="flex justify-between text-sm">
                        <span>{EXPENSE_LABEL[c as keyof typeof EXPENSE_LABEL]}</span>
                        <span className="tabular">{usd(v)}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <motion.div className="h-full bg-primary" animate={{ width: `${total ? (v / total) * 100 : 0}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-1.5 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deadline urgency</span>
                <span className="font-medium">{deadlineIso ? `${urgency?.label} · ${daysUntil(deadlineIso)} days` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmed vs estimated costs</span>
                <span className="tabular">
                  {usd(f.expenses.filter((e) => e.confirmed).reduce((a, e) => a + e.amount, 0))} / {usd(f.expenses.filter((e) => !e.confirmed).reduce((a, e) => a + e.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Estimated assistance required</span>
                <span className="tabular">{usd(shortfall)}</span>
              </div>
              {preview && preview.reductionsTotal > 0 && (
                <div className="flex justify-between text-primary">
                  <span>After BridgeEngine (preview)</span>
                  <span className="font-semibold tabular">{usd(preview.sponsorAmount)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
