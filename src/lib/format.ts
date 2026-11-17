import type { EducationLevel, ExpenseCategory, OpportunityCategory, RequestStatus, ResourceType } from "./types";
import { daysBetween, urgencyTier } from "./allocation";
export { daysBetween };

import { CURRENCIES } from "./regions";

/** UAE defaults: amounts are stored and calculated in AED; dates shown in Asia/Dubai. */
export const LOCALE = "en-AE";
export const TIME_ZONE = "Asia/Dubai";

/** Display currency (all calculations stay in AED; conversion is display-only). */
let display = { code: "AED", rate: 1 };
export function setDisplayCurrency(code: string) {
  const c = CURRENCIES.find((x) => x.code === code) ?? CURRENCIES[0];
  display = { code: c.code, rate: c.rate };
}
export const displayCurrency = () => display.code;

/** Formats an AED amount (in the selected display currency, AED by default), e.g. "AED 1,250". */
export const aed = (n: number, cents?: boolean) => {
  const v = n * display.rate;
  const showCents = cents ?? !Number.isInteger(Math.round(v * 100) / 100);
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency: display.code, currencyDisplay: "code", minimumFractionDigits: showCents ? 2 : 0, maximumFractionDigits: showCents ? 2 : 0 })
    .format(display.code === "AED" ? v : Math.round(v * 100) / 100)
    .replace(/\u00a0/g, " ");
};

export const sum = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 100) / 100;
export const r2 = (n: number) => Math.round(n * 100) / 100;
export const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

export const isoDaysFromNow = (days: number, base = new Date()) => {
  const d = new Date(base);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const daysUntil = (iso: string) => daysBetween(new Date(), iso);
export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) => new Date(iso).toLocaleDateString(LOCALE, { timeZone: TIME_ZONE, ...opts });
export const fmtDateLong = (iso: string) => fmtDate(iso, { day: "numeric", month: "long", year: "numeric" });
export const fmtDateNumeric = (iso: string) => fmtDate(iso, { day: "2-digit", month: "2-digit", year: "numeric" });
export const fmtDateTime = (iso: string) => new Date(iso).toLocaleString(LOCALE, { timeZone: TIME_ZONE, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export const relDays = (iso: string) => {
  const d = daysUntil(iso);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d === -1) return "yesterday";
  if (d < 0) return `${-d} days ago`;
  return `in ${d} days`;
};

export const timeAgo = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

export const urgencyOf = (iso: string) => urgencyTier(daysUntil(iso));

export const EXPENSE_LABEL: Record<ExpenseCategory, string> = {
  registration: "Registration fees",
  examination: "Examination fees",
  equipment: "Equipment",
  transportation: "Transportation",
  accommodation: "Accommodation",
  food: "Food",
  documentation: "Documentation",
  materials: "Learning materials",
  technology: "Technology access",
  other: "Additional expenses",
};
export const EXPENSE_CATEGORIES = Object.keys(EXPENSE_LABEL) as ExpenseCategory[];

export const OPP_LABEL: Record<OpportunityCategory, string> = {
  "stem-competition": "STEM competition",
  robotics: "Robotics competition",
  "science-fair": "Science fair",
  entrepreneurship: "Entrepreneurship",
  "university-application": "University application",
  internship: "Internship",
  workshop: "Workshop",
  certification: "Certification",
};
export const OPP_CATEGORIES = Object.keys(OPP_LABEL) as OpportunityCategory[];

export const LEVEL_LABEL: Record<EducationLevel, string> = {
  secondary: "Secondary school",
  "pre-university": "Pre-university",
  undergraduate: "Undergraduate",
  vocational: "Vocational",
};

export const RESOURCE_LABEL: Record<ResourceType, string> = {
  calculator: "Calculators",
  laptop: "Laptops",
  textbook: "Textbooks",
  "lab-equipment": "Laboratory equipment",
  engineering: "Engineering materials",
  "exam-prep": "Exam preparation",
  "school-equipment": "School-owned equipment",
};

export const STATUS_FLOW: RequestStatus[] = ["Draft", "Submitted", "Under Review", "Verified", "Partially Funded", "Fully Funded", "Completed"];

export const STATUS_TONE: Record<RequestStatus, "neutral" | "info" | "warning" | "success" | "danger" | "accent"> = {
  Draft: "neutral",
  Submitted: "info",
  "Under Review": "info",
  "Additional Information Required": "warning",
  Verified: "accent",
  "Partially Funded": "accent",
  "Fully Funded": "success",
  Completed: "success",
  Rejected: "danger",
};

export const PENDING_STATUSES: RequestStatus[] = ["Submitted", "Under Review", "Additional Information Required"];
export const FUNDABLE_STATUSES: RequestStatus[] = ["Verified", "Partially Funded"];
