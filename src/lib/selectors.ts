import type { AppState, FundingRequest, Opportunity } from "./types";
import { remainingOf } from "./actions";
import { daysUntil, sum } from "./format";

export interface Breakdown {
  total: number;
  personal: number;
  confirmedSavings: number;
  estimatedSavings: number;
  assistance: number;
  remaining: number;
}

export interface OppProgress extends Breakdown {
  opp: Opportunity;
  request?: FundingRequest;
  covered: number;
  secured: boolean;
}

export const requestForOpp = (s: AppState, oppId: string) => s.requests.find((r) => r.opportunityId === oppId && r.status !== "Rejected");

/** One consistent breakdown used on every page: total = personal + savings + assistance + remaining. */
export function oppProgress(s: AppState, opp: Opportunity): OppProgress {
  const request = requestForOpp(s, opp.id);
  const total = sum(opp.expenses.map((e) => e.amount));
  const personal = Math.min(opp.studentFunds + opp.priorAssistance, total);
  const confirmedSavings = request ? sum(request.reductions.filter((r) => r.confirmed).map((r) => r.amount)) : 0;
  const estimatedSavings = request ? sum(request.reductions.filter((r) => !r.confirmed).map((r) => r.amount)) : 0;
  const assistance = request ? request.funded : 0;
  const remaining = request ? remainingOf(request) : Math.max(total - personal, 0);
  const secured = total > 0 && remaining <= 0 && estimatedSavings === 0 && (!!request ? ["Fully Funded", "Completed"].includes(request.status) : personal >= total);
  return { opp, request, total, personal, confirmedSavings, estimatedSavings, assistance, remaining, covered: Math.max(total - remaining, 0), secured };
}

export function studentOverview(s: AppState, studentId = s.currentStudentId) {
  const progress = s.opportunities.filter((o) => o.studentId === studentId).map((o) => oppProgress(s, o));
  const active = progress.filter((p) => daysUntil(p.opp.deadline) >= 0 && p.request?.status !== "Completed");
  return {
    all: progress,
    active,
    total: sum(active.map((p) => p.total)),
    personal: sum(active.map((p) => p.personal)),
    remaining: sum(active.map((p) => p.remaining)),
    savings: sum(progress.map((p) => p.confirmedSavings + p.estimatedSavings)),
    confirmedSavings: sum(progress.map((p) => p.confirmedSavings)),
    assistance: sum(progress.map((p) => p.assistance)),
    requests: s.requests.filter((r) => r.studentId === studentId),
  };
}

export const verifiedNeeds = (s: AppState) => s.requests.filter((r) => ["Verified", "Partially Funded"].includes(r.status) && remainingOf(r) > 0 && daysUntil(r.deadline) >= 0);
export const studentOf = (s: AppState, id: string) => s.students.find((x) => x.id === id);
export const institutionOf = (s: AppState, id: string) => s.institutions.find((x) => x.id === id);
export const oppOf = (s: AppState, id: string) => s.opportunities.find((x) => x.id === id);
export const currentStudent = (s: AppState) => s.students.find((x) => x.id === s.currentStudentId)!;
export const inInstitutionScope = (s: AppState, r: FundingRequest) => s.currentInstitutionId === "all" || r.institutionId === s.currentInstitutionId;
