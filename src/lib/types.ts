export type Role = "student" | "sponsor" | "institution";

export type ExpenseCategory =
  | "registration"
  | "travel"
  | "accommodation"
  | "equipment"
  | "materials"
  | "food"
  | "documentation"
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

export interface Expense {
  id: string;
  label: string;
  category: ExpenseCategory;
  amount: number;
  /** Confirmed by an official source (true) or an estimate (false). */
  confirmed: boolean;
}

export interface Student {
  id: string;
  firstName: string;
  initials: string;
  country: string;
  city: string;
  grade: string;
  institutionId: string;
  goal: string;
  /** Simulated eligibility signals used by BridgeEngine (never shown to sponsors). */
  eligibility: EligibilityProfile;
}

export interface EligibilityProfile {
  lowIncome: boolean;
  publicSchool: boolean;
  firstGeneration: boolean;
  hasSchoolLetter: boolean;
}

export interface Institution {
  id: string;
  name: string;
  type: "School" | "University" | "Nonprofit";
  country: string;
  city: string;
}

export interface Opportunity {
  id: string;
  studentId: string;
  title: string;
  provider: string;
  category: OpportunityCategory;
  deadline: string; // ISO date
  institutionId: string;
  expenses: Expense[];
  /** Money the student can already put toward this opportunity. */
  studentFunds: number;
  /** Assistance already received from elsewhere. */
  priorAssistance: number;
  outcome: string;
  createdAt: string;
}

export type RequestStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Verified"
  | "Partially Funded"
  | "Fully Funded"
  | "Completed"
  | "Declined";

export type VerificationMethod = "school-letter" | "counselor-call" | "document-review" | "institution-portal";

export interface Reduction {
  id: string;
  kind: EngineStepKind;
  sourceId: string;
  title: string;
  amount: number;
  expenseId?: string;
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
  purpose: string;
  /** Total cost of the expenses covered by this request. */
  totalCost: number;
  /** Student funds + prior assistance applied. */
  studentFunds: number;
  /** Reductions found by BridgeEngine or assigned by an institution. */
  reductions: Reduction[];
  /** Amount requested from sponsors / institution funds after reductions. */
  amount: number;
  funded: number;
  deadline: string;
  expenses: Expense[];
  reason: string;
  documents: { name: string; attached: boolean }[];
  verification: VerificationMethod;
  status: RequestStatus;
  infoRequested?: string;
  history: StatusEvent[];
  createdAt: string;
}

export interface Waiver {
  id: string;
  name: string;
  provider: string;
  countries: string[]; // ["Global"] for any
  categories: OpportunityCategory[];
  expenseCategories: ExpenseCategory[];
  savingsType: "fixed" | "percent";
  savings: number;
  maxSavings?: number;
  eligibility: string[];
  requires: Partial<EligibilityProfile>;
  deadlineDays: number; // relative to seed date
  documents: string[];
  instructions: string[];
  kind: "waiver" | "discount" | "institutional";
}

export interface Alternative {
  id: string;
  name: string;
  replaces: ExpenseCategory[];
  keywords: string[];
  description: string;
  saving: "full" | number; // full = replaces the expense entirely
}

export interface Grant {
  id: string;
  name: string;
  provider: string;
  expenseCategories: ExpenseCategory[];
  maxAmount: number;
  requires: Partial<EligibilityProfile>;
  description: string;
}

export type ResourceType =
  | "calculator"
  | "laptop"
  | "textbook"
  | "lab-equipment"
  | "stem-kit"
  | "free-resource"
  | "school-equipment"
  | "connectivity";

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

export interface Reservation {
  id: string;
  resourceId: string;
  studentId: string;
  pickupDate: string;
  status: "Reserved" | "Collected" | "Returned";
  createdAt: string;
  by: Role;
}

export interface Contribution {
  id: string;
  sponsorName: string;
  requestId: string | null; // null = shared pool
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

export interface CalculatorScenario {
  id: string;
  name: string;
  lines: { id: string; category: ExpenseCategory; label: string; amount: number; confirmed: boolean }[];
  funds: number;
  category?: OpportunityCategory;
}

export interface DemoState {
  stage: number;
  scanned: boolean;
  engineRun: boolean;
  approved: boolean;
  contributed: boolean;
}

export interface AppState {
  version: number;
  seededAt: string;
  role: Role;
  currentStudentId: string;
  sponsor: { name: string; balance: number; startingBalance: number };
  pool: number;
  institutionFunds: number;
  students: Student[];
  institutions: Institution[];
  opportunities: Opportunity[];
  requests: FundingRequest[];
  resources: Resource[];
  reservations: Reservation[];
  contributions: Contribution[];
  distribution: DistributionEvent[];
  notifications: Notification[];
  savedWaivers: string[];
  savedOpportunities: string[];
  scenarios: CalculatorScenario[];
  milestones: { id: string; at: string; label: string }[];
  onboarded: boolean;
  sound: boolean;
  demo: DemoState;
}

export type EngineStepKind =
  | "start"
  | "student-funds"
  | "waiver"
  | "alternative"
  | "discount"
  | "borrow"
  | "grant"
  | "sponsor";
