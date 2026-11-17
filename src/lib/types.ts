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
  | "stem-competition"
  | "robotics"
  | "science-fair"
  | "entrepreneurship"
  | "university-application"
  | "internship"
  | "workshop"
  | "certification";

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
  /** UAE emirate of residence/schooling. */
  emirate: import("./uae").Emirate;
  residency: "Emirati" | "Expatriate";
  age: number;
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
  documents: RequestDocument[];
  status: RequestStatus;
  infoRequested?: string;
  history: StatusEvent[];
  createdAt: string;
  /** Checks completed manually by institutional staff. */
  checks?: { enrollment?: boolean; opportunity?: boolean; expenses?: boolean };
  flags?: ReviewFlag[];
  /** Staff marked this case for priority (fast-track) review. Never auto-approves. */
  priority?: boolean;
  strategy?: StrategyId;
  outcome?: "Participated" | "Completed opportunity" | "Did not participate";
  /** Required for students under 18 before verification (simulated). */
  guardianConsent?: "Not required" | "Pending" | "Given";
}

export interface Feedback {
  id: string;
  role: Role;
  rating: number; // 1–5
  comment: string;
  page: string;
  at: string;
}

export type StrategyId = "lowest-cost" | "fastest" | "independent";

export interface RequestDocument {
  name: string;
  attached: boolean;
  review?: "Pending" | "Accepted" | "Rejected";
}

export interface ReviewFlag {
  id: string;
  note: string;
  at: string;
  by: Role | "system";
  resolved?: boolean;
}

export interface Payment {
  id: string;
  requestId: string;
  provider: string;
  amount: number;
  at: string;
  reference: string;
}

export interface Pledge {
  id: string;
  sponsorId: string;
  requestId: string;
  amount: number;
  at: string;
  approach: string;
  status: "Pending review" | "Approved" | "Declined";
}

export interface Match {
  key: string;
  studentId: string;
  sourceId: string;
  status: "Suggested" | "Assigned";
  at: string;
  label: string;
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
  /** Programmes that cannot be combined with this one on the same expense. */
  conflictsWith?: string[];
  /** Only offered in these emirates (omit = nationwide). */
  emirates?: string[];
  /** Only suggested when the expense is at least this large (e.g. a card fee must be worth it). */
  minBase?: number;
  /** A real programme checked against its official source. */
  verified?: boolean;
  url?: string;
}

export interface Alternative extends ProgramMeta {
  id: string;
  name: string;
  provider: string;
  replaces: ExpenseCategory[];
  keywords: string[];
  description: string;
  emirates?: string[];
  verified?: boolean;
  url?: string;
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
  payments: Payment[];
  pledges: Pledge[];
  matches: Match[];
  /** Remaining budget of each grant programme across the network. */
  programFunds: Record<string, number>;
  display: { currency: string; locale: "en" | "ar" };
  pilot: { schools: number; students: number; requests: number; resolved: number; participated: number; avgDaysToResolve: number | null; notes: string; updatedAt: string | null };
  feedback: Feedback[];
  onboarded: boolean;
  demo: { stage: number; scanned: boolean };
}
