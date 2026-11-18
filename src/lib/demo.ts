/**
 * The 90-second demo script. Each step is one real action on the shared demo data,
 * computed from the latest state so it behaves the same however many times it runs.
 */
import type { Action } from "./actions";
import { applyEnginePlan, approveRequest, confirmCompleted, fundRequest, giveGuardianConsent, remainingOf } from "./actions";
import { DEMO_OPPORTUNITY_ID, DEMO_SPONSOR_ID } from "./seed";
import { oppOf, requestForOpp } from "./selectors";
import { planFor } from "./plan";

export const DEMO_STEPS: Action[] = [
  // 1 · Student runs BridgeEngine and submits, with guardian consent (she is 16).
  (s) => {
    const opp = oppOf(s, DEMO_OPPORTUNITY_ID);
    if (!opp || requestForOpp(s, DEMO_OPPORTUNITY_ID)) return s;
    const n = applyEnginePlan(opp.id, planFor(s, opp), true)(s);
    const r = requestForOpp(n, DEMO_OPPORTUNITY_ID);
    return r ? giveGuardianConsent(r.id)(n) : n;
  },
  // 2 · Her school verifies; estimated savings become confirmed assistance.
  (s) => {
    const r = requestForOpp(s, DEMO_OPPORTUNITY_ID);
    return r && ["Submitted", "Under Review"].includes(r.status) ? approveRequest(r.id)(s) : s;
  },
  // 3 · A sponsor funds what is left.
  (s) => {
    const r = requestForOpp(s, DEMO_OPPORTUNITY_ID);
    return r && remainingOf(r) > 0 ? fundRequest(r.id, remainingOf(r), "sponsor", DEMO_SPONSOR_ID)(s) : s;
  },
  // 4 · The school confirms completion; providers are paid (simulated).
  (s) => {
    const r = requestForOpp(s, DEMO_OPPORTUNITY_ID);
    return r?.status === "Fully Funded" ? confirmCompleted(r.id)(s) : s;
  },
];
