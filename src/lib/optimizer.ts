/**
 * BridgeEngine 2.0 — assistance optimisation.
 *
 * BridgeEngine 1 (engine.ts) analyses a barrier in a fixed priority order.
 * The optimiser takes the same knowledge base and computes the most effective
 * COMBINATION of assistance under real constraints, producing three
 * alternative strategies:
 *
 *   • lowest-cost   — lowest out-of-pocket cost for the student
 *   • fastest       — quickest route to a fully secured opportunity
 *   • independent   — lowest dependency on external (cash) funding
 *
 * Constraints modelled:
 *   - financial shortfall and the student's available funds
 *   - eligibility requirements (ineligible options are excluded, with reasons)
 *   - programme application deadlines and the opportunity deadline
 *   - estimated processing times (options that cannot finish in time are excluded)
 *   - institutional fund balances and grant programme budgets
 *   - equipment availability
 *   - confirmed assistance already secured (always kept, never re-counted)
 *   - conflicts: one fee reduction per expense line, explicit conflictsWith
 *     rules, and borrowed items cannot also be bought with grant money
 *   - likelihood of each option arriving before the deadline
 *
 * Every figure is an estimate. Nothing here guarantees funding.
 */
import type { Alternative, EligibilityProfile, EducationLevel, Expense, Grant, OpportunityCategory, Resource, StrategyId, Waiver } from "./types";
import { meetsRequirements, requirementReasons, waiverValue } from "./engine";

export type OptionKind = "waiver" | "alternative" | "discount" | "borrow" | "institutional" | "grant";
export type AssistanceStatus = "Confirmed" | "Estimated";

export interface OptimizerInput {
  category: OpportunityCategory;
  country: string;
  emirate?: string;
  level: EducationLevel;
  expenses: Expense[];
  studentFunds: number;
  eligibility: EligibilityProfile;
}

export interface OptimizerContext {
  /** Days until the opportunity's payment deadline. */
  daysLeft: number;
  /** Days remaining before each programme's own application deadline closes. */
  programDaysLeft: (deadlineDays: number) => number;
  institutionFund: number;
  programFunds: Record<string, number>;
  /** Source ids already confirmed by the institution for this request. */
  confirmedSourceIds: string[];
  /** Sponsor / institution money already received on this request. */
  alreadyFunded: number;
}

export interface OptimizerKB {
  waivers: Waiver[];
  alternatives: Alternative[];
  grants: Grant[];
  resources: Resource[];
}

export interface AssistanceOption {
  id: string;
  kind: OptionKind;
  sourceId: string;
  title: string;
  provider: string;
  expenseId: string;
  expenseLabel: string;
  amount: number;
  /** Does this option bring in external cash (vs. reducing the cost)? */
  cash: boolean;
  processingDays: number;
  likelihood: number;
  status: AssistanceStatus;
  conflictsWith: string[];
  why: string[];
}

export interface ExcludedOption {
  title: string;
  reason: string;
}

export interface StrategyLine {
  label: string;
  kind: OptionKind | "student" | "sponsor" | "funded";
  amount: number;
  status: AssistanceStatus | "Pending" | "Own funds";
  processingDays: number;
  likelihood: number;
  sourceId?: string;
  expenseId?: string;
}

export interface Strategy {
  id: StrategyId;
  name: string;
  tagline: string;
  lines: StrategyLine[];
  options: AssistanceOption[];
  totalCost: number;
  studentPays: number;
  costReductions: number;
  externalCash: number; // grants + institutional funds
  sponsorNeeded: number;
  alreadyFunded: number;
  daysToSecure: number;
  meetsDeadline: boolean;
  /** Amount-weighted estimate that the non-student parts arrive before the deadline. */
  likelihood: number;
  externalDependency: number; // share of cost covered by external cash + sponsors
  multiplier: number | null;
  notes: string[];
}

