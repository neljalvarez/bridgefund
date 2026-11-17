/**
 * BridgeEngine knowledge base — UAE launch market.
 *
 * Entries marked `verified` describe REAL programmes (see src/lib/uae.ts for
 * sources). BridgeFund is not affiliated with their providers, and final
 * eligibility is always decided by the provider. Entries marked "(example)" are
 * FICTIONAL school or community programmes used to demonstrate the logic.
 * Processing times are estimates.
 */
import type { Alternative, Grant, Waiver } from "./types";

const ALL_LEVELS = ["secondary", "pre-university", "undergraduate", "vocational"] as Waiver["levels"];
const ALL_OPPS: Waiver["categories"] = ["stem-competition", "robotics", "science-fair", "entrepreneurship", "university-application", "internship", "workshop", "certification"];

export const WAIVERS: Waiver[] = [
  {
    id: "d-nol-student",
    name: "Student nol card — 50% off RTA fares",
    provider: "Roads and Transport Authority, Dubai",
    countries: ["United Arab Emirates"],
    emirates: ["Dubai"],
    levels: ALL_LEVELS,
    categories: ALL_OPPS,
    expenseCategories: ["transportation"],
    savingsType: "percent",
    savings: 50,
    minBase: 140,
    eligibility: ["Students aged 5–23 at UAE schools or universities", "Card costs AED 70 (AED 50 fee + AED 20 credit) — only suggested when savings exceed it"],
    requires: {},
    documents: ["School letter", "Emirates ID or passport", "Photo"],
    instructions: ["Apply for a student nol card on the RTA website or app.", "Load it before your first trip; the 50% discount applies to metro, tram and bus fares."],
    processingDays: 7,
    deadlineDays: 365,
    kind: "discount",
    verified: true,
    url: "https://www.rta.ae/wps/portal/rta/ae/home/rta-services/service-details?serviceId=634",
  },
  {
    id: "i-school-stem-travel",
    name: "School STEM travel support (example)",
    provider: "Your verifying school",
    countries: ["United Arab Emirates"],
    levels: ALL_LEVELS,
    categories: ["stem-competition", "robotics", "science-fair"],
    expenseCategories: ["transportation"],
    savingsType: "fixed",
    savings: 100,
    eligibility: ["Representing the school at a STEM event", "School letter on file"],
    requires: { hasSchoolLetter: true },
    documents: ["Event confirmation"],
    instructions: ["Ask the school office to log the trip.", "The school pays the transport provider directly."],
    processingDays: 3,
    deadlineDays: 30,
    kind: "institutional",
  },
];

export const ALTERNATIVES: Alternative[] = [
  {
    id: "alt-maktaba",
    name: "Borrow from MAKTABA public libraries",
    provider: "Department of Culture and Tourism – Abu Dhabi",
    emirates: ["Abu Dhabi"],
    replaces: ["materials"],
    keywords: ["book", "textbook", "reading", "study guide"],
    description: "Free MAKTABA borrowing membership: books, eBooks and audiobooks instead of buying.",
    eligibility: ["Register online with an Emirates ID", "Upgrade to the free borrowing membership"],
    documents: ["Emirates ID"],
    instructions: ["Create an account on library.dctabudhabi.ae.", "Upgrade to borrowing membership, then reserve the titles."],
    processingDays: 1,
    deadlineDays: 365,
    verified: true,
    url: "https://library.dctabudhabi.ae/",
  },
];

/** Starting budgets for grant programmes (fictional, AED). */
export const GRANT_BUDGETS: Record<string, number> = { "g-ptsa": 1500, "g-stem": 3000 };

export const GRANTS: Grant[] = [
  {
    id: "g-ptsa",
    name: "Parent association microgrant (example)",
    provider: "School parent association",
    expenseCategories: ["transportation", "food", "accommodation"],
    maxAmount: 150,
    requires: { lowIncome: true },
    description: "Small, fast grants for getting to and staying at educational events.",
    eligibility: ["Household need confirmed by the school", "Event linked to schoolwork"],
    documents: ["Event confirmation"],
    instructions: ["Complete the one-page form at the school office.", "Paid directly to the provider."],
    processingDays: 7,
    deadlineDays: 28,
  },
  {
    id: "g-stem",
    name: "STEM project grant (example)",
    provider: "Community STEM fund",
    expenseCategories: ["equipment", "materials"],
    maxAmount: 250,
    requires: { publicSchool: true },
    description: "Covers equipment and materials for STEM projects at public schools.",
    eligibility: ["Public school student", "STEM competition or project"],
    documents: ["Teacher endorsement"],
    instructions: ["Ask your STEM teacher to submit the endorsement form."],
    processingDays: 10,
    deadlineDays: 35,
  },
];
