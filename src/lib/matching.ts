/**
 * Supply & demand matching — pairs specific student needs with resources and
 * programmes that can meet them. Staff confirm availability before anything is
 * assigned, and each resource unit / programme allocation can only be assigned once.
 */
import type { AppState, Expense, ExpenseCategory } from "./types";
import { GRANTS, WAIVERS } from "./knowledge";
import { meetsRequirements, waiverValue } from "./engine";

export type MatchKind = "resource" | "waiver" | "transport" | "grant";

export interface MatchSuggestion {
  key: string;
  studentId: string;
  opportunityId: string;
  requestId?: string;
  expense: Expense;
  sourceId: string;
  sourceName: string;
  kind: MatchKind;
  amount: number;
  reasons: string[];
  available: boolean;
  availability: string;
}

const LOCKED = ["Completed", "Rejected"];
const hit = (text: string, keys: string[]) => keys.find((k) => text.toLowerCase().includes(k.toLowerCase()));

export function findMatches(state: AppState): MatchSuggestion[] {
  const out: MatchSuggestion[] = [];
  const assigned = new Set(state.matches.map((m) => m.key)); // assigned or already suggested — never offered twice
  for (const opp of state.opportunities) {
    const st = state.students.find((s) => s.id === opp.studentId);
    if (!st) continue;
    const r = state.requests.find((x) => x.opportunityId === opp.id && x.status !== "Rejected");
    if (r && (LOCKED.includes(r.status) || r.status === "Fully Funded")) continue;
    if (new Date(opp.deadline) < new Date(new Date().toDateString())) continue;
    const used = new Set(r?.reductions.map((x) => `${x.sourceId}:${x.expenseId ?? ""}`) ?? []);
    const usedSource = new Set(r?.reductions.map((x) => x.sourceId) ?? []);
    const inst = state.institutions.find((i) => i.id === (r?.institutionId ?? opp.institutionId));

    for (const e of opp.expenses) {
      const reducedOnLine = r?.reductions.filter((x) => x.expenseId === e.id).reduce((s, x) => s + x.amount, 0) ?? 0;
      if (reducedOnLine >= e.amount) continue;
      const push = (m: Omit<MatchSuggestion, "key" | "studentId" | "opportunityId" | "requestId" | "expense">) => {
        const key = `${opp.id}:${e.id}:${m.sourceId}`;
        if (assigned.has(key) || used.has(`${m.sourceId}:${e.id}`) || usedSource.has(m.sourceId)) return;
        out.push({ ...m, key, studentId: st.id, opportunityId: opp.id, requestId: r?.id, expense: e });
      };

      // Equipment & lab items → institutional lending inventory
      if ((["equipment", "materials", "technology"] as ExpenseCategory[]).includes(e.category)) {
        for (const res of state.resources) {
          const k = hit(e.label, res.keywords);
          if (!k) continue;
          const already = state.reservations.some((rv) => rv.resourceId === res.id && rv.studentId === st.id && ["Reserved", "Collected"].includes(rv.status));
          if (already) continue;
          const lender = state.institutions.find((i) => i.id === res.institutionId);
          const saves = Math.min(e.amount, res.retailValue);
          push({ sourceId: res.id, sourceName: `${res.name} — ${lender?.name}`, kind: "resource", amount: saves, reasons: [`“${e.label}” matches “${k}”`, `Loan term: ${res.loanTerm}`, `Avoids an AED ${saves} purchase`], available: res.available > 0, availability: res.available > 0 ? `${res.available} of ${res.total} available` : "None available — waitlist" });
        }
      }
      // Exam & registration fees → eligible fee reductions
      if (e.category === "examination" || e.category === "registration") {
        for (const w of WAIVERS.filter((w) => w.kind !== "institutional")) {
          if (!w.categories.includes(opp.category) || !w.expenseCategories.includes(e.category)) continue;
          if (!(w.countries.includes("Global") || w.countries.includes(st.country)) || !w.levels.includes(st.level)) continue;
          if (w.emirates && !w.emirates.includes(st.emirate)) continue;
          if (!meetsRequirements(st.eligibility, w.requires)) continue;
          push({ sourceId: w.id, sourceName: w.name, kind: "waiver", amount: waiverValue(w, e.amount), reasons: [`Applies to ${opp.category.replace("-", " ")} ${e.category} fees`, `Offered in ${w.countries.includes("Global") ? "all countries" : st.country}`, "Student meets the listed eligibility signals"], available: true, availability: `Processing ~${w.processingDays} days` });
        }
      }
      // Transport → student fare discounts, institutional travel support, then microgrants
      if (e.category === "transportation") {
        for (const w of WAIVERS.filter((w) => w.kind === "discount" && w.expenseCategories.includes("transportation"))) {
          if (w.emirates && !w.emirates.includes(st.emirate)) continue;
          if (w.minBase && e.amount < w.minBase) continue;
          push({ sourceId: w.id, sourceName: w.name, kind: "transport", amount: waiverValue(w, e.amount), reasons: [`Student lives in ${st.emirate}`, `${w.savings}% off fares`, "Real programme — student applies directly"], available: true, availability: `Processing ~${w.processingDays} days (estimate)` });
        }
        const travel = WAIVERS.find((w) => w.id === "i-school-stem-travel")!;
        if (travel.categories.includes(opp.category) && meetsRequirements(st.eligibility, travel.requires)) {
          const amt = Math.min(travel.savings, e.amount);
          push({ sourceId: travel.id, sourceName: `${travel.name} — ${inst?.name}`, kind: "transport", amount: amt, reasons: ["Institutional programme for school-related travel", "Paid directly to the transport provider"], available: (inst?.fund ?? 0) >= amt, availability: `${inst?.name} fund: AED ${Math.round(inst?.fund ?? 0)}` });
        }
        const g = GRANTS.find((x) => x.id === "g-ptsa")!;
        if (meetsRequirements(st.eligibility, g.requires)) {
          const left = state.programFunds[g.id] ?? 0;
          push({ sourceId: g.id, sourceName: g.name, kind: "grant", amount: Math.min(g.maxAmount, e.amount), reasons: ["Covers travel to educational events", "Student meets the income criterion"], available: left >= Math.min(g.maxAmount, e.amount), availability: `Programme budget left: AED ${Math.round(left)}` });
        }
      }
    }
  }
  return out;
}
