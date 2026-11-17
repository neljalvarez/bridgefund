/**
 * Region registry. The United Arab Emirates is the launch market; amounts are
 * stored and calculated in AED. Other currencies are DISPLAY ONLY. The USD rate
 * reflects the AED's fixed peg (USD 1 = AED 3.6725); the rest are illustrative.
 * Assistance rules are never assumed to be identical across emirates or countries:
 * every programme records where it applies.
 */
export interface Currency {
  code: string;
  label: string;
  /** Units per 1 AED — display only. */
  rate: number;
}

export const CURRENCIES: Currency[] = [
  { code: "AED", label: "UAE dirham", rate: 1 },
  { code: "USD", label: "US dollar (peg)", rate: 1 / 3.6725 },
  { code: "EUR", label: "Euro (illustrative)", rate: 0.25 },
  { code: "INR", label: "Indian rupee (illustrative)", rate: 23 },
  { code: "PHP", label: "Philippine peso (illustrative)", rate: 15.8 },
  { code: "PKR", label: "Pakistani rupee (illustrative)", rate: 76 },
];

export interface Market {
  country: string; // emirate or country
  currency: string;
  educationSystem: string; // regulator / system
  languages: string[];
  phase: "Launch market" | "Phase 2" | "Phase 3" | "Phase 4" | "International";
  partnerModel: string;
}

/** Proposed expansion: Abu Dhabi first, then Dubai, Sharjah and the remaining emirates, then the region. */
export const MARKETS: Market[] = [
  { country: "Abu Dhabi", currency: "AED", educationSystem: "ADEK-regulated public and private schools", languages: ["Arabic", "English"], phase: "Launch market", partnerModel: "Pilot with a small group of Abu Dhabi schools" },
  { country: "Dubai", currency: "AED", educationSystem: "KHDA private schools; MoE public schools", languages: ["Arabic", "English"], phase: "Phase 2", partnerModel: "Private school groups and university outreach offices" },
  { country: "Sharjah", currency: "AED", educationSystem: "SPEA private schools; MoE public schools", languages: ["Arabic", "English"], phase: "Phase 3", partnerModel: "School networks and university partners" },
  { country: "Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah", currency: "AED", educationSystem: "MoE public schools and private schools", languages: ["Arabic", "English"], phase: "Phase 4", partnerModel: "Ministry-aligned school clusters" },
  { country: "GCC and beyond", currency: "Local", educationSystem: "Configured per country", languages: ["Arabic", "English", "+ local"], phase: "International", partnerModel: "Institutional partners in each market" },
];

export const LAUNCH_MARKET = MARKETS[0];
