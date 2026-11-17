/**
 * Demonstration seed data for the UAE launch market. Every student, school,
 * sponsor, request and amount here is FICTIONAL (amounts in AED). Real UAE
 * opportunities and assistance programmes live in src/lib/uae.ts. Deadlines are
 * generated relative to the day the demo is seeded.
 */
import type { AppState, Contribution, DistributionEvent, Expense, FundingRequest, Institution, Opportunity, Reduction, RequestStatus, Resource, Sponsor, Student } from "./types";
import { isoDaysFromNow } from "./format";
import { GRANT_BUDGETS } from "./knowledge";

export const STATE_VERSION = 6;
export const DEMO_STUDENT_ID = "s-mariam";
export const DEMO_OPPORTUNITY_ID = "o-mariam-stem";
export const DEMO_SPONSOR_ID = "sp-ghaf";

const UAE = "United Arab Emirates";
export const INSTITUTIONS: Institution[] = [
  { id: "i-ghaf", name: "Ghaf Grove School", type: "School", country: UAE, city: "Abu Dhabi", fund: 2400 },
  { id: "i-oasis", name: "Oasis Ridge Secondary", type: "School", country: UAE, city: "Al Ain", fund: 1800 },
  { id: "i-falcon", name: "Falcon Heights Academy", type: "School", country: UAE, city: "Dubai", fund: 2000 },
  { id: "i-creekside", name: "Creekside College", type: "University", country: UAE, city: "Dubai", fund: 3000 },
  { id: "i-corniche", name: "Corniche Learning Centre", type: "School", country: UAE, city: "Sharjah", fund: 1400 },
  { id: "i-pearl", name: "Pearl Coast School", type: "School", country: UAE, city: "Ajman", fund: 900 },
  { id: "i-mangrove", name: "Mangrove Bay School", type: "School", country: UAE, city: "Umm Al Quwain", fund: 700 },
  { id: "i-jebel", name: "Jebel View Academy", type: "School", country: UAE, city: "Ras Al Khaimah", fund: 1100 },
  { id: "i-wadi", name: "Wadi Hills School", type: "School", country: UAE, city: "Fujairah", fund: 800 },
  { id: "i-desertrose", name: "Desert Rose Youth Foundation", type: "Nonprofit", country: UAE, city: "Sharjah", fund: 2500 },
];

const elig = (lowIncome: boolean, publicSchool: boolean, firstGeneration: boolean, hasSchoolLetter: boolean) => ({ lowIncome, publicSchool, firstGeneration, hasSchoolLetter });
const stu = (id: string, firstName: string, initials: string, emirate: Student["emirate"], city: string, residency: Student["residency"], age: number, grade: string, level: Student["level"], institutionId: string, goal: string, eligibility: Student["eligibility"]): Student => ({ id, firstName, initials, country: UAE, city, emirate, residency, age, grade, level, institutionId, goal, eligibility });