export interface StrategyComparison {
  strategies: Strategy[];
  recommended: StrategyId;
  excluded: ExcludedOption[];
  tradeoffs: string[];
  daysLeft: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const VERIFY_DAYS = 2;
const SPONSOR_DAYS = 4;
const PAYMENT_DAYS = 1;

const keyword = (text: string, keys: string[]) => keys.find((k) => text.toLowerCase().includes(k.toLowerCase()));
const countryOk = (cs: string[], c: string) => cs.includes("Global") || cs.includes(c);

/** Enumerate every assistance option that could apply, with feasibility checks. */
export function enumerateOptions(input: OptimizerInput, kb: OptimizerKB, ctx: OptimizerContext): { options: AssistanceOption[]; excluded: ExcludedOption[] } {
  const options: AssistanceOption[] = [];
  const excluded: ExcludedOption[] = [];
  let seq = 0;

  const timing = (title: string, processingDays: number, deadlineDays: number, confirmed: boolean) => {
    if (confirmed) return { ok: true, factor: 1 };
    if (ctx.programDaysLeft(deadlineDays) < 0) {
      excluded.push({ title, reason: "The programme's application window has closed." });
      return { ok: false, factor: 0 };
    }
    if (processingDays + PAYMENT_DAYS > ctx.daysLeft) {
      excluded.push({ title, reason: `Processing takes ~${processingDays} days — it would not finish before the deadline (${Math.max(ctx.daysLeft, 0)} days left).` });
      return { ok: false, factor: 0 };
    }
    const tight = processingDays + PAYMENT_DAYS > ctx.daysLeft * 0.6;
    return { ok: true, factor: tight ? 0.75 : 1 };
  };

  for (const e of input.expenses) {
    // Fee waivers, discounts and institutional programmes
    for (const w of kb.waivers) {
      if (!w.categories.includes(input.category) || !w.expenseCategories.includes(e.category)) continue;
      if (!countryOk(w.countries, input.country) || !w.levels.includes(input.level)) continue;
      if (w.emirates && !(input.emirate && w.emirates.includes(input.emirate))) continue;
      if (w.minBase && e.amount < w.minBase) continue;
      const confirmed = ctx.confirmedSourceIds.includes(w.id);
      if (!confirmed && !meetsRequirements(input.eligibility, w.requires)) {
        excluded.push({ title: w.name, reason: `Eligibility not met: requires that ${requirementReasons(w.requires).join(" and ")}.` });
        continue;
      }
      const t = timing(w.name, w.processingDays, w.deadlineDays, confirmed);
      if (!t.ok) continue;
      let amount = waiverValue(w, e.amount);
      if (w.kind === "institutional" && !confirmed) {
        if (ctx.institutionFund < amount) {
          excluded.push({ title: w.name, reason: `The institution's assistance fund (${ctx.institutionFund}) can't cover it right now.` });
          continue;
        }
        amount = Math.min(amount, ctx.institutionFund);
      }
      const base = w.kind === "waiver" ? 0.85 : w.kind === "discount" ? 0.95 : 0.85;
      options.push({
        id: `o${++seq}`,
        kind: w.kind === "institutional" ? "institutional" : w.kind,
        sourceId: w.id,
        title: w.name,
        provider: w.provider,
        expenseId: e.id,
        expenseLabel: e.label,
        amount,
        cash: w.kind === "institutional",
        processingDays: confirmed ? 0 : w.processingDays,
        likelihood: confirmed ? 1 : r2(base * t.factor),
        status: confirmed ? "Confirmed" : "Estimated",
        conflictsWith: w.conflictsWith ?? [],
        why: [`Covers ${e.label}`, ...requirementReasons(w.requires)],
      });
    }
    // Free alternatives
    for (const a of kb.alternatives) {
      if (!a.replaces.includes(e.category)) continue;
      if (a.emirates && !(input.emirate && a.emirates.includes(input.emirate))) continue;
      const hit = keyword(e.label, a.keywords);
      if (!hit) continue;
      const t = timing(a.name, a.processingDays, a.deadlineDays, ctx.confirmedSourceIds.includes(a.id));
      if (!t.ok) continue;
      options.push({ id: `o${++seq}`, kind: "alternative", sourceId: a.id, title: a.name, provider: a.provider, expenseId: e.id, expenseLabel: e.label, amount: e.amount, cash: false, processingDays: a.processingDays, likelihood: ctx.confirmedSourceIds.includes(a.id) ? 1 : r2(0.9 * t.factor), status: ctx.confirmedSourceIds.includes(a.id) ? "Confirmed" : "Estimated", conflictsWith: [], why: [`“${e.label}” matched “${hit}”`, a.description] });
    }
    // Equipment borrowing
    if (["equipment", "materials", "technology"].includes(e.category)) {
      const res = kb.resources.find((r) => keyword(e.label, r.keywords));
      if (res && res.available <= 0 && !ctx.confirmedSourceIds.includes(res.id)) excluded.push({ title: `Borrow: ${res.name}`, reason: "No units available right now — join the waitlist in Resource Rescue." });
      if (res && (res.available > 0 || ctx.confirmedSourceIds.includes(res.id))) {
        options.push({ id: `o${++seq}`, kind: "borrow", sourceId: res.id, title: `Borrow: ${res.name}`, provider: "Resource Rescue lending library", expenseId: e.id, expenseLabel: e.label, amount: Math.min(e.amount, res.retailValue), cash: false, processingDays: 1, likelihood: ctx.confirmedSourceIds.includes(res.id) ? 1 : 0.95, status: ctx.confirmedSourceIds.includes(res.id) ? "Confirmed" : "Estimated", conflictsWith: [], why: [`${res.available} of ${res.total} available`, "Borrowing avoids the purchase entirely"] });
      }
    }
    // Grants (limited by programme budget)
    for (const g of kb.grants) {
      if (!g.expenseCategories.includes(e.category)) continue;
      const confirmed = ctx.confirmedSourceIds.includes(g.id);
      if (!confirmed && !meetsRequirements(input.eligibility, g.requires)) {
        excluded.push({ title: g.name, reason: `Eligibility not met: requires that ${requirementReasons(g.requires).join(" and ")}.` });
        continue;
      }
      const budget = ctx.programFunds[g.id] ?? g.maxAmount;
      if (!confirmed && budget <= 0) {
        excluded.push({ title: g.name, reason: "This grant programme's budget is fully allocated." });
        continue;
      }
      const t = timing(g.name, g.processingDays, g.deadlineDays, confirmed);
      if (!t.ok) continue;
      options.push({ id: `o${++seq}`, kind: "grant", sourceId: g.id, title: g.name, provider: g.provider, expenseId: e.id, expenseLabel: e.label, amount: Math.min(g.maxAmount, e.amount, confirmed ? Infinity : budget), cash: true, processingDays: confirmed ? 0 : g.processingDays, likelihood: confirmed ? 1 : r2(0.75 * t.factor), status: confirmed ? "Confirmed" : "Estimated", conflictsWith: [], why: [`Covers up to ${g.maxAmount}`, ...requirementReasons(g.requires)] });
    }
  }
  // de-duplicate exclusion messages
  const seen = new Set<string>();
  return { options, excluded: excluded.filter((x) => (seen.has(x.title + x.reason) ? false : (seen.add(x.title + x.reason), true))) };
}

interface Policy {
  id: StrategyId;
  name: string;
  tagline: string;
  filter: (o: AssistanceOption) => boolean;
  order: (a: AssistanceOption, b: AssistanceOption) => number;
  studentFundsFirst: boolean;
  /** Cover the remainder from the institution's emergency fund when it can (faster than sponsors). */
  emergencyFund?: boolean;
}

const KIND_RANK: Record<OptionKind, number> = { waiver: 0, alternative: 1, discount: 2, borrow: 3, institutional: 4, grant: 5 };

export const POLICIES: Policy[] = [
  {
    id: "independent",
    name: "Lowest external dependency",
    tagline: "Use your own funds and cost reductions first; ask for outside money last.",
    filter: () => true,
    order: (a, b) => Number(a.cash) - Number(b.cash) || KIND_RANK[a.kind] - KIND_RANK[b.kind] || b.amount - a.amount,
    studentFundsFirst: true,
  },
  {
    id: "lowest-cost",
    name: "Lowest out-of-pocket cost",
    tagline: "Protect the student's own savings by using every eligible source of assistance.",
    filter: () => true,
    order: (a, b) => b.amount * b.likelihood - a.amount * a.likelihood || KIND_RANK[a.kind] - KIND_RANK[b.kind],
    studentFundsFirst: false,
  },
  {
    id: "fastest",
    name: "Fastest available solution",
    tagline: "Only options that can be secured within a school week, with the institution's emergency fund instead of waiting for sponsors.",
    filter: (o) => o.status === "Confirmed" || o.processingDays <= 5,
    order: (a, b) => a.processingDays - b.processingDays || b.amount - a.amount,
    studentFundsFirst: true,
    emergencyFund: true,
  },
];

function build(policy: Policy, input: OptimizerInput, options: AssistanceOption[], ctx: OptimizerContext): Strategy {
  const total = r2(input.expenses.reduce((s, e) => s + e.amount, 0));
  const remaining: Record<string, number> = Object.fromEntries(input.expenses.map((e) => [e.id, e.amount]));
  const feeReduced = new Set<string>(); // expense ids that already have a waiver/discount
  const borrowed = new Set<string>();
  const chosen: { o: AssistanceOption; amount: number }[] = [];
  const notes: string[] = [];
  let instFund = ctx.institutionFund;
  const grantLeft = { ...ctx.programFunds };

  let studentPays = 0;
  let gap = total;
  // Money already received is fixed and counted once.
  const funded = Math.min(ctx.alreadyFunded, gap);
  gap = r2(gap - funded);

  if (policy.studentFundsFirst) {
    studentPays = r2(Math.min(input.studentFunds, gap));
    gap = r2(gap - studentPays);
  }

  // Confirmed items always come first and are never dropped.
  const pool = [...options.filter((o) => o.status === "Confirmed"), ...options.filter((o) => o.status !== "Confirmed" && policy.filter(o)).sort(policy.order)];
  for (const o of pool) {
    if (gap <= 0) break;
    if (remaining[o.expenseId] <= 0) continue;
    const isFee = o.kind === "waiver" || o.kind === "discount";
    if (isFee && feeReduced.has(o.expenseId)) {
      notes.push(`${o.title} skipped — only one fee reduction can apply to “${o.expenseLabel}”.`);
      continue;
    }
    if (chosen.some((c) => o.conflictsWith.includes(c.o.sourceId) || c.o.conflictsWith.includes(o.sourceId))) {
      notes.push(`${o.title} can't be combined with an option already selected.`);
      continue;
    }
    if (o.kind === "grant" && borrowed.has(o.expenseId)) continue;
    if (chosen.some((c) => c.o.sourceId === o.sourceId && c.o.expenseId === o.expenseId)) continue;
    let amt = Math.min(o.amount, remaining[o.expenseId], gap);
    if (o.kind === "institutional" && o.status !== "Confirmed") amt = Math.min(amt, instFund);
    if (o.kind === "grant" && o.status !== "Confirmed") amt = Math.min(amt, grantLeft[o.sourceId] ?? o.amount);
    amt = r2(amt);
    if (amt <= 0) continue;
    chosen.push({ o, amount: amt });
    remaining[o.expenseId] = r2(remaining[o.expenseId] - amt);
    gap = r2(gap - amt);
    if (isFee) feeReduced.add(o.expenseId);
    if (o.kind === "borrow") borrowed.add(o.expenseId);
    if (o.kind === "institutional" && o.status !== "Confirmed") instFund -= amt;
    if (o.kind === "grant" && o.status !== "Confirmed") grantLeft[o.sourceId] = (grantLeft[o.sourceId] ?? 0) - amt;
  }

  if (policy.emergencyFund && gap > 0 && instFund >= gap) {
    const o: AssistanceOption = {
      id: "emergency",
      kind: "institutional",
      sourceId: "inst-emergency",
      title: "Institution emergency fund (fast-track)",
      provider: "Verifying institution",
      expenseId: input.expenses[0]?.id ?? "",
      expenseLabel: "remaining balance",
      amount: gap,
      cash: true,
      processingDays: VERIFY_DAYS,
      likelihood: 0.85,
      status: "Estimated",
      conflictsWith: [],
      why: ["Disbursed by the institution within ~2 days", "Uses limited institutional funds that could support other students"],
    };
    chosen.push({ o, amount: gap });
    notes.push(`Uses ${gap} of the institution's emergency fund to avoid waiting for sponsors.`);
    gap = 0;
  }

  if (!policy.studentFundsFirst && gap > 0) {
    // Lowest out-of-pocket: the student's savings are only used if no other source exists before sponsors.
    notes.push(`The student's ${input.studentFunds} in savings is protected; sponsors are asked to cover the remainder instead.`);
  }

  const sponsorNeeded = r2(Math.max(gap, 0));
  const costReductions = r2(chosen.filter((c) => !c.o.cash).reduce((s, c) => s + c.amount, 0));
  const externalCash = r2(chosen.filter((c) => c.o.cash).reduce((s, c) => s + c.amount, 0));
  const sponsorDays = sponsorNeeded > 0 ? VERIFY_DAYS + SPONSOR_DAYS : 0;
  const optionDays = Math.max(0, ...chosen.map((c) => c.o.processingDays));
  const daysToSecure = Math.max(optionDays, sponsorDays) + PAYMENT_DAYS;
  const sponsorLikelihood = sponsorNeeded <= 0 ? 1 : ctx.daysLeft >= sponsorDays + 5 ? 0.8 : ctx.daysLeft >= sponsorDays + PAYMENT_DAYS ? 0.6 : 0.3;
  const outside = chosen.reduce((s, c) => s + c.amount, 0) + sponsorNeeded;
  const likelihood = outside > 0 ? r2((chosen.reduce((s, c) => s + c.amount * c.o.likelihood, 0) + sponsorNeeded * sponsorLikelihood) / outside) : 1;
  const shortfall = r2(Math.max(total - funded - studentPays, 0));
  const platformResolved = r2(costReductions + externalCash + sponsorNeeded);

  const lines: StrategyLine[] = [
    ...(funded > 0 ? [{ label: "Assistance already received", kind: "funded" as const, amount: funded, status: "Confirmed" as const, processingDays: 0, likelihood: 1 }] : []),
    ...(studentPays > 0 ? [{ label: "Student's own funds", kind: "student" as const, amount: studentPays, status: "Own funds" as const, processingDays: 0, likelihood: 1 }] : []),
    ...chosen.map((c) => ({ label: c.o.title, kind: c.o.kind, amount: c.amount, status: c.o.status, processingDays: c.o.processingDays, likelihood: c.o.likelihood, sourceId: c.o.sourceId, expenseId: c.o.expenseId })),
    ...(sponsorNeeded > 0 ? [{ label: "Verified sponsor funding", kind: "sponsor" as const, amount: sponsorNeeded, status: "Pending" as const, processingDays: sponsorDays, likelihood: sponsorLikelihood }] : []),
  ];

  return {
    id: policy.id,
    name: policy.name,
    tagline: policy.tagline,
    lines,
    options: chosen.map((c) => ({ ...c.o, amount: c.amount })),
    totalCost: total,
    studentPays,
    costReductions,
    externalCash,
    sponsorNeeded,
    alreadyFunded: funded,
    daysToSecure,
    meetsDeadline: daysToSecure <= ctx.daysLeft,
    likelihood,
    externalDependency: total ? r2((externalCash + sponsorNeeded) / total) : 0,
    multiplier: sponsorNeeded > 0 ? r2(platformResolved / sponsorNeeded) : null,
    notes: [...new Set(notes)].concat(shortfall <= 0 ? [] : []),
  };
}

export function optimizeAssistance(input: OptimizerInput, kb: OptimizerKB, ctx: OptimizerContext): StrategyComparison {
  const { options, excluded } = enumerateOptions(input, kb, ctx);
  const strategies = POLICIES.map((p) => build(p, input, options, ctx));
  const by = Object.fromEntries(strategies.map((s) => [s.id, s])) as Record<StrategyId, Strategy>;

  // Recommend the BridgeFund default (lowest external dependency) unless it can't meet the deadline.
  let recommended: StrategyId = "independent";
  if (!by.independent.meetsDeadline && by.fastest.meetsDeadline) recommended = "fastest";

  const money = (n: number) => `AED ${Math.round(n).toLocaleString("en-AE")}`;
  const tradeoffs: string[] = [];
  tradeoffs.push(`Lowest out-of-pocket keeps the student's ${money(input.studentFunds)} but asks sponsors for ${money(by["lowest-cost"].sponsorNeeded)} — ${money(by["lowest-cost"].sponsorNeeded - by.independent.sponsorNeeded)} more than the independent strategy.`);
  if (by.fastest.daysToSecure < by.independent.daysToSecure) tradeoffs.push(`Fastest secures funding in ~${by.fastest.daysToSecure} days instead of ~${by.independent.daysToSecure}, but skips slower savings and needs ${money(by.fastest.sponsorNeeded)} from sponsors.`);
  else tradeoffs.push(`The fastest route takes ~${by.fastest.daysToSecure} days — no quicker than the others here, because the remaining steps (verification and sponsor funding) set the pace.`);
  tradeoffs.push(`Lowest external dependency uses ${money(by.independent.costReductions)} in cost reductions, leaving ${money(by.independent.sponsorNeeded + by.independent.externalCash)} to outside funders.`);
  if (!by.independent.meetsDeadline) tradeoffs.push("The independent strategy may not complete before the deadline, so the fastest route is recommended instead.");

  return { strategies, recommended, excluded, tradeoffs, daysLeft: ctx.daysLeft };
}
