/**
 * BridgeEngine — deterministic financial gap resolver.
 *
 * Priority order (never changes):
 *   1. Fee waivers
 *   2. Free alternatives
 *   3. Discounts & institutional assistance
 *   4. Equipment borrowing
 *   5. Grants
 *   6. Sponsor funding — only for what is left
 *
 * No AI API is used. Every recommendation comes from rule matching against the
 * seeded knowledge base and carries a human-readable explanation.
 */
import type {
  Alternative,
  EligibilityProfile,
  EngineStepKind,
  Expense,
  ExpenseCategory,
  Grant,
  OpportunityCategory,
  Resource,
  Waiver,
} from "./types";

export interface EngineInput {
  category: OpportunityCategory;
  country: string;
  expenses: Expense[];
  studentFunds: number;
  priorAssistance: number;
  eligibility: EligibilityProfile;
}

export interface EngineKnowledge {
  waivers: Waiver[];
  alternatives: Alternative[];
  grants: Grant[];
  resources: Resource[];
}

export interface EngineFinding {
  id: string;
  kind: EngineStepKind;
  sourceId: string;
  title: string;
  provider?: string;
  amount: number;
  expenseId?: string;
  expenseLabel?: string;
  reasons: string[];
}

export interface EnginePhase {
  priority: number;
  kind: EngineStepKind;
  label: string;
  question: string;
  findings: EngineFinding[];
  gapBefore: number;
  gapAfter: number;
  note: string;
}

export interface EnginePlan {
  totalCost: number;
  studentFunds: number;
  initialGap: number;
  phases: EnginePhase[];
  reductionsTotal: number;
  sponsorAmount: number;
  remainingByExpense: Record<string, number>;
}

const money = (n: number) => `$${Math.round(n * 100) / 100}`;
const round = (n: number) => Math.round(n * 100) / 100;

const PROFILE_LABELS: Record<keyof EligibilityProfile, string> = {
  lowIncome: "you indicated a household income below the local threshold",
  publicSchool: "you attend a public school",
  firstGeneration: "you are a first-generation applicant",
  hasSchoolLetter: "your school can provide a supporting letter",
};

const EXPENSE_LABELS: Record<ExpenseCategory, string> = {
  registration: "registration",
  travel: "travel",
  accommodation: "accommodation",
  equipment: "equipment",
  materials: "educational materials",
  food: "food",
  documentation: "documentation",
  other: "other",
};

export function meetsRequirements(profile: EligibilityProfile, requires: Partial<EligibilityProfile>) {
  return (Object.keys(requires) as (keyof EligibilityProfile)[]).every((k) => !requires[k] || profile[k]);
}

export function requirementReasons(requires: Partial<EligibilityProfile>) {
  return (Object.keys(requires) as (keyof EligibilityProfile)[]).filter((k) => requires[k]).map((k) => PROFILE_LABELS[k]);
}

function countryMatches(countries: string[], country: string) {
  return countries.includes("Global") || countries.includes(country);
}

function keywordMatch(text: string, keywords: string[]) {
  const t = text.toLowerCase();
  return keywords.find((k) => t.includes(k.toLowerCase()));
}

export function waiverValue(w: Waiver, base: number) {
  const raw = w.savingsType === "fixed" ? w.savings : (base * w.savings) / 100;
  return round(Math.min(raw, w.maxSavings ?? Infinity, base));
}