export const STUDENTS: Student[] = [
  stu("s-mariam", "Mariam", "MA", "Abu Dhabi", "Abu Dhabi", "Emirati", 16, "Grade 11", "secondary", "i-ghaf", "Compete in a national STEM competition", elig(true, false, false, true)),
  stu("s-omar", "Omar", "OK", "Abu Dhabi", "Al Ain", "Emirati", 17, "Grade 12", "secondary", "i-oasis", "Present a science fair project", elig(true, true, true, true)),
  stu("s-priya", "Priya", "PN", "Dubai", "Dubai", "Expatriate", 16, "Grade 11", "secondary", "i-falcon", "Build the school robotics team's robot", elig(true, false, false, true)),
  stu("s-yusuf", "Yusuf", "YH", "Dubai", "Dubai", "Expatriate", 19, "University, year 1", "undergraduate", "i-creekside", "Complete a first engineering internship", elig(true, false, true, true)),
  stu("s-hessa", "Hessa", "HS", "Sharjah", "Sharjah", "Emirati", 15, "Grade 10", "secondary", "i-corniche", "Enter a science fair", elig(true, true, false, true)),
  stu("s-aisha", "Aisha", "AR", "Sharjah", "Sharjah", "Expatriate", 17, "Grade 12", "secondary", "i-corniche", "Apply to university", elig(true, false, true, true)),
  stu("s-rohan", "Rohan", "RM", "Ajman", "Ajman", "Expatriate", 16, "Grade 11", "secondary", "i-pearl", "Compete with the robotics club", elig(true, false, false, true)),
  stu("s-khalid", "Khalid", "KA", "Umm Al Quwain", "Umm Al Quwain", "Emirati", 17, "Grade 12", "secondary", "i-mangrove", "Exhibit a student business", elig(true, true, false, true)),
  stu("s-noura", "Noura", "NS", "Ras Al Khaimah", "Ras Al Khaimah", "Emirati", 18, "Grade 12", "secondary", "i-jebel", "Attend an AI workshop in Abu Dhabi", elig(false, true, false, true)),
  stu("s-joseph", "Joseph", "JD", "Fujairah", "Fujairah", "Expatriate", 15, "Grade 10", "secondary", "i-wadi", "Join a coding workshop", elig(true, false, true, true)),
  stu("s-fatima", "Fatima", "FM", "Abu Dhabi", "Abu Dhabi", "Emirati", 20, "University, year 2", "undergraduate", "i-ghaf", "Present research at a student conference", elig(true, true, false, true)),
  stu("s-ahmed", "Ahmed", "AT", "Dubai", "Dubai", "Expatriate", 17, "Grade 12", "secondary", "i-falcon", "Prepare for university entrance", elig(true, false, false, true)),
  stu("s-layla", "Layla", "LB", "Abu Dhabi", "Abu Dhabi", "Expatriate", 16, "Grade 11", "secondary", "i-oasis", "Join the school robotics team", elig(true, true, false, true)),
  stu("s-saeed", "Saeed", "SH", "Ras Al Khaimah", "Ras Al Khaimah", "Emirati", 14, "Grade 9", "secondary", "i-jebel", "Compete at a regional robotics event", elig(true, true, false, true)),
  stu("s-maria", "Maria", "MC", "Fujairah", "Fujairah", "Expatriate", 18, "Grade 12", "secondary", "i-wadi", "Complete hospitality training", elig(true, false, true, true)),
];

export const SPONSORS: Sponsor[] = [
  { id: DEMO_SPONSOR_ID, name: "Ghaf Community Fund", type: "Foundation", balance: 1000, startingBalance: 1000 },
  { id: "sp-horizon", name: "Gulf Horizon CSR Programme", type: "Company", balance: 4200, startingBalance: 5000 },
  { id: "sp-parents", name: "Parents' Giving Circle", type: "Individual", balance: 900, startingBalance: 1500 },
];

const res = (id: string, name: string, type: Resource["type"], institutionId: string, total: number, available: number, retailValue: number, loanTerm: string, description: string, keywords: string[]): Resource => ({ id, name, type, institutionId, total, available, retailValue, loanTerm, description, keywords });

