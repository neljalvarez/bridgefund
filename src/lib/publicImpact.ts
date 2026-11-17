/**
 * Public Social Impact Dashboard metrics — computed from the demonstration
 * state. Three tiers are kept separate on purpose:
 *   1. Financial barrier resolved  (request Fully Funded / Completed)
 *   2. Educational participation   (institution recorded the student took part)
 *   3. Confirmed outcome           (institution recorded the opportunity was completed)
 */
import type { AppState, FundingRequest } from "./types";
import { RESOLVED, portfolioImpact, requestImpact } from "./impact";
import { daysBetween } from "./allocation";
import { OPP_LABEL } from "./format";

export interface ImpactFilter {
  country: string; // "all" or a country
  category: string; // "all" or an opportunity category key
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function resolvedAt(r: FundingRequest) {
  return r.history.find((h) => h.status === "Fully Funded")?.at ?? (r.status === "Completed" ? r.history.find((h) => h.status === "Completed")?.at : undefined);
}

export function publicImpact(state: AppState, f: ImpactFilter) {
  const country = (r: FundingRequest) => state.students.find((s) => s.id === r.studentId)?.country ?? "Unknown";
  const category = (r: FundingRequest) => state.opportunities.find((o) => o.id === r.opportunityId)?.category ?? "course";
  const scope = state.requests.filter((r) => r.status !== "Draft" && (f.country === "all" || country(r) === f.country) && (f.category === "all" || category(r) === f.category));
  const resolved = scope.filter((r) => RESOLVED.includes(r.status));
  const p = portfolioImpact(scope, state.contributions);
  const confirmedKind = (r: FundingRequest, kinds: string[]) => r.reductions.filter((x) => x.confirmed && kinds.includes(x.kind)).reduce((a, x) => a + x.amount, 0);
  const waiverSavings = r2(resolved.reduce((a, r) => a + confirmedKind(r, ["waiver", "discount", "alternative"]), 0));
  const borrowSavings = r2(resolved.reduce((a, r) => a + confirmedKind(r, ["borrow"]), 0));
  const sponsorAllocated = r2(state.contributions.filter((c) => (c.source === "sponsor" || c.source === "pool") && scope.some((r) => r.id === c.requestId)).reduce((a, c) => a + c.amount, 0));

  // Average share of the shortfall removed by confirmed reductions (resolved requests only).
  const reductionShares = resolved
    .map((r) => {
      const i = requestImpact(r, state.contributions);
      return i.shortfall > 0 ? i.reductions / i.shortfall : null;
    })
    .filter((x): x is number => x !== null);
  const avgGapReduction = reductionShares.length ? Math.round((reductionShares.reduce((a, b) => a + b, 0) / reductionShares.length) * 100) : null;

  const durations = resolved.map((r) => (resolvedAt(r) ? daysBetween(r.createdAt, resolvedAt(r)!) : null)).filter((x): x is number => x !== null && x >= 0);
  const avgDaysToResolve = durations.length ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10 : null;

  const participated = resolved.filter((r) => r.outcome === "Participated" || r.outcome === "Completed opportunity").length;
  const completedOutcome = resolved.filter((r) => r.outcome === "Completed opportunity").length;
  const notRecorded = resolved.filter((r) => !r.outcome).length;

  const byCategory = Object.entries(OPP_LABEL)
    .map(([k, label]) => {
      const xs = resolved.filter((r) => category(r) === k);
      const i = portfolioImpact(xs, state.contributions);
      return { name: label, Reductions: i.reductions, Institutional: i.institutional, Sponsors: i.sponsor, total: i.resolved };
    })
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);

  const countries = [...new Set(scope.map(country))].sort();
  const byCountry = countries
    .map((c) => {
      const xs = scope.filter((r) => country(r) === c);
      const rs = xs.filter((r) => RESOLVED.includes(r.status));
      return { country: c, requests: xs.length, resolved: rs.length, students: new Set(rs.map((r) => r.studentId)).size, amount: portfolioImpact(xs, state.contributions).resolved };
    })
    .sort((a, b) => b.amount - a.amount || b.requests - a.requests);

  return {
    requests: scope.length,
    studentsSupported: new Set(resolved.map((r) => r.studentId)).size,
    opportunitiesFunded: resolved.length,
    barriersResolved: p.resolved,
    sponsorAllocated,
    waiverSavings,
    borrowSavings,
    avgGapReduction,
    avgDaysToResolve,
    multiplier: p.multiplier,
    participated,
    completedOutcome,
    notRecorded,
    byCategory,
    byCountry,
  };
}

export const ALL_COUNTRIES = (state: AppState) => [...new Set(state.students.map((s) => s.country))].sort();
