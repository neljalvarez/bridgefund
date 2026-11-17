import type { AppState, Opportunity } from "./types";
import { runBridgeEngine, type EnginePlan } from "./engine";
import { ALTERNATIVES, GRANTS, WAIVERS } from "./knowledge";

/** Run BridgeEngine for an opportunity using the live resource inventory. */
export function planFor(state: AppState, opp: Opportunity): EnginePlan {
  const student = state.students.find((s) => s.id === opp.studentId)!;
  const reservedIds = new Set(state.reservations.filter((r) => r.studentId === opp.studentId).map((r) => r.resourceId));
  return runBridgeEngine(
    {
      category: opp.category,
      country: student.country,
      expenses: opp.expenses,
      studentFunds: opp.studentFunds,
      priorAssistance: opp.priorAssistance,
      eligibility: student.eligibility,
    },
    {
      waivers: WAIVERS,
      alternatives: ALTERNATIVES,
      grants: GRANTS,
      // an item this student already reserved still counts as available to them
      resources: state.resources.map((r) => (reservedIds.has(r.id) ? { ...r, available: Math.max(r.available, 1) } : r)),
    },
  );
}