export const RESOURCES: Resource[] = [
  res("r-stem-kit", "Arduino-compatible STEM kit", "engineering", "i-ghaf", 6, 3, 200, "Until the competition ends", "Microcontroller, sensors and wiring for STEM projects.", ["project materials", "stem kit", "microcontroller", "arduino"]),
  res("r-robot-kit", "Robotics starter kit", "engineering", "i-falcon", 4, 2, 180, "Until the competition ends", "Motors, chassis and controller for school robotics teams.", ["robot parts", "robotics kit"]),
  res("r-sensor-kit", "Sensor and controller kit", "engineering", "i-oasis", 3, 1, 300, "Until the competition ends", "Advanced sensors and a programmable controller.", ["sensor kit", "sensor"]),
  res("r-laptop", "Refurbished laptop", "laptop", "i-falcon", 8, 2, 1200, "One term", "Laptops with office and coding software installed.", ["laptop"]),
  res("r-graphing", "Graphing calculator", "calculator", "i-corniche", 15, 6, 350, "Full school term", "Exam-approved graphing calculators.", ["graphing calculator"]),
  res("r-sci-calc", "Scientific calculator", "calculator", "i-pearl", 25, 18, 60, "Full school term", "Scientific calculators for coursework and exams.", ["scientific calculator"]),
  res("r-microscope", "Student microscope kit", "lab-equipment", "i-oasis", 5, 1, 450, "Two weeks", "Portable microscope with prepared slides.", ["microscope"]),
  res("r-lab-set", "Lab goggles and coat set", "lab-equipment", "i-corniche", 20, 14, 90, "Practical exam period", "Safety equipment for practicals.", ["goggles", "lab coat"]),
  res("r-printer", "3D printer time slot", "school-equipment", "i-jebel", 4, 4, 80, "Two-hour slot", "Supervised 3D printer access for prototypes.", ["3d print"]),
  res("r-uniform", "Professional dress closet", "school-equipment", "i-wadi", 12, 7, 200, "One month", "Clean, professional outfits for placements and interviews.", ["uniform", "formal"]),
];

const exp = (id: string, label: string, category: Expense["category"], amount: number, confirmed = true): Expense => ({ id, label, category, amount, confirmed });
const red = (kind: Reduction["kind"], sourceId: string, title: string, amount: number, expenseId: string): Reduction => ({ id: `rd-${sourceId}-${expenseId}`, kind, sourceId, title, amount, expenseId, confirmed: true });

interface ReqSeed {
  id: string;
  ref: string;
  studentId: string;
  days: number;
  funded: number;
  status: RequestStatus;
  explanation: string;
  title: string;
  provider: string;
  category: Opportunity["category"];
  outcome: string;
  studentFunds: number;
  expenses: Expense[];
  reductions: Reduction[];
  infoRequested?: string;
  institutionId?: string;
  flag?: string;
  docsAttached?: boolean;
  result?: FundingRequest["outcome"];
}

