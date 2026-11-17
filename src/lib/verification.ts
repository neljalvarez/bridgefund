/**
 * Simulated verification & fraud-prevention checks. Checks raise flags for a
 * human reviewer; they never approve or reject a request on their own.
 */
import type { AppState, FundingRequest } from "./types";

export type CheckStatus = "pass" | "warn" | "fail" | "pending";

export interface VerificationCheck {
  key: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

const ACTIVE = ["Draft", "Submitted", "Under Review", "Additional Information Required", "Verified", "Partially Funded", "Fully Funded"];

/** Other active requests from the same student that look like the same need, or reuse the same assistance. */
export function findDuplicates(state: AppState, r: FundingRequest) {
  return state.requests.filter((o) => {
    if (o.id === r.id || o.studentId !== r.studentId || !ACTIVE.includes(o.status)) return false;
    if (o.opportunityId === r.opportunityId) return true;
    const sameExpense = o.expenses.some((a) => r.expenses.some((b) => a.category === b.category && Math.abs(a.amount - b.amount) <= Math.max(2, b.amount * 0.1) && a.label.toLowerCase().split(" ")[0] === b.label.toLowerCase().split(" ")[0]));
    const sameProgram = o.reductions.some((a) => r.reductions.some((b) => a.sourceId === b.sourceId && a.kind !== "borrow"));
    return sameExpense || sameProgram;
  });
}

export function verificationChecks(state: AppState, r: FundingRequest): VerificationCheck[] {
  const st = state.students.find((s) => s.id === r.studentId);
  const opp = state.opportunities.find((o) => o.id === r.opportunityId);
  const dupes = findDuplicates(state, r);
  const docsMissing = r.documents.filter((d) => !d.attached);
  const docsRejected = r.documents.filter((d) => d.review === "Rejected");
  const docsAccepted = r.documents.filter((d) => d.review === "Accepted");
  const unconfirmedCost = r.expenses.filter((e) => !e.confirmed);
  const reductionTotal = r.reductions.reduce((s, x) => s + x.amount, 0);
  const arithmeticOk = Math.abs(r.totalCost - r.studentFunds - reductionTotal - r.amount) < 0.01 && r.amount >= 0;

  return [
    {
      key: "enrollment",
      label: "Institutional verification",
      status: r.checks?.enrollment ? "pass" : st?.institutionId !== r.institutionId ? "warn" : "pending",
      detail: r.checks?.enrollment ? "Enrollment confirmed by staff." : st?.institutionId !== r.institutionId ? "The verifying institution differs from the student's enrolled school." : "Confirm the student is enrolled.",
    },
    {
      key: "opportunity",
      label: "Opportunity verification",
      status: r.checks?.opportunity ? "pass" : "pending",
      detail: r.checks?.opportunity ? `Confirmed with ${opp?.provider ?? "the provider"}.` : `Confirm the opportunity and fee with ${opp?.provider ?? "the provider"}.`,
    },
    {
      key: "expenses",
      label: "Expense documentation",
      status: docsRejected.length ? "fail" : docsMissing.length ? "warn" : r.checks?.expenses || docsAccepted.length === r.documents.length ? "pass" : "pending",
      detail: docsRejected.length ? `${docsRejected.map((d) => d.name).join(", ")} rejected.` : docsMissing.length ? `Missing: ${docsMissing.map((d) => d.name).join(", ")}.` : unconfirmedCost.length ? `${unconfirmedCost.length} cost(s) are estimates — review the evidence.` : "All costs supported by documents.",
    },
    {
      key: "guardian",
      label: "Guardian consent",
      status: !st || st.age >= 18 || r.guardianConsent === "Not required" ? "pass" : r.guardianConsent === "Given" ? "pass" : "warn",
      detail: !st || st.age >= 18 ? "Not required (18 or over)." : r.guardianConsent === "Given" ? "A parent or guardian has consented (simulated)." : `Student is ${st.age} — guardian consent is still needed.`,
    },
    {
      key: "duplicate",
      label: "Duplicate assistance check",
      status: dupes.length ? "fail" : "pass",
      detail: dupes.length ? `Possible duplicate of ${dupes.map((d) => d.ref).join(", ")}.` : "No overlapping requests or reused programmes found.",
    },
    {
      key: "arithmetic",
      label: "Amount consistency",
      status: arithmeticOk ? "pass" : "fail",
      detail: arithmeticOk ? "Cost − personal funds − savings = requested amount." : "The requested amount doesn't reconcile with costs and savings.",
    },
  ];
}

/** A request needs manual attention if any check fails/warns or a manual flag is open. */
export function needsReview(state: AppState, r: FundingRequest) {
  return (r.flags ?? []).some((f) => !f.resolved) || verificationChecks(state, r).some((c) => c.status === "fail" || c.status === "warn");
}
