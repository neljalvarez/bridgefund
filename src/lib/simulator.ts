/**
 * Opportunity Rescue Simulator — simulation estimates only.
 *
 * Scenario A (conventional crowdfunding): the whole shortfall (cost − student
 * funds) is raised from donors, plus an assumed platform/payment fee that is
 * deducted from what donors give.
 * Scenario B (BridgeFund): cost reductions (waivers, borrowing) and
 * institutional assistance are applied first; sponsors fund only what remains.
 * No fee is deducted from sponsor money in Scenario B, because BridgeFund's
 * fees are charged to institutions and programmes.
 */
export interface SimInput {
  cost: number;
  studentFunds: number;
  waivers: number;
  borrowing: number;
  institutional: number;
  sponsorBudget: number;
  /** Assumed share of donations lost to crowdfunding platform + payment fees (0–1). */
  crowdFee: number;
}

export interface SimResult {
  shortfall: number; // cost − student funds
  reductions: number; // waivers + borrowing actually usable
  institutional: number; // institutional assistance actually usable
  crowdDonorsNeeded: number; // Scenario A: donor money required to net the shortfall
  bridgeSponsorNeeded: number; // Scenario B: sponsor money required
  moneySaved: number; // cost removed instead of fundraised
  sponsorConserved: number; // A − B
  opportunitiesA: number; // whole opportunities the sponsor budget could rescue under A
  opportunitiesB: number; // … under B
  extraOpportunities: number;
  multiplier: number | null; // barriers resolved ÷ sponsor funding (B)
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

export function simulate(i: SimInput): SimResult {
  const cost = Math.max(i.cost, 0);
  const shortfall = r2(Math.max(cost - Math.max(i.studentFunds, 0), 0));
  // Reductions cannot exceed the shortfall; institutional assistance covers what reductions leave.
  const reductions = r2(clamp(i.waivers + i.borrowing, 0, shortfall));
  const institutional = r2(clamp(i.institutional, 0, shortfall - reductions));
  const bridgeSponsorNeeded = r2(shortfall - reductions - institutional);
  const fee = clamp(i.crowdFee, 0, 0.5);
  const crowdDonorsNeeded = r2(shortfall / (1 - fee));
  const per = (need: number) => (need <= 0 ? Infinity : Math.floor((i.sponsorBudget + 1e-9) / need));
  const opportunitiesA = per(crowdDonorsNeeded);
  const opportunitiesB = per(bridgeSponsorNeeded);
  const resolved = r2(reductions + institutional + bridgeSponsorNeeded);
  return {
    shortfall,
    reductions,
    institutional,
    crowdDonorsNeeded,
    bridgeSponsorNeeded,
    moneySaved: reductions,
    sponsorConserved: r2(crowdDonorsNeeded - bridgeSponsorNeeded),
    opportunitiesA,
    opportunitiesB,
    extraOpportunities: Number.isFinite(opportunitiesB) && Number.isFinite(opportunitiesA) ? opportunitiesB - opportunitiesA : Infinity,
    multiplier: bridgeSponsorNeeded > 0 ? r2(resolved / bridgeSponsorNeeded) : null,
  };
}
