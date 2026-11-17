import type { ExpenseCategory, OpportunityCategory, RequestStatus, ResourceType, VerificationMethod } from "./types";
import { daysBetween, urgencyTier } from "./allocation";

export const usd = (n: number, opts: { cents?: boolean } = {}) => {
  const cents = opts.cents ?? !Number.isInteger(Math.round(n * 100) / 100);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(n);
};

export const sum = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 100) / 100;

export const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

export const isoDaysFromNow = (days: number, base = new Date()) => {
  const d = new Date(base);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const daysUntil = (iso: string) => daysBetween(new Date(), iso);

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) =>
  new Date(iso).toLocaleDateString("en-US", opts);

export const fmtDateLong = (iso: string) => fmtDate(iso, { year: "numeric", month: "long", day: "numeric" });

export const relDays = (iso: string) => {
  const d = daysUntil(iso);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d < 0) return `${-d} days ago`;
  return `in ${d} days`;
};

export const urgencyOf = (iso: string) => urgencyTier(daysUntil(iso));

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  registration: "Registration & fees",
  travel: "Travel",
  accommodation: "Accommodation",
  equipment: "Equipment",
  materials: "Educational materials",
  food: "Food",
  documentation: "Documentation",
  other: "Other",
};

export const EXPENSE_CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABEL) as ExpenseCategory[];

export const OPP_CATEGORY_LABEL: Record<OpportunityCategory, string> = {
  certification: "Certification",
  examination: "Examination",
  "university-application": "University application",
  competition: "Competition",
  internship: "Internship",
  interview: "Interview",
  technology: "Technology access",
  course: "Course",
};

export const OPP_CATEGORIES = Object.keys(OPP_CATEGORY_LABEL) as OpportunityCategory[];

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  calculator: "Calculators",
  laptop: "Laptops",
  textbook: "Textbook exchange",
  "lab-equipment": "Lab equipment",
  "stem-kit": "STEM project kits",
  "free-resource": "Free resources",
  "school-equipment": "School-owned equipment",
  connectivity: "Internet & connectivity",
};

export const VERIFICATION_LABEL: Record<VerificationMethod, string> = {
  "school-letter": "Letter from school counselor",
  "counselor-call": "Short call with a counselor",
  "document-review": "Confidential document review",
  "institution-portal": "Institution's own records",
};

export const STATUS_FLOW: RequestStatus[] = [
  "Draft",
  "Submitted",
  "Under Review",
  "Verified",
  "Partially Funded",
  "Fully Funded",
  "Completed",
];

export const STATUS_STYLE: Record<RequestStatus, string> = {
  Draft: "bg-raised text-ink",
  Submitted: "bg-sage text-ink",
  "Under Review": "bg-gold/40 text-ink",
  Verified: "bg-forest text-onforest",
  "Partially Funded": "bg-gold text-[#232824]",
  "Fully Funded": "bg-terra text-[#232824]",
  Completed: "bg-ink text-bg",
  Declined: "bg-raised text-muted line-through",
};

export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
