import type { AppState, FundingRequest, Opportunity } from "./types";
import { remainingOf } from "./actions";
import { daysUntil, sum } from "./format";

export type SegmentSource = "student" | "reduction" | "sponsor" | "gap";
export interface BridgeSegment {
  source: SegmentSource;
  amount: number;
}

export interface OppProgress {
  opp: Opportunity;
  request?: FundingRequest;
  total: number;
  studentFunds: number;
  reductions: number;
  funded: number;
  covered: number;
  remaining: number;
  segments: BridgeSegment[];
  unlocked: boolean;
}

export function requestForOpp(s: AppState, oppId: string) {
  return s.requests.find((r) => r.opportunityId === oppId && r.status !== "Declined");
}

export function oppProgress(s: AppState, opp: Opportunity): OppProgress {
  const request = requestForOpp(s, opp.id);
  const total = sum(opp.expenses.map((e) => e.amount));
  const studentFunds = Math.min(opp.studentFunds + opp.priorAssistance, total);
  const reductions = request ? sum(request.reductions.map((r) => r.amount)) : 0;
  const funded = request ? request.funded : 0;
  let remaining = request ? remainingOf(request) : Math.max(total - studentFunds, 0);
  if (request && request.status === "Draft") remaining = Math.max(total - studentFunds - reductions, 0);
  const covered = Math.max(total - remaining, 0);
  const unlocked = total > 0 && remaining <= 0 && (!!request || studentFunds >= total);
  return {
    opp,
    request,
    total,
    studentFunds,
    reductions,
    funded,
    covered,
    remaining,
    unlocked,
    segments: [
      { source: "student", amount: studentFunds },
      { source: "reduction", amount: reductions },
      { source: "sponsor", amount: funded },
      { source: "gap", amount: remaining },
    ],
  };
}

export function studentOverview(s: AppState, studentId = s.currentStudentId) {
  const opps = s.opportunities.filter((o) => o.studentId === studentId);
  const progress = opps.map((o) => oppProgress(s, o));
  const active = progress.filter((p) => daysUntil(p.opp.deadline) >= 0);
  return {
    opps: progress,
    active,
    total: sum(active.map((p) => p.total)),
    covered: sum(active.map((p) => p.covered)),
    remaining: sum(active.map((p) => p.remaining)),
    saved: sum(progress.map((p) => p.reductions)),
    requests: s.requests.filter((r) => r.studentId === studentId),
  };
}

export const verifiedNeeds = (s: AppState) =>
  s.requests.filter((r) => ["Verified", "Partially Funded"].includes(r.status) && remainingOf(r) > 0 && daysUntil(r.deadline) >= 0);

export const studentOf = (s: AppState, id: string) => s.students.find((x) => x.id === id);
export const institutionOf = (s: AppState, id: string) => s.institutions.find((x) => x.id === id);
export const oppOf = (s: AppState, id: string) => s.opportunities.find((x) => x.id === id);
export const currentStudent = (s: AppState) => s.students.find((x) => x.id === s.currentStudentId)!;
