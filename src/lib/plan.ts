import type { AppState, Opportunity } from "./types";
import { runBridgeEngine, type EnginePlan } from "./engine";
import { ALTERNATIVES, GRANTS, WAIVERS } from "./knowledge";

/** Run BridgeEngine for an opportunity using the live resource inventory. */
export function planFor(state: AppState, opp: Opportunity): EnginePlan {
  const student = state.students.find((s) => s.id === opp.studentId)!;
  const mine = new Set(state.reservations.filter((r) => r.studentId === opp.studentId && r.status !== "Cancelled").map((r) => r.resourceId));
  return runBridgeEngine(
    { category: opp.category, country: student.country, level: student.level, expenses: opp.expenses, studentFunds: opp.studentFunds, priorAssistance: opp.priorAssistance, eligibility: student.eligibility },
    // an item this student already reserved still counts as available to them
    { waivers: WAIVERS, alternatives: ALTERNATIVES, grants: GRANTS, resources: state.resources.map((r) => (mine.has(r.id) ? { ...r, available: Math.max(r.available, 1) } : r)) },
  );
}
