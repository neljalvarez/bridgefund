/**
 * BridgeEngine — deterministic, explainable financial gap resolver.
 *
 * Priority order (never changes):
 *   1. Fee waivers
 *   2. Free alternatives
 *   3. Discounts
 *   4. Equipment borrowing
 *   5. Institutional assistance
 *   6. Educational grants
 *   7. Sponsor funding — only for the remaining shortfall
 *
 * Double counting is impossible by construction: every reduction is capped at
 * what is still unpaid on its specific expense line AND at the overall gap, and
 * each knowledge-base source can be applied to an expense only once.
 */
import type {
  Alternative,
  EligibilityProfile,
  EducationLevel,
  Expense,
  ExpenseCategory,
  Grant,
  OpportunityCategory,
  ReductionKind,
  Resource,
  Waiver,
} from "./types";

export interface EngineInput {
  category: OpportunityCategory;
  country: string;
  level: EducationLevel;
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

export type PhaseKind = ReductionKind | "sponsor";

export interface EngineFinding {
  id: string;
  kind: PhaseKind;
  sourceId: string;
  title: string;
  provider: string;
  amount: number;
  expenseId?: string;
  expenseLabel?: string;
  why: string[];
  eligibility: string[];
  documents: string[];
  instructions: string[];
  processingDays: number;
  deadlineDays: number;
}

export interface EnginePhase {
  priority: number;
  kind: PhaseKind;
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

export const PHASE_LABELS: Record<PhaseKind, string> = {
  waiver: "Fee waiver",
  alternative: "Free alternative",
  discount: "Discount",
  borrow: "Equipment borrowing",
  institutional: "Institutional assistance",
  grant: "Educational grant",
  sponsor: "Sponsor funding",
};

const round = (n: number) => Math.round(n * 100) / 100;
const money = (n: number) => `$${round(n)}`;

const PROFILE_LABELS: Record<keyof EligibilityProfile, string> = {
  lowIncome: "you reported a household income below the local threshold",
  publicSchool: "you attend a public school",
  firstGeneration: "you would be the first in your family at university",
  hasSchoolLetter: "your school can provide a supporting letter",
};

const CAT: Record<ExpenseCategory, string> = {
  registration: "registration",
  examination: "examination",
  equipment: "equipment",
  transportation: "transportation",
  accommodation: "accommodation",
  food: "food",
  documentation: "documentation",
  materials: "learning materials",
  technology: "technology",
  other: "other",
};

export function meetsRequirements(profile: EligibilityProfile, requires: Partial<EligibilityProfile>) {
  return (Object.keys(requires) as (keyof EligibilityProfile)[]).every((k) => !requires[k] || profile[k]);
}

export function requirementReasons(requires: Partial<EligibilityProfile>) {
  return (Object.keys(requires) as (keyof EligibilityProfile)[]).filter((k) => requires[k]).map((k) => PROFILE_LABELS[k]);
}

export function waiverValue(w: Waiver, base: number) {
  const raw = w.savingsType === "fixed" ? w.savings : (base * w.savings) / 100;
  return round(Math.min(raw, w.maxSavings ?? Infinity, base));
}

const countryOk = (countries: string[], c: string) => countries.includes("Global") || countries.includes(c);
const keywordHit = (text: string, keywords: string[]) => keywords.find((k) => text.toLowerCase().includes(k.toLowerCase()));

export function runBridgeEngine(input: EngineInput, kb: EngineKnowledge): EnginePlan {
  const totalCost = round(input.expenses.reduce((s, e) => s + e.amount, 0));
  const funds = round(Math.min(input.studentFunds + input.priorAssistance, totalCost));
  const initialGap = round(Math.max(totalCost - funds, 0));
  const remaining: Record<string, number> = Object.fromEntries(input.expenses.map((e) => [e.id, e.amount]));
  const used = new Set<string>(); // sourceId:expenseId — one application per source per line
  let gap = initialGap;
  let seq = 0;
  const phases: EnginePhase[] = [];

  const take = (sourceId: string, e: Expense, raw: number) => {
    const key = `${sourceId}:${e.id}`;
    if (used.has(key)) return 0;
    const amt = round(Math.min(raw, remaining[e.id], gap));
    if (amt <= 0) return 0;
    used.add(key);
    remaining[e.id] = round(remaining[e.id] - amt);
    gap = round(gap - amt);
    return amt;
  };

  const phase = (priority: number, kind: PhaseKind, label: string, question: string, run: () => EngineFinding[], empty: string) => {
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
      note: gapBefore <= 0 ? "Gap already closed — skipped." : findings.length ? `Gap reduced by ${money(total)}` : empty,
    });
  };

  const fromWaivers = (kind: Waiver["kind"]) => () => {
    const out: EngineFinding[] = [];
    for (const w of kb.waivers.filter((x) => x.kind === kind)) {
      if (!w.categories.includes(input.category) || !countryOk(w.countries, input.country) || !w.levels.includes(input.level)) continue;
      if (!meetsRequirements(input.eligibility, w.requires)) continue;
      for (const e of input.expenses) {
        if (!w.expenseCategories.includes(e.category) || remaining[e.id] <= 0) continue;
        const base = kind === "waiver" ? remaining[e.id] : e.amount; // percentage discounts apply to the list price
        const amt = take(w.id, e, waiverValue(w, base));
        if (amt > 0)
          out.push({
            id: `f${++seq}`,
            kind: kind === "waiver" ? "waiver" : kind === "discount" ? "discount" : "institutional",
            sourceId: w.id,
            title: w.name,
            provider: w.provider,
            amount: amt,
            expenseId: e.id,
            expenseLabel: e.label,
            why: [
              `Applies to ${CAT[e.category]} costs for ${input.category.replace("-", " ")} opportunities`,
              w.countries.includes("Global") ? "Available in every country" : `Offered in ${input.country}`,
              ...requirementReasons(w.requires),
            ],
            eligibility: w.eligibility,
            documents: w.documents,
            instructions: w.instructions,
            processingDays: w.processingDays,
            deadlineDays: w.deadlineDays,
          });
      }
    }
    return out;
  };