const REQUESTS: ReqSeed[] = [
  { id: "r-omar", ref: "BF-2041", studentId: "s-omar", days: 6, funded: 0, status: "Verified", explanation: "Materials and transport for the science fair weren't in the family budget this term.", title: "Science fair project — materials and transport", provider: "School science fair (example)", category: "science-fair", outcome: "Present a water-quality project to judges.", studentFunds: 60, expenses: [exp("e1", "Project materials", "materials", 220), exp("e2", "Reference books", "materials", 40), exp("e3", "Transport to Abu Dhabi city", "transportation", 90, false)], reductions: [red("alternative", "alt-maktaba", "Borrow from MAKTABA public libraries", 40, "e2")] },
  { id: "r-priya", ref: "BF-2043", studentId: "s-priya", days: 16, funded: 100, status: "Partially Funded", explanation: "Team members each cover their own robot parts.", title: "Robotics team — robot parts", provider: "School robotics club (example)", category: "robotics", outcome: "A competition-ready robot for the school team.", studentFunds: 150, expenses: [exp("e1", "Robot parts", "equipment", 450), exp("e2", "Event transport", "transportation", 120, false)], reductions: [red("borrow", "r-robot-kit", "Borrow: Robotics starter kit", 180, "e1")] },
  { id: "r-yusuf", ref: "BF-2044", studentId: "s-yusuf", days: 12, funded: 0, status: "Verified", explanation: "The internship allowance only starts after the first month.", title: "Engineering internship — first month", provider: "Dubai engineering firm (example)", category: "internship", outcome: "A first professional engineering placement.", studentFunds: 50, expenses: [exp("e1", "Monthly metro and bus fares", "transportation", 320), exp("e2", "Document attestation", "documentation", 150, false)], reductions: [red("discount", "d-nol-student", "Student nol card — 50% off RTA fares", 160, "e1")] },
  { id: "r-hessa", ref: "BF-2046", studentId: "s-hessa", days: 9, funded: 0, status: "Submitted", explanation: "Display materials are needed before the school can register the project.", title: "Science fair display and materials", provider: "School science fair (example)", category: "science-fair", outcome: "A completed project display for the science fair.", studentFunds: 40, expenses: [exp("e1", "Display board and printing", "materials", 180), exp("e2", "Transport", "transportation", 60, false)], reductions: [] },
  { id: "r-aisha", ref: "BF-2047", studentId: "s-aisha", days: 19, funded: 0, status: "Under Review", explanation: "University applications are due before the family's next payment.", title: "University application — documents and prep", provider: "UAE university applications", category: "university-application", outcome: "Complete university applications.", studentFunds: 100, expenses: [exp("e1", "Document attestation", "documentation", 300, false), exp("e2", "Practice test books", "materials", 120)], reductions: [] },
  { id: "r-rohan", ref: "BF-2048", studentId: "s-rohan", days: 4, funded: 0, status: "Verified", explanation: "The event is in another emirate and transport wasn't budgeted.", title: "Robotics competition — transport", provider: "Robotics club (example)", category: "robotics", outcome: "Compete with the school robotics club.", studentFunds: 0, expenses: [exp("e1", "Return bus to the venue", "transportation", 140)], reductions: [] },
  { id: "r-khalid", ref: "BF-2049", studentId: "s-khalid", days: 22, funded: 150, status: "Partially Funded", explanation: "The exhibition requires a printed stand and product samples.", title: "Student business exhibition stand", provider: "School entrepreneurship programme", category: "entrepreneurship", outcome: "Exhibit a student-run business.", studentFunds: 100, expenses: [exp("e1", "Product materials", "materials", 400), exp("e2", "Stand printing", "other", 150)], reductions: [] },
  { id: "r-noura", ref: "BF-2050", studentId: "s-noura", days: 27, funded: 380, status: "Fully Funded", explanation: "The workshop is in Abu Dhabi, two hours away.", title: "AI workshop in Abu Dhabi — travel and stay", provider: "University summer workshop (example)", category: "workshop", outcome: "Complete a week-long AI workshop.", studentFunds: 100, expenses: [exp("e1", "Intercity transport", "transportation", 180), exp("e2", "Two nights' accommodation", "accommodation", 300)], reductions: [] },
  { id: "r-joseph", ref: "BF-2051", studentId: "s-joseph", days: 31, funded: 0, status: "Additional Information Required", explanation: "The workshop needs a laptop the family doesn't have.", title: "Coding workshop — laptop access", provider: "Coding workshop (example)", category: "workshop", outcome: "Finish a beginner coding workshop.", studentFunds: 0, expenses: [exp("e1", "Laptop rental", "technology", 250)], reductions: [], infoRequested: "Please attach the workshop's acceptance email." },
  { id: "r-ahmed", ref: "BF-2052", studentId: "s-ahmed", days: 8, funded: 0, status: "Verified", explanation: "Preparation classes start before the family's next payment.", title: "University entrance preparation", provider: "Test preparation centre (example)", category: "university-application", outcome: "Prepared for university entrance requirements.", studentFunds: 150, expenses: [exp("e1", "Preparation course", "materials", 450), exp("e2", "Transport", "transportation", 60)], reductions: [] },
  { id: "r-layla", ref: "BF-2053", studentId: "s-layla", days: 14, funded: 0, status: "Verified", explanation: "The team asks each member to bring a sensor kit.", title: "Robotics team — sensor kit", provider: "School robotics team (example)", category: "robotics", outcome: "A place on the school robotics team.", studentFunds: 50, expenses: [exp("e1", "Sensor kit", "equipment", 300)], reductions: [] },
  { id: "r-maria", ref: "BF-2054", studentId: "s-maria", days: 26, funded: 0, status: "Verified", explanation: "The training requires a uniform and daily transport.", title: "Hospitality training — uniform and transport", provider: "Hospitality training (example)", category: "certification", outcome: "A hospitality training certificate.", studentFunds: 80, expenses: [exp("e1", "Uniform", "other", 200), exp("e2", "Daily transport", "transportation", 150)], reductions: [] },
  { id: "r-rohan-2", ref: "BF-2056", studentId: "s-rohan", days: 4, funded: 0, status: "Submitted", explanation: "Bus to the robotics competition.", title: "Robotics competition — bus fare", provider: "Robotics club (example)", category: "robotics", outcome: "Compete with the school robotics club.", studentFunds: 0, expenses: [exp("e1", "Return bus to the venue", "transportation", 140)], reductions: [] },
  { id: "r-hessa-2", ref: "BF-2057", studentId: "s-hessa", days: 5, funded: 0, status: "Submitted", explanation: "Need a laptop for the science project.", title: "Laptop for science project", provider: "Electronics retailer", category: "science-fair", outcome: "A finished science project.", studentFunds: 0, expenses: [exp("e1", "New laptop", "equipment", 2800, false)], reductions: [], docsAttached: false, institutionId: "i-pearl", flag: "Requested amount is unusually high for a science-fair need and no quote was attached." },
  { id: "r-fatima", ref: "BF-2031", studentId: "s-fatima", days: -10, funded: 220, status: "Completed", explanation: "Poster printing and travel were due before the scholarship payment.", title: "Student research conference — poster and travel", provider: "Student research conference (example)", category: "workshop", outcome: "Presented research at a student conference.", result: "Completed opportunity", studentFunds: 0, expenses: [exp("e1", "Poster printing and transport", "other", 220)], reductions: [] },
  { id: "r-saeed", ref: "BF-2028", studentId: "s-saeed", days: -20, funded: 160, status: "Completed", explanation: "Travel to the regional robotics event.", title: "Regional robotics event travel", provider: "Robotics event (example)", category: "robotics", outcome: "Competed at a regional robotics event.", result: "Participated", studentFunds: 0, expenses: [exp("e1", "Return transport", "transportation", 160)], reductions: [] },
];