export function runBridgeEngine(input: EngineInput, kb: EngineKnowledge): EnginePlan {
  const totalCost = round(input.expenses.reduce((s, e) => s + e.amount, 0));
  const funds = round(Math.min(input.studentFunds + input.priorAssistance, totalCost));
  const initialGap = round(Math.max(totalCost - funds, 0));
  const remaining: Record<string, number> = Object.fromEntries(input.expenses.map((e) => [e.id, e.amount]));
  let gap = initialGap;
  const phases: EnginePhase[] = [];
  let seq = 0;

  const take = (expense: Expense, raw: number) => {
    const amt = round(Math.min(raw, remaining[expense.id], gap));
    if (amt <= 0) return 0;
    remaining[expense.id] = round(remaining[expense.id] - amt);
    gap = round(gap - amt);
    return amt;
  };

  const phase = (
    priority: number,
    kind: EngineStepKind,
    label: string,
    question: string,
    run: () => EngineFinding[],
    emptyNote: string,
  ) => {
    const gapBefore = gap;
    const findings = gap > 0 ? run() : [];
    const total = findings.reduce((s, f) => s + f.amount, 0);
    phases.push({
      priority,
      kind,
      label,
      question,
      findings,
      gapBefore,
      gapAfter: gap,
      note:
        gapBefore <= 0
          ? "Gap already closed — nothing more to look for."
          : findings.length
            ? `Reduced the gap by ${money(total)}.`
            : emptyNote,
    });
  };

  // 1. Fee waivers
  phase(1, "waiver", "Fee waivers", "Can any required fee be waived?", () => {
    const out: EngineFinding[] = [];
    for (const w of kb.waivers.filter((w) => w.kind === "waiver")) {
      if (!w.categories.includes(input.category)) continue;
      if (!countryMatches(w.countries, input.country)) continue;
      if (!meetsRequirements(input.eligibility, w.requires)) continue;
      for (const e of input.expenses) {
        if (!w.expenseCategories.includes(e.category) || remaining[e.id] <= 0) continue;
        const amt = take(e, waiverValue(w, remaining[e.id]));
        if (amt > 0)
          out.push({
            id: `f${++seq}`,
            kind: "waiver",
            sourceId: w.id,
            title: w.name,
            provider: w.provider,
            amount: amt,
            expenseId: e.id,
            expenseLabel: e.label,
            reasons: [
              `It applies to ${input.category.replace("-", " ")} ${EXPENSE_LABELS[e.category]} fees`,
              w.countries.includes("Global") ? "It is available in every country" : `It is offered in ${input.country}`,
              ...requirementReasons(w.requires),
            ],
          });
      }
    }
    return out;
  }, "No matching fee waiver in the knowledge base.");

  // 2. Free alternatives
  phase(2, "alternative", "Free alternatives", "Is there a free way to meet the same requirement?", () => {
    const out: EngineFinding[] = [];
    for (const a of kb.alternatives) {
      for (const e of input.expenses) {
        if (!a.replaces.includes(e.category) || remaining[e.id] <= 0) continue;
        const hit = keywordMatch(e.label, a.keywords);
        if (!hit) continue;
        const amt = take(e, a.saving === "full" ? remaining[e.id] : a.saving);
        if (amt > 0)
          out.push({
            id: `f${++seq}`,
            kind: "alternative",
            sourceId: a.id,
            title: a.name,
            amount: amt,
            expenseId: e.id,
            expenseLabel: e.label,
            reasons: [`"${e.label}" matches "${hit}"`, a.description],
          });
      }
    }
    return out;
  }, "Every listed expense is a genuine requirement with no free substitute.");

  // 3. Discounts & institutional assistance
  phase(3, "discount", "Discounts & institutional help", "Do discounts or school programmes apply?", () => {
    const out: EngineFinding[] = [];
    for (const w of kb.waivers.filter((w) => w.kind !== "waiver")) {
      if (!w.categories.includes(input.category)) continue;
      if (!countryMatches(w.countries, input.country)) continue;
      if (!meetsRequirements(input.eligibility, w.requires)) continue;
      for (const e of input.expenses) {
        if (!w.expenseCategories.includes(e.category) || remaining[e.id] <= 0) continue;
        const base = e.amount; // percent discounts apply to the list price
        const amt = take(e, waiverValue(w, base));
        if (amt > 0)
          out.push({
            id: `f${++seq}`,
            kind: "discount",
            sourceId: w.id,
            title: w.name,
            provider: w.provider,
            amount: amt,
            expenseId: e.id,
            expenseLabel: e.label,
            reasons: [
              w.kind === "institutional" ? "Offered directly by your verifying institution" : "Published student discount",
              `Covers ${EXPENSE_LABELS[e.category]} for ${input.category.replace("-", " ")} opportunities`,
              ...requirementReasons(w.requires),
            ],
          });
      }
    }
    return out;
  }, "No discount or institutional programme matched.");

  // 4. Equipment borrowing
  phase(4, "borrow", "Borrow, don't buy", "Can equipment or materials be borrowed?", () => {
    const out: EngineFinding[] = [];
    for (const e of input.expenses) {
      if (!["equipment", "materials"].includes(e.category) || remaining[e.id] <= 0) continue;
      const r = kb.resources.find((r) => r.available > 0 && keywordMatch(e.label, r.keywords));
      if (!r) continue;
      const amt = take(e, remaining[e.id]);
      if (amt > 0)
        out.push({
          id: `f${++seq}`,
          kind: "borrow",
          sourceId: r.id,
          title: `Borrow: ${r.name}`,
          amount: amt,
          expenseId: e.id,
          expenseLabel: e.label,
          reasons: [`${r.available} of ${r.total} available to reserve`, `Loan term: ${r.loanTerm}`, "Reused equipment avoids a purchase entirely"],
        });
    }
    return out;
  }, "No equipment purchase that could be borrowed instead.");

  // 5. Grants
  phase(5, "grant", "Grants", "Do any small grants cover what's left?", () => {
    const out: EngineFinding[] = [];
    for (const g of kb.grants) {
      if (!meetsRequirements(input.eligibility, g.requires)) continue;
      let budget = g.maxAmount;
      for (const e of input.expenses) {
        if (!g.expenseCategories.includes(e.category) || remaining[e.id] <= 0 || budget <= 0) continue;
        const amt = take(e, Math.min(budget, remaining[e.id]));
        budget -= amt;
        if (amt > 0)
          out.push({
            id: `f${++seq}`,
            kind: "grant",
            sourceId: g.id,
            title: g.name,
            provider: g.provider,
            amount: amt,
            expenseId: e.id,
            expenseLabel: e.label,
            reasons: [`Covers ${EXPENSE_LABELS[e.category]} up to ${money(g.maxAmount)}`, ...requirementReasons(g.requires)],
          });
      }
    }
    return out;
  }, "No grant matched the remaining expense types.");

  // 6. Sponsor funding for the remainder only
  const sponsorAmount = gap;
  phases.push({
    priority: 6,
    kind: "sponsor",
    label: "Targeted sponsor request",
    question: "What still needs funding?",
    findings:
      sponsorAmount > 0
        ? [
            {
              id: `f${++seq}`,
              kind: "sponsor",
              sourceId: "sponsor",
              title: `Request ${money(sponsorAmount)} from verified sponsors`,
              amount: sponsorAmount,
              reasons: [
                `Only the remaining ${money(sponsorAmount)} is requested — not the full ${money(totalCost)}`,
                "The request is verified by your institution before sponsors see it",
              ],
            },
          ]
        : [],
    gapBefore: gap,
    gapAfter: gap,
    note: sponsorAmount > 0 ? `Sponsors are asked for ${money(sponsorAmount)} instead of ${money(initialGap)}.` : "No sponsor funding needed — the gap is closed.",
  });

  const reductionsTotal = round(initialGap - sponsorAmount);
  return { totalCost, studentFunds: funds, initialGap, phases, reductionsTotal, sponsorAmount, remainingByExpense: remaining };
}

export function planFindings(plan: EnginePlan) {
  return plan.phases.filter((p) => p.kind !== "sponsor").flatMap((p) => p.findings);
}