  phase(1, "waiver", "Fee waivers", "Can any required fee be waived?", fromWaivers("waiver"), "No applicable fee waiver found");

  phase(2, "alternative", "Free alternatives", "Is there a free way to meet the same requirement?", () => {
    const out: EngineFinding[] = [];
    for (const a of kb.alternatives) {
      for (const e of input.expenses) {
        if (!a.replaces.includes(e.category) || remaining[e.id] <= 0) continue;
        const hit = keywordHit(e.label, a.keywords);
        if (!hit) continue;
        const amt = take(a.id, e, remaining[e.id]);
        if (amt > 0)
          out.push({
            id: `f${++seq}`,
            kind: "alternative",
            sourceId: a.id,
            title: a.name,
            provider: a.provider,
            amount: amt,
            expenseId: e.id,
            expenseLabel: e.label,
            why: [`“${e.label}” can be met for free (matched “${hit}”)`, a.description],
            eligibility: a.eligibility,
            documents: a.documents,
            instructions: a.instructions,
            processingDays: a.processingDays,
            deadlineDays: a.deadlineDays,
          });
      }
    }
    return out;
  }, "Every listed expense is a genuine requirement");

  phase(3, "discount", "Discounts", "Do any published student discounts apply?", fromWaivers("discount"), "No discount matched");

  phase(4, "borrow", "Equipment borrowing", "Can equipment or materials be borrowed instead?", () => {
    const out: EngineFinding[] = [];
    for (const e of input.expenses) {
      if (!["equipment", "materials", "technology"].includes(e.category) || remaining[e.id] <= 0) continue;
      const r = kb.resources.find((x) => x.available > 0 && keywordHit(e.label, x.keywords));
      if (!r) continue;
      const amt = take(r.id, e, remaining[e.id]);
      if (amt > 0)
        out.push({
          id: `f${++seq}`,
          kind: "borrow",
          sourceId: r.id,
          title: `Borrow: ${r.name}`,
          provider: "Resource Rescue lending library",
          amount: amt,
          expenseId: e.id,
          expenseLabel: e.label,
          why: [`${r.available} of ${r.total} available to reserve`, "Borrowing avoids the purchase entirely"],
          eligibility: ["Student at a partner institution"],
          documents: ["Student ID at pickup"],
          instructions: ["Reserve the item in Resource Rescue.", "Collect it from the school office on your pickup date.", `Return it at the end of the loan (${r.loanTerm.toLowerCase()}).`],
          processingDays: 1,
          deadlineDays: 7,
        });
    }
    return out;
  }, "No purchase that could be borrowed instead");

  phase(5, "institutional", "Institutional assistance", "Does the student's institution run a programme for this?", fromWaivers("institutional"), "No institutional programme matched");

  phase(6, "grant", "Educational grants", "Do any small grants cover what's left?", () => {
    const out: EngineFinding[] = [];
    for (const g of kb.grants) {
      if (!meetsRequirements(input.eligibility, g.requires)) continue;
      let budget = g.maxAmount;
      for (const e of input.expenses) {
        if (!g.expenseCategories.includes(e.category) || remaining[e.id] <= 0 || budget <= 0) continue;
        const amt = take(g.id, e, Math.min(budget, remaining[e.id]));
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
            why: [`Covers ${CAT[e.category]} costs up to ${money(g.maxAmount)}`, ...requirementReasons(g.requires)],
            eligibility: g.eligibility,
            documents: g.documents,
            instructions: g.instructions,
            processingDays: g.processingDays,
            deadlineDays: g.deadlineDays,
          });
      }
    }
    return out;
  }, "No grant matched the remaining costs");

  const sponsorAmount = gap;
  phases.push({
    priority: 7,
    kind: "sponsor",
    label: "Sponsor funding",
    question: "What genuinely still needs funding?",
    findings:
      sponsorAmount > 0
        ? [
            {
              id: `f${++seq}`,
              kind: "sponsor",
              sourceId: "sponsor",
              title: `Request ${money(sponsorAmount)} from verified sponsors`,
              provider: "BridgeFund sponsor network",
              amount: sponsorAmount,
              why: [`Only the remaining ${money(sponsorAmount)} is requested — not the original ${money(initialGap)} gap`, "Every other option was checked first"],
              eligibility: ["Need verified by your institution"],
              documents: ["Proof of enrollment", "Official cost confirmation"],
              instructions: ["Submit the request for verification.", "Your institution verifies it privately.", "Verified sponsors see only your goal, the amount and the deadline."],
              processingDays: 3,
              deadlineDays: 0,
            },
          ]
        : [],
    gapBefore: gap,
    gapAfter: gap,
    note: sponsorAmount > 0 ? `Sponsors asked for ${money(sponsorAmount)} instead of ${money(initialGap)}` : "No sponsor funding needed",
  });

  return { totalCost, studentFunds: funds, initialGap, phases, reductionsTotal: round(initialGap - sponsorAmount), sponsorAmount, remainingByExpense: remaining };
}

export const planFindings = (plan: EnginePlan) => plan.phases.filter((p) => p.kind !== "sponsor").flatMap((p) => p.findings);
