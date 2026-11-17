/**
 * Financial Deadline Rescue — flags students at risk of missing an opportunity
 * because a financial barrier is unresolved. It recommends actions; it never
 * approves or rejects anyone. Staff make every decision.
 */
import type { AppState, FundingRequest, Opportunity } from "./types";
import { daysBetween } from "./allocation";
import { usd } from "./format";

export type RiskLevel = "Deadline passed" | "Critical" | "At risk" | "Watch" | "On track" | "Secured";

export interface DeadlineAssessment {
  level: RiskLevel;
  daysLeft: number;
  gap: number;
  estDays: number;
  nextAction: string;
  alternatives: string[];
  steps: { label: string; days: number }[];
}

const VERIFY = 2;
const SPONSOR = 4;
const PAYMENT = 1;

export function assessDeadline(state: AppState, opp: Opportunity, r: FundingRequest | undefined, today = new Date()): DeadlineAssessment {
  const daysLeft = daysBetween(today, opp.deadline);
  const total = opp.expenses.reduce((s, e) => s + e.amount, 0);
  const gap = r ? Math.max(r.amount - r.funded, 0) : Math.max(total - opp.studentFunds - opp.priorAssistance, 0);
  const inst = state.institutions.find((i) => i.id === (r?.institutionId ?? opp.institutionId));
  const pendingSavings = r ? r.reductions.filter((x) => !x.confirmed) : [];
  const steps: { label: string; days: number }[] = [];

  if (r && ["Fully Funded", "Completed"].includes(r.status)) {
    return { level: "Secured", daysLeft, gap: 0, estDays: r.status === "Completed" ? 0 : PAYMENT, nextAction: r.status === "Completed" ? "Provider paid — nothing left to do." : "Institution confirms payment to the provider.", alternatives: [], steps: r.status === "Completed" ? [] : [{ label: "Payment to provider", days: PAYMENT }] };
  }

  if (!r) steps.push({ label: "Run BridgeEngine and submit", days: 1 });
  if (!r || ["Draft", "Submitted", "Under Review"].includes(r.status)) steps.push({ label: "Institutional verification", days: VERIFY });
  if (r?.status === "Additional Information Required") steps.push({ label: "Student provides documents + re-review", days: VERIFY + 1 });
  if (pendingSavings.length) steps.push({ label: "Pending savings processed", days: 5 });
  if (gap > 0) steps.push({ label: "Sponsor funding", days: SPONSOR });
  steps.push({ label: "Payment to provider", days: PAYMENT });
  const estDays = steps.reduce((s, x) => s + x.days, 0);

  const alternatives: string[] = [];
  if (gap > 0 && inst && inst.fund >= gap) alternatives.push(`${inst.name}'s emergency fund (${usd(inst.fund)} available) could cover the remaining ${usd(gap)} within ~2 days, pending staff approval.`);
  if (gap > 0) alternatives.push("Ask the provider for a short payment extension — many exam boards and universities allow a few extra days on request.");
  if (pendingSavings.length) alternatives.push("If a pending waiver can't process in time, the institution can pay the fee now and claim the waiver as a reimbursement.");
  if (opp.expenses.some((e) => ["equipment", "materials", "technology"].includes(e.category))) alternatives.push("Borrow equipment from Resource Rescue instead of waiting for funds to buy it.");

  let level: RiskLevel;
  if (daysLeft < 0) level = "Deadline passed";
  else if (estDays > daysLeft) level = "Critical";
  else if (estDays > daysLeft * 0.6 || daysLeft <= 7) level = "At risk";
  else if (daysLeft <= 21) level = "Watch";
  else level = "On track";

  let nextAction: string;
  if (daysLeft < 0) nextAction = "Contact the provider about a late payment or the next intake; keep the request on file.";
  else if (!r) nextAction = "Run BridgeEngine and submit a request today.";
  else if (r.status === "Draft") nextAction = "Submit the draft request for verification.";
  else if (r.status === "Additional Information Required") nextAction = "Student must upload the requested documents.";
  else if (["Submitted", "Under Review"].includes(r.status)) nextAction = level === "Critical" || level === "At risk" ? "Prioritise verification — review this case today." : "Complete verification.";
  else nextAction = level === "Critical" ? "Consider the emergency fund — sponsor funding may arrive too late." : "Share with sponsors; consider pool funds if it stalls.";

  return { level, daysLeft, gap, estDays, nextAction, alternatives: level === "On track" ? alternatives.slice(0, 1) : alternatives, steps };
}

export const RISK_ORDER: RiskLevel[] = ["Critical", "At risk", "Deadline passed", "Watch", "On track", "Secured"];
