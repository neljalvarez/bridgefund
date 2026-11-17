/**
 * Region registry — the foundation for international expansion.
 * Assistance rules are NOT assumed to be identical across countries: every
 * programme in the knowledge base is scoped to the countries, education levels
 * and eligibility rules it actually applies to, and each market below records
 * its own currency, education system and launch phase.
 *
 * Exchange rates are fixed, illustrative values used for DISPLAY ONLY. All
 * calculations are performed in USD. A production system would use a licensed
 * FX feed and settle in local currency through local payment providers.
 */
export interface Currency {
  code: string;
  label: string;
  /** Illustrative units per 1 USD — display only. */
  rate: number;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", label: "US dollar", rate: 1 },
  { code: "KES", label: "Kenyan shilling", rate: 129 },
  { code: "PHP", label: "Philippine peso", rate: 58 },
  { code: "INR", label: "Indian rupee", rate: 84 },
  { code: "BRL", label: "Brazilian real", rate: 5.4 },
  { code: "EUR", label: "Euro", rate: 0.92 },
];

export interface Market {
  country: string;
  currency: string;
  educationSystem: string;
  languages: string[];
  phase: "Launch market" | "Phase 2" | "Phase 3";
  partnerModel: string;
}

export const MARKETS: Market[] = [
  { country: "Kenya", currency: "KES", educationSystem: "Competency-based curriculum; KCSE secondary exams", languages: ["English", "Kiswahili"], phase: "Launch market", partnerModel: "Pilot with one secondary school and one nonprofit in Nairobi" },
  { country: "Ghana", currency: "GHS", educationSystem: "WASSCE senior high examinations", languages: ["English"], phase: "Phase 2", partnerModel: "Regional school networks via an education nonprofit" },
  { country: "Nigeria", currency: "NGN", educationSystem: "WAEC / JAMB examinations", languages: ["English"], phase: "Phase 2", partnerModel: "Foundation-run assistance programmes" },
  { country: "Philippines", currency: "PHP", educationSystem: "K-12 with senior high tracks", languages: ["English", "Filipino"], phase: "Phase 2", partnerModel: "Public school divisions" },
  { country: "India", currency: "INR", educationSystem: "State and national boards; vocational diplomas", languages: ["English", "Hindi", "Marathi"], phase: "Phase 3", partnerModel: "Polytechnic and diploma colleges" },
  { country: "Brazil", currency: "BRL", educationSystem: "Ensino médio; national entrance exam", languages: ["Portuguese"], phase: "Phase 3", partnerModel: "Educational trusts and municipal secretariats" },
];

export const LAUNCH_MARKET = MARKETS[0];
