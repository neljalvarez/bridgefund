import type { AppState, Opportunity } from "./types";
import { runBridgeEngine, type EnginePlan } from "./engine";
import { optimizeAssistance, type StrategyComparison } from "./optimizer";
import { ALTERNATIVES, GRANTS, WAIVERS } from "./knowledge";
import { daysBetween } from "./allocation";

function resourcesFor(state: AppState, studentId: string) {
  // an item this student already reserved still counts as available to them
  const mine = new Set(state.reservations.filter((r) => r.studentId === studentId && r.status !== "Cancelled").map((r) => r.resourceId));
  return state.resources.map((r) => (mine.has(r.id) ? { ...r, available: Math.max(r.available, 1) } : r));
}

/** BridgeEngine priority analysis for an opportunity, using the live resource inventory. */
export function planFor(state: AppState, opp: Opportunity): EnginePlan {
  const student = state.students.find((s) => s.id === opp.studentId)!;
  return runBridgeEngine(
    { category: opp.category, country: student.country, level: student.level, expenses: opp.expenses, studentFunds: opp.studentFunds, priorAssistance: opp.priorAssistance, eligibility: student.eligibility },
    { waivers: WAIVERS, alternatives: ALTERNATIVES, grants: GRANTS, resources: resourcesFor(state, opp.studentId) },
  );
}

/** BridgeEngine 2.0 strategies for an opportunity, using live funds, budgets, inventory and confirmed assistance. */
export function strategiesFor(state: AppState, opp: Opportunity, today = new Date()): StrategyComparison {
  const student = state.students.find((s) => s.id === opp.studentId)!;
  const request = state.requests.find((r) => r.opportunityId === opp.id && r.status !== "Rejected");
  const inst = state.institutions.find((i) => i.id === (request?.institutionId ?? opp.institutionId));
  const seeded = new Date(state.seededAt);
  return optimizeAssistance(
    { category: opp.category, country: student.country, level: student.level, expenses: opp.expenses, studentFunds: opp.studentFunds + opp.priorAssistance, eligibility: student.eligibility },
    { waivers: WAIVERS, alternatives: ALTERNATIVES, grants: GRANTS, resources: resourcesFor(state, opp.studentId) },
    {
      daysLeft: daysBetween(today, opp.deadline),
      programDaysLeft: (d) => d - daysBetween(seeded, today),
      institutionFund: inst?.fund ?? 0,
      programFunds: state.programFunds,
      confirmedSourceIds: request?.reductions.filter((x) => x.confirmed).map((x) => x.sourceId) ?? [],
      alreadyFunded: request?.funded ?? 0,
    },
  );
}