const FLOW: RequestStatus[] = ["Submitted", "Under Review", "Verified", "Partially Funded", "Fully Funded", "Completed"];
const NOTES: Partial<Record<RequestStatus, string>> = {
  Submitted: "Request submitted by student",
  "Under Review": "Institution started verification",
  Verified: "Need verified by institution — visible to sponsors",
  "Partially Funded": "Sponsor contribution received",
  "Fully Funded": "Request fully funded",
  Completed: "Assistance paid directly to the provider",
  "Additional Information Required": "Institution requested additional documentation",
};

function build(s: ReqSeed, now: Date) {
  const st = STUDENTS.find((x) => x.id === s.studentId)!;
  const start = Math.min(s.days - 12, -3);
  const created = isoDaysFromNow(start, now);
  const opp: Opportunity = { id: `o-${s.id}`, studentId: s.studentId, title: s.title, provider: s.provider, category: s.category, deadline: isoDaysFromNow(s.days, now), institutionId: s.institutionId ?? st.institutionId, expenses: s.expenses, studentFunds: s.studentFunds, priorAssistance: 0, outcome: s.outcome, createdAt: created };
  const verified = ["Verified", "Partially Funded", "Fully Funded", "Completed"].includes(s.status);
  const total = s.expenses.reduce((a, e) => a + e.amount, 0);
  const amount = Math.round((total - s.studentFunds - s.reductions.reduce((a, r) => a + r.amount, 0)) * 100) / 100;
  const path: RequestStatus[] = s.status === "Additional Information Required" ? ["Submitted", "Under Review", "Additional Information Required"] : FLOW.slice(0, FLOW.indexOf(s.status) + 1);
  const req: FundingRequest = {
    id: s.id,
    ref: s.ref,
    studentId: s.studentId,
    opportunityId: opp.id,
    institutionId: s.institutionId ?? st.institutionId,
    purpose: s.title,
    totalCost: total,
    studentFunds: s.studentFunds,
    reductions: s.reductions,
    amount,
    funded: s.funded,
    deadline: opp.deadline,
    expenses: s.expenses,
    explanation: s.explanation,
    documents: [
      { name: "Proof of enrollment", attached: s.docsAttached ?? true, review: verified ? "Accepted" : "Pending" },
      { name: "Official cost confirmation", attached: s.docsAttached ?? !["Submitted", "Additional Information Required"].includes(s.status), review: verified ? "Accepted" : "Pending" },
    ],
    checks: verified ? { enrollment: true, opportunity: true, expenses: true } : {},
    flags: s.flag ? [{ id: `fl-${s.id}`, note: s.flag, at: created, by: "system" }] : [],
    outcome: s.result,
    guardianConsent: st.age >= 18 ? "Not required" : s.status === "Submitted" ? "Pending" : "Given",
    status: s.status,
    infoRequested: s.infoRequested,
    history: path.map((st2, i) => ({ at: isoDaysFromNow(start + i, now), status: st2, note: NOTES[st2] ?? st2, actor: st2 === "Submitted" ? "student" : st2.includes("Funded") ? "sponsor" : "institution" })),
    createdAt: created,
  };
  return { opp, req };
}

