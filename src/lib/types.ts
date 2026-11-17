export type Role = "student" | "sponsor" | "institution";

export type ExpenseCategory =
  | "registration"
  | "examination"
  | "equipment"
  | "transportation"
  | "accommodation"
  | "food"
  | "documentation"
  | "materials"
  | "technology"
  | "other";

export type OpportunityCategory =
  | "certification"
  | "examination"
  | "university-application"
  | "competition"
  | "internship"
  | "interview"
  | "technology"
  | "course";

export type EducationLevel = "secondary" | "pre-university" | "undergraduate" | "vocational";

export interface Expense {
  id: string;
  label: string;
  category: ExpenseCategory;
  amount: number;
  /** Confirmed by an official source (true) or an estimate (false). */
  confirmed: boolean;
}

export interface EligibilityProfile {
  lowIncome: boolean;
  publicSchool: boolean;
  firstGeneration: boolean;
  hasSchoolLetter: boolean;
}

export interface Student {
  id: string;
  firstName: string;
  initials: string;
  country: string;
  city: string;
  grade: string;
  level: EducationLevel;
  institutionId: string;
  goal: string;
  /** Simulated eligibility signals used by BridgeEngine — never shown to sponsors. */
  eligibility: EligibilityProfile;
}

export interface Institution {
  id: string;
  name: string;
  type: "School" | "University" | "Nonprofit";
  country: string;
  city: string;
  /** Simulated assistance fund held by the institution. */
  fund: number;
}

export interface Opportunity {
  id: string;
  studentId: string;
  title: string;
  provider: string;
  category: OpportunityCategory;
  deadline: string; // ISO
  institutionId: string;
  expenses: Expense[];
  studentFunds: number;
  priorAssistance: number;
  outcome: string;
  createdAt: string;
}

export type RequestStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Additional Information Required"
  | "Verified"
  | "Partially Funded"
  | "Fully Funded"
  | "Completed"
  | "Rejected";

export type ReductionKind = "waiver" | "alternative" | "discount" | "borrow" | "institutional" | "grant";

export interface Reduction {
  id: string;
  kind: ReductionKind;
  sourceId: string;
  title: string;
  amount: number;
  expenseId?: string;
  /** Estimated until the verifying institution confirms it. */
  confirmed: boolean;
}

export interface StatusEvent {
  at: string;
  status: RequestStatus;
  note: string;
  actor: Role | "system";
}

export interface FundingRequest {
  id: string;
  ref: string;
  studentId: string;
  opportunityId: string;
  institutionId: string;
  purpose: string;
  totalCost: number;
  studentFunds: number;
  reductions: Reduction[];
  /** Amount requested from sponsors / institution funds after reductions. */
  amount: number;
  funded: number;
  deadline: string;
  expenses: Expense[];
  explanation: string;
  documents: { name: string; attached: boolean }[];
  status: RequestStatus;
  infoRequested?: string;
  history: StatusEvent[];
  createdAt: string;
}

/** Shared metadata every recommendation source carries, so each one can explain itself. */
export interface ProgramMeta {
  eligibility: string[];
  documents: string[];
  instructions: string[];
  processingDays: number;
  deadlineDays: number;
}

export interface Waiver extends ProgramMeta {
  id: string;
  name: string;
  provider: string;
  countries: string[]; // ["Global"] = any
  levels: EducationLevel[];
  categories: OpportunityCategory[];
  expenseCategories: ExpenseCategory[];
  savingsType: "fixed" | "percent";
  savings: number;
  maxSavings?: number;
  requires: Partial<EligibilityProfile>;
  kind: "waiver" | "discount" | "institutional";
}

export interface Alternative extends ProgramMeta {
  id: string;
  name: string;
  provider: string;
  replaces: ExpenseCategory[];
  keywords: string[];
  description: string;
}

export interface Grant extends ProgramMeta {
  id: string;
  name: string;
  provider: string;
  expenseCategories: ExpenseCategory[];
  maxAmount: number;
  requires: Partial<EligibilityProfile>;
  description: string;
}

export type ResourceType = "calculator" | "laptop" | "textbook" | "lab-equipment" | "engineering" | "exam-prep" | "school-equipment";

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  institutionId: string;
  total: number;
  available: number;
  retailValue: number;
  loanTerm: string;
  description: string;
  keywords: string[];
}

export type ReservationStatus = "Reserved" | "Collected" | "Returned" | "Cancelled";

export interface Reservation {
  id: string;
  resourceId: string;
  studentId: string;
  pickupDate: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  type: "Individual" | "Foundation" | "Company";
  balance: number;
  startingBalance: number;
}

export interface Contribution {
  id: string;
  sponsorId: string | null;
  sourceLabel: string;
  requestId: string | null; // null = to the shared pool
  amount: number;
  at: string;
  source: "sponsor" | "pool" | "institution";
}

export interface DistributionEvent {
  id: string;
  at: string;
  label: string;
  amount: number;
  requestRef?: string;
  institutionId?: string;
  kind: "funds" | "waiver" | "resource" | "completion" | "pool";
}

export interface Notification {
  id: string;
  role: Role;
  title: string;
  body: string;
  href?: string;
  at: string;
  read: boolean;
}

export interface Activity {
  id: string;
  role: Role | "system";
  text: string;
  at: string;
}

export interface CalculatorScenario {
  id: string;
  name: string;
  category: OpportunityCategory;
  lines: Partial<Record<ExpenseCategory, number>>;
  funds: number;
}

export interface AppState {
  version: number;
  seededAt: string;
  role: Role;
  currentStudentId: string;
  currentSponsorId: string;
  currentInstitutionId: string;
  sponsors: Sponsor[];
  pool: number;
  students: Student[];
  institutions: Institution[];
  opportunities: Opportunity[];
  requests: FundingRequest[];
  resources: Resource[];
  reservations: Reservation[];
  contributions: Contribution[];
  distribution: DistributionEvent[];
  notifications: Notification[];
  activity: Activity[];
  savedWaivers: string[];
  savedNeeds: string[];
  reminders: string[];
  scenarios: CalculatorScenario[];
  milestones: { id: string; at: string; label: string }[];
  profile: { displayName: string; email: string; emailUpdates: boolean; deadlineReminders: boolean };
  onboarded: boolean;
  demo: { stage: number; scanned: boolean };
}
