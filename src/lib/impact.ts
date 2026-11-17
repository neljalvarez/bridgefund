/**
 * BridgeFund Impact Multiplier
 *
 *   multiplier = financial barriers resolved ÷ sponsor funding used
 *
 * "Barriers resolved" counts only what the platform contributed: confirmed
 * cost reductions (waivers, free alternatives, discounts, borrowed equipment),
 * grants, institutional assistance and sponsor money. The student's own funds
 * are NEVER counted as platform-generated impact.
 *
 * Only requests whose gap is fully closed (Fully Funded / Completed) count.
 * Shared-pool money is sponsor money, so it counts in the denominator.
 */
import type { Contribution, FundingRequest } from "./types";

const r2 = (n: number) => Math.round(n * 100) / 100;
export const RESOLVED = ["Fully Funded", "Completed"];

export interface ImpactBreakdown {
  shortfall: number; // cost minus the student's own funds
  reductions: number;
  institutional: number;
  sponsor: number;
  resolved: number;
  multiplier: number | null;
}

export function requestImpact(r: FundingRequest, contributions: Contribution[]): ImpactBreakdown {
  const mine = contributions.filter((c) => c.requestId === r.id);
  const sponsor = r2(mine.filter((c) => c.source === "sponsor" || c.source === "pool").reduce((s, c) => s + c.amount, 0));
  const institutional = r2(mine.filter((c) => c.source === "institution").reduce((s, c) => s + c.amount, 0));
  const reductions = r2(r.reductions.filter((x) => x.confirmed).reduce((s, x) => s + x.amount, 0));
  const resolved = r2(reductions + institutional + sponsor);
  return { shortfall: r2(Math.max(r.totalCost - r.studentFunds, 0)), reductions, institutional, sponsor, resolved, multiplier: sponsor > 0 ? r2(resolved / sponsor) : null };
}

export function portfolioImpact(requests: FundingRequest[], contributions: Contribution[]) {
  const done = requests.filter((r) => RESOLVED.includes(r.status));
  const parts = done.map((r) => requestImpact(r, contributions));
  const resolved = r2(parts.reduce((s, p) => s + p.resolved, 0));
  const sponsor = r2(parts.reduce((s, p) => s + p.sponsor, 0));
  return {
    count: done.length,
    resolved,
    sponsor,
    reductions: r2(parts.reduce((s, p) => s + p.reductions, 0)),
    institutional: r2(parts.reduce((s, p) => s + p.institutional, 0)),
    multiplier: sponsor > 0 ? r2(resolved / sponsor) : null,
  };
}

export const fmtMultiplier = (m: number | null) => (m === null ? "—" : `${m.toFixed(2)}x`);