export function demoOpportunities(now: Date): Opportunity[] {
  return [
    {
      id: DEMO_OPPORTUNITY_ID,
      studentId: DEMO_STUDENT_ID,
      title: "STEM competition project",
      provider: "National STEM competition (example)",
      category: "stem-competition",
      deadline: isoDaysFromNow(21, now),
      institutionId: "i-ghaf",
      expenses: [exp("e1", "Project materials", "materials", 350), exp("e2", "Transportation", "transportation", 100), exp("e3", "Competition-related expenses", "other", 150)],
      studentFunds: 150,
      priorAssistance: 0,
      outcome: "Build and present a working STEM project with her school team.",
      createdAt: isoDaysFromNow(-6, now),
    },
    { id: "o-mariam-reading", studentId: DEMO_STUDENT_ID, title: "Science reading list", provider: "School science club", category: "workshop", deadline: isoDaysFromNow(30, now), institutionId: "i-ghaf", expenses: [exp("e1", "Reference books", "materials", 120, false)], studentFunds: 0, priorAssistance: 0, outcome: "Background reading for the competition project.", createdAt: isoDaysFromNow(-4, now) },
    { id: "o-mariam-uni", studentId: DEMO_STUDENT_ID, title: "University application — NYU Abu Dhabi", provider: "NYU Abu Dhabi", category: "university-application", deadline: isoDaysFromNow(45, now), institutionId: "i-ghaf", expenses: [exp("e1", "Document attestation", "documentation", 150, false), exp("e2", "Transport to campus visit", "transportation", 40, false)], studentFunds: 0, priorAssistance: 0, outcome: "A complete undergraduate application, with a need-based aid request.", createdAt: isoDaysFromNow(-2, now) },
  ];
}

export function createSeedState(now = new Date()): AppState {
  const built = REQUESTS.map((s) => build(s, now));
  const requests = built.map((b) => b.req);
  const sponsorFor = (i: number) => (i % 2 ? "sp-horizon" : "sp-parents");
  const contributions: Contribution[] = requests
    .filter((r) => r.funded > 0)
    .map((r, i) => ({ id: `c-seed-${i}`, sponsorId: sponsorFor(i), sourceLabel: SPONSORS.find((s) => s.id === sponsorFor(i))!.name, requestId: r.id, amount: r.funded, at: r.history[r.history.length - 1].at, source: "sponsor" as const }));
  const distribution: DistributionEvent[] = [
    ...requests.filter((r) => r.status === "Completed").map((r) => ({ id: `d-c-${r.id}`, at: r.history[r.history.length - 1].at, label: `Paid ${r.purpose.toLowerCase()} to provider`, amount: r.funded, requestRef: r.ref, institutionId: r.institutionId, kind: "completion" as const })),
    ...requests.flatMap((r) => r.reductions.filter((x) => x.confirmed).map((x) => ({ id: `d-${x.id}-${r.id}`, at: r.createdAt, label: x.title, amount: x.amount, requestRef: r.ref, institutionId: r.institutionId, kind: "waiver" as const }))),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return {
    version: STATE_VERSION,
    seededAt: now.toISOString(),
    role: "student",
    currentStudentId: DEMO_STUDENT_ID,
    currentSponsorId: DEMO_SPONSOR_ID,
    currentInstitutionId: "all",
    sponsors: SPONSORS.map((s) => ({ ...s })),
    pool: 600,
    students: STUDENTS,
    institutions: INSTITUTIONS.map((i) => ({ ...i })),
    opportunities: [...demoOpportunities(now), ...built.map((b) => b.opp)],
    requests,
    resources: RESOURCES.map((r) => ({ ...r })),
    reservations: [],
    contributions,
    distribution,
    notifications: [
      { id: "n1", role: "student", title: "New UAE opportunities", body: "Browse STEM competitions, internships and university aid in Opportunities.", href: "/student/waivers", at: isoDaysFromNow(-1, now), read: false },
      { id: "n2", role: "student", title: "Welcome to BridgeFund", body: "Run BridgeEngine on an opportunity to build your action plan.", href: "/student/engine", at: isoDaysFromNow(-2, now), read: true },
      { id: "n3", role: "sponsor", title: "2 verified needs close within 7 days", body: "The budget planner can suggest how to cover them.", href: "/sponsor/allocate", at: isoDaysFromNow(-1, now), read: false },
      { id: "n4", role: "institution", title: "2 requests awaiting verification", body: "New submissions from Sharjah and Ajman.", href: "/institution/requests", at: isoDaysFromNow(-1, now), read: false },
    ],
    activity: [
      { id: "a1", role: "system", text: "Demo environment seeded with fictional data", at: now.toISOString() },
      { id: "a2", role: "student", text: "Mariam added STEM competition project", at: isoDaysFromNow(-6, now) },
    ],
    savedWaivers: [],
    savedNeeds: [],
    reminders: [],
    scenarios: [],
    milestones: [
      { id: "m1", at: isoDaysFromNow(-60, now), label: "Joined the Ghaf Grove science club" },
      { id: "m2", at: isoDaysFromNow(-21, now), label: "Team project idea approved by her teacher" },
      { id: "m3", at: isoDaysFromNow(-6, now), label: "Team registered for the STEM competition" },
    ],
    profile: { displayName: "Mariam A.", email: "mariam.demo@bridgefund.example", emailUpdates: true, deadlineReminders: true },
    payments: requests
      .filter((r) => r.status === "Completed")
      .map((r) => ({ id: `pay-${r.id}`, requestId: r.id, provider: built.find((b) => b.req.id === r.id)!.opp.provider, amount: r.funded, at: r.history[r.history.length - 1].at, reference: `SIM-${r.ref.replace("BF-", "")}-PAY` })),
    pledges: [],
    matches: [],
    programFunds: { ...GRANT_BUDGETS },
    display: { currency: "AED", locale: "en" },
    pilot: { schools: 0, students: 0, requests: 0, resolved: 0, participated: 0, avgDaysToResolve: null, notes: "", updatedAt: null },
    feedback: [],
    onboarded: false,
    demo: { stage: 0, scanned: false },
  };
}
