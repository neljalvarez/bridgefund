/**
 * Demonstration seed data. Every student, institution, sponsor and amount is
 * FICTIONAL. Deadlines are generated relative to the day the demo is seeded so
 * the walkthrough always makes sense.
 */
import type {
  AppState,
  Contribution,
  DistributionEvent,
  Expense,
  FundingRequest,
  Institution,
  Opportunity,
  Reduction,
  RequestStatus,
  Resource,
  Student,
  VerificationMethod,
} from "./types";
import { isoDaysFromNow } from "./format";

export const STATE_VERSION = 3;
export const DEMO_STUDENT_ID = "s-amina";
export const DEMO_OPPORTUNITY_ID = "o-amina-cert";
export const SPONSOR_NAME = "Juniper Demo Fund";

export const INSTITUTIONS: Institution[] = [
  { id: "i-northfield", name: "Northfield Community School", type: "School", country: "Kenya", city: "Nairobi" },
  { id: "i-riverside", name: "Riverside Secondary School", type: "School", country: "Philippines", city: "Cebu" },
  { id: "i-ponte", name: "Ponte Educational Trust", type: "Nonprofit", country: "Brazil", city: "Recife" },
  { id: "i-lakeshore", name: "Lakeshore Public High School", type: "School", country: "India", city: "Pune" },
  { id: "i-horizon", name: "Horizon Learning Collective", type: "Nonprofit", country: "Jordan", city: "Amman" },
  { id: "i-valleverde", name: "Valle Verde Preparatoria", type: "School", country: "Mexico", city: "Puebla" },
  { id: "i-brightpath", name: "Bright Path Education Foundation", type: "Nonprofit", country: "Nigeria", city: "Lagos" },
  { id: "i-songhan", name: "Song Han Upper Secondary", type: "School", country: "Vietnam", city: "Da Nang" },
  { id: "i-altamira", name: "Altamira Community College", type: "University", country: "Colombia", city: "Medellín" },
  { id: "i-merapi", name: "Merapi Senior High School", type: "School", country: "Indonesia", city: "Yogyakarta" },
  { id: "i-asante", name: "Asante Ridge Senior High", type: "School", country: "Ghana", city: "Kumasi" },
  { id: "i-ravi", name: "Ravi Scholars Trust", type: "Nonprofit", country: "Pakistan", city: "Lahore" },
  { id: "i-pacifico", name: "Colegio Pacífico", type: "School", country: "Peru", city: "Lima" },
];

const elig = (lowIncome: boolean, publicSchool: boolean, firstGeneration: boolean, hasSchoolLetter: boolean) => ({
  lowIncome,
  publicSchool,
  firstGeneration,
  hasSchoolLetter,
});

export const STUDENTS: Student[] = [
  { id: "s-amina", firstName: "Amina", initials: "AY", country: "Kenya", city: "Nairobi", grade: "Grade 12", institutionId: "i-northfield", goal: "Become a certified data analyst", eligibility: elig(true, true, true, true) },
  { id: "s-joshua", firstName: "Joshua", initials: "JR", country: "Philippines", city: "Cebu", grade: "Grade 11", institutionId: "i-riverside", goal: "Compete in the national science olympiad finals", eligibility: elig(true, true, false, true) },
  { id: "s-lucia", firstName: "Lucía", initials: "LM", country: "Colombia", city: "Medellín", grade: "Pre-university", institutionId: "i-altamira", goal: "Qualify for an engineering degree", eligibility: elig(true, true, true, true) },
  { id: "s-priya", firstName: "Priya", initials: "PK", country: "India", city: "Pune", grade: "Year 1 diploma", institutionId: "i-lakeshore", goal: "Complete a software engineering internship", eligibility: elig(true, true, true, true) },
  { id: "s-mateus", firstName: "Mateus", initials: "MS", country: "Brazil", city: "Recife", grade: "Final year", institutionId: "i-ponte", goal: "Sit the national university entrance exam", eligibility: elig(true, true, true, false) },
  { id: "s-hana", firstName: "Hana", initials: "HA", country: "Jordan", city: "Amman", grade: "Grade 12", institutionId: "i-horizon", goal: "Meet the English requirement for university", eligibility: elig(true, false, true, true) },
  { id: "s-diego", firstName: "Diego", initials: "DR", country: "Mexico", city: "Puebla", grade: "Grade 12", institutionId: "i-valleverde", goal: "Attend a coding academy admission interview", eligibility: elig(true, true, false, true) },
  { id: "s-ngozi", firstName: "Ngozi", initials: "NO", country: "Nigeria", city: "Lagos", grade: "Year 2", institutionId: "i-brightpath", goal: "Finish an online data science course", eligibility: elig(true, false, true, true) },
  { id: "s-linh", firstName: "Linh", initials: "LT", country: "Vietnam", city: "Da Nang", grade: "Grade 11", institutionId: "i-songhan", goal: "Represent the school at the national debate championship", eligibility: elig(false, true, false, true) },
  { id: "s-putri", firstName: "Putri", initials: "PW", country: "Indonesia", city: "Yogyakarta", grade: "Grade 12", institutionId: "i-merapi", goal: "Apply to a public university", eligibility: elig(true, true, true, false) },
  { id: "s-ayesha", firstName: "Ayesha", initials: "AK", country: "Pakistan", city: "Lahore", grade: "Grade 12", institutionId: "i-ravi", goal: "Sit the engineering university entrance test", eligibility: elig(true, true, true, true) },
  { id: "s-kofi", firstName: "Kofi", initials: "KM", country: "Ghana", city: "Kumasi", grade: "Final year", institutionId: "i-asante", goal: "Start an agricultural research internship", eligibility: elig(true, true, true, true) },
  { id: "s-mariana", firstName: "Mariana", initials: "MQ", country: "Peru", city: "Lima", grade: "Grade 11", institutionId: "i-pacifico", goal: "Join the national youth robotics team", eligibility: elig(false, true, false, true) },
  { id: "s-fatima", firstName: "Fatima", initials: "FH", country: "Kenya", city: "Nairobi", grade: "Grade 12", institutionId: "i-northfield", goal: "Complete A-level chemistry practicals", eligibility: elig(true, true, false, true) },
  { id: "s-tomas", firstName: "Tomás", initials: "TB", country: "Philippines", city: "Cebu", grade: "Grade 10", institutionId: "i-riverside", goal: "Compete at the regional robotics finals", eligibility: elig(true, true, false, true) },
];

export const RESOURCES: Resource[] = [
  { id: "r-graphing", name: "Graphing calculator", type: "calculator", institutionId: "i-northfield", total: 12, available: 5, retailValue: 120, loanTerm: "Full school term", description: "Exam-approved graphing calculators for mathematics and science papers.", keywords: ["graphing calculator", "calculator"] },
  { id: "r-sci-calc", name: "Scientific calculator", type: "calculator", institutionId: "i-riverside", total: 25, available: 18, retailValue: 25, loanTerm: "Full school term", description: "Standard scientific calculators for coursework and exams.", keywords: ["scientific calculator"] },
  { id: "r-laptop", name: "Refurbished laptop", type: "laptop", institutionId: "i-northfield", total: 8, available: 2, retailValue: 450, loanTerm: "One semester", description: "Refurbished laptops with office and coding software installed.", keywords: ["laptop", "computer"] },
  { id: "r-robot-kit", name: "Robotics starter kit", type: "stem-kit", institutionId: "i-northfield", total: 6, available: 3, retailValue: 85, loanTerm: "Until the competition ends", description: "Microcontroller, motors, sensors and chassis for school robotics teams.", keywords: ["robot", "stem kit"] },
  { id: "r-lab-set", name: "Lab goggles & coat set", type: "lab-equipment", institutionId: "i-northfield", total: 20, available: 14, retailValue: 35, loanTerm: "Practical exam period", description: "Safety equipment required for chemistry and biology practicals.", keywords: ["goggles", "lab coat"] },
  { id: "r-microscope", name: "Student microscope kit", type: "lab-equipment", institutionId: "i-ponte", total: 5, available: 1, retailValue: 140, loanTerm: "Two weeks", description: "Portable microscope with prepared slides for biology projects.", keywords: ["microscope"] },
  { id: "r-math-books", name: "Advanced mathematics textbook set", type: "textbook", institutionId: "i-altamira", total: 15, available: 6, retailValue: 60, loanTerm: "Academic year", description: "Exchange shelf for pre-university mathematics textbooks.", keywords: ["math textbook", "mathematics textbook"] },
  { id: "r-physics-books", name: "Physics textbook exchange", type: "textbook", institutionId: "i-riverside", total: 10, available: 4, retailValue: 55, loanTerm: "Academic year", description: "Donated physics textbooks passed between year groups.", keywords: ["physics textbook"] },
  { id: "r-hotspot", name: "Mobile hotspot with data", type: "connectivity", institutionId: "i-brightpath", total: 10, available: 0, retailValue: 90, loanTerm: "One month", description: "Pocket Wi-Fi device with a prepaid education data plan.", keywords: ["hotspot", "wifi", "data bundle"] },
  { id: "r-printer", name: "3D printer time slot", type: "school-equipment", institutionId: "i-lakeshore", total: 4, available: 4, retailValue: 30, loanTerm: "Two-hour slot", description: "Supervised 3D printer access for STEM project prototypes.", keywords: ["3d print"] },
  { id: "r-interview-closet", name: "Interview clothing closet", type: "school-equipment", institutionId: "i-valleverde", total: 12, available: 7, retailValue: 70, loanTerm: "One week", description: "Clean, professional outfits for interviews and award ceremonies.", keywords: ["interview outfit", "formal clothes"] },
  { id: "r-prep-library", name: "Free exam prep library", type: "free-resource", institutionId: "i-northfield", total: 999, available: 999, retailValue: 40, loanTerm: "Unlimited digital access", description: "Open past papers, practice tests and recorded lessons. No reservation needed.", keywords: ["practice test", "past paper"] },
];

const exp = (id: string, label: string, category: Expense["category"], amount: number, confirmed = true): Expense => ({ id, label, category, amount, confirmed });

const red = (id: string, kind: Reduction["kind"], sourceId: string, title: string, amount: number, expenseId?: string): Reduction => ({ id, kind, sourceId, title, amount, expenseId });

interface ReqSeed {
  id: string;
  ref: string;
  studentId: string;
  opp: Omit<Opportunity, "id" | "studentId" | "institutionId" | "createdAt" | "deadline" | "priorAssistance">;
  days: number;
  reductions: Reduction[];
  funded: number;
  status: RequestStatus;
  reason: string;
  verification: VerificationMethod;
}

function buildRequest(s: ReqSeed, now: Date): { opp: Opportunity; req: FundingRequest } {
  const student = STUDENTS.find((x) => x.id === s.studentId)!;
  const deadline = isoDaysFromNow(s.days, now);
  const created = isoDaysFromNow(Math.min(s.days - 12, -3), now);
  const opp: Opportunity = {
    ...s.opp,
    id: `o-${s.id}`,
    studentId: s.studentId,
    institutionId: student.institutionId,
    deadline,
    priorAssistance: 0,
    createdAt: created,
  };
  const totalCost = s.opp.expenses.reduce((a, e) => a + e.amount, 0);
  const amount = Math.round((totalCost - s.opp.studentFunds - s.reductions.reduce((a, r) => a + r.amount, 0)) * 100) / 100;
  const flow: RequestStatus[] = ["Submitted", "Under Review", "Verified", "Partially Funded", "Fully Funded", "Completed"];
  const upto = s.status === "Draft" ? -1 : flow.indexOf(s.status);
  const history = flow.slice(0, upto + 1).map((st, i) => ({
    at: isoDaysFromNow(Math.min(s.days - 12, -3) + i, now),
    status: st,
    note:
      st === "Submitted"
        ? "Request submitted by student"
        : st === "Under Review"
          ? "Institution started verification"
          : st === "Verified"
            ? "Need verified by institution"
            : st === "Completed"
              ? "Assistance paid directly to provider"
              : "Sponsor contribution received",
    actor: (st === "Submitted" ? "student" : st.includes("Funded") ? "sponsor" : "institution") as FundingRequest["history"][number]["actor"],
  }));
  const req: FundingRequest = {
    id: s.id,
    ref: s.ref,
    studentId: s.studentId,
    opportunityId: opp.id,
    purpose: s.opp.title,
    totalCost,
    studentFunds: s.opp.studentFunds,
    reductions: s.reductions,
    amount,
    funded: s.funded,
    deadline,
    expenses: s.opp.expenses,
    reason: s.reason,
    documents: [
      { name: "Proof of enrollment", attached: true },
      { name: "Official cost confirmation", attached: s.status !== "Submitted" },
    ],
    verification: s.verification,
    status: s.status,
    history,
    createdAt: created,
  };
  return { opp, req };
}

const REQUEST_SEEDS: ReqSeed[] = [
  {
    id: "r-joshua", ref: "BF-2041", studentId: "s-joshua", days: 6, funded: 0, status: "Verified", verification: "school-letter",
    reason: "Family income covers school costs but not an unplanned inter-island trip.",
    opp: { title: "National Science Olympiad finals trip", provider: "National Science Olympiad Committee", category: "competition", outcome: "Compete at national level; finalists are considered for university science scholarships.", studentFunds: 20,
      expenses: [exp("e1", "Finalist registration", "registration", 25), exp("e2", "Ferry and bus fare", "travel", 48), exp("e3", "Two nights' dormitory stay", "accommodation", 30, false)] },
    reductions: [red("rd1", "waiver", "w-olympiad", "Olympiad Finalist Registration Waiver", 25, "e1")],
  },
  {
    id: "r-lucia", ref: "BF-2043", studentId: "s-lucia", days: 16, funded: 20, status: "Partially Funded", verification: "institution-portal",
    reason: "Registration opened before the family's monthly income arrives.",
    opp: { title: "Pre-university mathematics placement exam", provider: "Altamira Community College", category: "examination", outcome: "Placement into the engineering foundation year.", studentFunds: 35,
      expenses: [exp("e1", "Exam registration", "registration", 95), exp("e2", "Certified transcript copy", "documentation", 10)] },
    reductions: [red("rd1", "alternative", "alt-transcript", "Free digital transcript from the school registrar", 10, "e2")],
  },
  {
    id: "r-priya", ref: "BF-2044", studentId: "s-priya", days: 12, funded: 0, status: "Verified", verification: "document-review",
    reason: "The internship stipend is paid after the first month.",
    opp: { title: "Software engineering summer internship — first month", provider: "Pune technology employer", category: "internship", outcome: "First professional software role; stipend begins in month two.", studentFunds: 12,
      expenses: [exp("e1", "Monthly bus pass", "travel", 38), exp("e2", "Document attestation", "documentation", 26), exp("e3", "Lunch for the first month", "food", 40, false)] },
    reductions: [red("rd1", "waiver", "w-intern-docs", "Internship Documentation Fee Waiver", 20, "e2")],
  },
  {
    id: "r-mateus", ref: "BF-2046", studentId: "s-mateus", days: 9, funded: 0, status: "Submitted", verification: "school-letter",
    reason: "Registration closes before the next household payment.",
    opp: { title: "National university entrance exam", provider: "National Entrance Exam Office", category: "examination", outcome: "Eligibility for public university admission.", studentFunds: 12,
      expenses: [exp("e1", "Exam registration", "registration", 80), exp("e2", "Bus to exam centre", "travel", 12)] },
    reductions: [red("rd1", "waiver", "w-public-exam", "Public School Entrance Exam Fee Reduction", 40, "e1")],
  },
  {
    id: "r-hana", ref: "BF-2047", studentId: "s-hana", days: 19, funded: 0, status: "Under Review", verification: "counselor-call",
    reason: "Required by the university by the end of the month.",
    opp: { title: "English proficiency test for university admission", provider: "International English Assessment Council", category: "examination", outcome: "Meets the language requirement for a conditional university offer.", studentFunds: 0,
      expenses: [exp("e1", "Test registration", "registration", 120)] },
    reductions: [red("rd1", "waiver", "w-lang-test", "Language Test Fee Reduction", 30, "e1")],
  },
  {
    id: "r-diego", ref: "BF-2048", studentId: "s-diego", days: 4, funded: 0, status: "Verified", verification: "school-letter",
    reason: "Interview is in another city; transport was not budgeted.",
    opp: { title: "Coding academy admission interview", provider: "Puebla coding academy", category: "interview", outcome: "A place in a tuition-free coding academy cohort.", studentFunds: 0,
      expenses: [exp("e1", "Round-trip bus ticket", "travel", 18), exp("e2", "Mobile data top-up for the online test", "other", 10)] },
    reductions: [],
  },
  {
    id: "r-ngozi", ref: "BF-2049", studentId: "s-ngozi", days: 22, funded: 40, status: "Partially Funded", verification: "document-review",
    reason: "The laptop screen failed mid-course.",
    opp: { title: "Online data science course — laptop repair", provider: "Lagos repair centre", category: "technology", outcome: "Finish the course and earn its completion certificate.", studentFunds: 5,
      expenses: [exp("e1", "Laptop screen replacement", "equipment", 80), exp("e2", "Course data bundle", "other", 20)] },
    reductions: [red("rd1", "discount", "d-tech-access", "Technology Access Student Discount", 24, "e1"), red("rd2", "discount", "d-tech-access", "Technology Access Student Discount", 6, "e2")],
  },
  {
    id: "r-linh", ref: "BF-2050", studentId: "s-linh", days: 27, funded: 35, status: "Fully Funded", verification: "institution-portal",
    reason: "Team travel was not covered by the school budget this year.",
    opp: { title: "National youth debate championship", provider: "National Debate Society", category: "competition", outcome: "Represent the school at the national championship.", studentFunds: 30,
      expenses: [exp("e1", "Team registration share", "registration", 35), exp("e2", "Train fare", "travel", 30)] },
    reductions: [],
  },
  {
    id: "r-putri", ref: "BF-2051", studentId: "s-putri", days: 31, funded: 0, status: "Submitted", verification: "school-letter",
    reason: "Application window closes before scholarship results are released.",
    opp: { title: "Public university application fee", provider: "State university admissions", category: "university-application", outcome: "A complete application to a public university.", studentFunds: 0,
      expenses: [exp("e1", "Application fee", "registration", 30)] },
    reductions: [],
  },
  {
    id: "r-ayesha", ref: "BF-2052", studentId: "s-ayesha", days: 8, funded: 0, status: "Verified", verification: "school-letter",
    reason: "Test centre is in another city and registration is due before the family's next income.",
    opp: { title: "Engineering university entrance test", provider: "University entrance testing service", category: "examination", outcome: "Eligibility for engineering programmes at public universities.", studentFunds: 15,
      expenses: [exp("e1", "Test registration", "registration", 70), exp("e2", "Intercity bus fare", "travel", 40)] },
    reductions: [],
  },
  {
    id: "r-kofi", ref: "BF-2053", studentId: "s-kofi", days: 14, funded: 0, status: "Verified", verification: "document-review",
    reason: "The research station is 300 km away; the stipend starts after week one.",
    opp: { title: "Agricultural research internship — first week", provider: "National crop research station", category: "internship", outcome: "A paid research internship with a recommendation letter.", studentFunds: 10,
      expenses: [exp("e1", "Bus to research station", "travel", 35), exp("e2", "First week hostel stay", "accommodation", 125)] },
    reductions: [],
  },
  {
    id: "r-mariana", ref: "BF-2054", studentId: "s-mariana", days: 26, funded: 0, status: "Verified", verification: "institution-portal",
    reason: "The national team requires members to bring their own sensor kit.",
    opp: { title: "National youth robotics team — sensor kit", provider: "National Youth Robotics Programme", category: "competition", outcome: "A place on the national youth robotics team.", studentFunds: 30,
      expenses: [exp("e1", "Sensor and controller kit", "equipment", 150)] },
    reductions: [],
  },
  {
    id: "r-fatima", ref: "BF-2031", studentId: "s-fatima", days: -10, funded: 55, status: "Completed", verification: "institution-portal",
    reason: "Practical exam fee due before bursary payment.",
    opp: { title: "A-level chemistry practical exam fee", provider: "National examinations council", category: "examination", outcome: "Sat the chemistry practical exam.", studentFunds: 0,
      expenses: [exp("e1", "Practical exam fee", "registration", 55)] },
    reductions: [],
  },
  {
    id: "r-tomas", ref: "BF-2028", studentId: "s-tomas", days: -20, funded: 40, status: "Completed", verification: "school-letter",
    reason: "Travel to the regional finals.",
    opp: { title: "Regional robotics finals travel", provider: "Regional Robotics League", category: "competition", outcome: "Competed at the regional finals.", studentFunds: 0,
      expenses: [exp("e1", "Bus and ferry fare", "travel", 40)] },
    reductions: [],
  },
];

export function amina(now: Date): Opportunity[] {
  return [
    {
      id: DEMO_OPPORTUNITY_ID,
      studentId: DEMO_STUDENT_ID,
      title: "Associate Data Analyst Certification exam",
      provider: "Open Skills Certification Board",
      category: "certification",
      deadline: isoDaysFromNow(18, now),
      institutionId: "i-northfield",
      expenses: [exp("e1", "Certification exam fee", "registration", 180)],
      studentFunds: 70,
      priorAssistance: 0,
      outcome: "An industry-recognised credential required for entry-level data analyst roles.",
      createdAt: isoDaysFromNow(-6, now),
    },
    {
      id: "o-amina-robotics",
      studentId: DEMO_STUDENT_ID,
      title: "Regional Robotics Challenge",
      provider: "Regional Robotics Challenge",
      category: "competition",
      deadline: isoDaysFromNow(24, now),
      institutionId: "i-northfield",
      expenses: [
        exp("e1", "Team registration", "registration", 40),
        exp("e2", "Bus fare to venue", "travel", 35),
        exp("e3", "Robotics starter kit", "materials", 85, false),
        exp("e4", "Lunch on competition day", "food", 15, false),
      ],
      studentFunds: 20,
      priorAssistance: 0,
      outcome: "Build a working robot with the school team; regional winners advance to nationals.",
      createdAt: isoDaysFromNow(-4, now),
    },
    {
      id: "o-amina-uni",
      studentId: DEMO_STUDENT_ID,
      title: "State University of Technology application",
      provider: "State University of Technology",
      category: "university-application",
      deadline: isoDaysFromNow(40, now),
      institutionId: "i-northfield",
      expenses: [exp("e1", "Application fee", "registration", 45), exp("e2", "Certified transcript copy", "documentation", 12)],
      studentFunds: 0,
      priorAssistance: 0,
      outcome: "A complete application for a BSc in Data Science.",
      createdAt: isoDaysFromNow(-2, now),
    },
  ];
}

export function createSeedState(now = new Date()): AppState {
  const built = REQUEST_SEEDS.map((s) => buildRequest(s, now));
  const opportunities = [...amina(now), ...built.map((b) => b.opp)];
  const requests = built.map((b) => b.req);

  const contributions: Contribution[] = requests
    .filter((r) => r.funded > 0)
    .map((r, i) => ({
      id: `c-seed-${i}`,
      sponsorName: i % 2 ? "Community sponsor (demo)" : "Anonymous sponsor (demo)",
      requestId: r.id,
      amount: r.funded,
      at: r.history[r.history.length - 1]?.at ?? r.createdAt,
      source: "sponsor" as const,
    }));

  const distribution: DistributionEvent[] = [
    ...requests.filter((r) => r.status === "Completed").map((r, i) => ({
      id: `d-seed-c${i}`,
      at: r.history[r.history.length - 1].at,
      label: `Paid ${r.purpose.toLowerCase()} directly to provider`,
      amount: r.funded,
      requestRef: r.ref,
      kind: "completion" as const,
    })),
    ...requests.flatMap((r) =>
      r.reductions.map((rd, i) => ({
        id: `d-seed-${r.id}-${i}`,
        at: r.createdAt,
        label: rd.title,
        amount: rd.amount,
        requestRef: r.ref,
        kind: (rd.kind === "borrow" ? "resource" : "waiver") as DistributionEvent["kind"],
      })),
    ),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return {
    version: STATE_VERSION,
    seededAt: now.toISOString(),
    role: "student",
    currentStudentId: DEMO_STUDENT_ID,
    sponsor: { name: SPONSOR_NAME, balance: 500, startingBalance: 500 },
    pool: 150,
    institutionFunds: 1200,
    students: STUDENTS,
    institutions: INSTITUTIONS,
    opportunities,
    requests,
    resources: RESOURCES.map((r) => ({ ...r })),
    reservations: [],
    contributions,
    distribution,
    notifications: [
      { id: "n1", role: "student", title: "Waiver deadline approaching", body: "A fee waiver that may apply to your certification exam closes in 21 days.", href: "/student/waivers", at: isoDaysFromNow(-1, now), read: false },
      { id: "n2", role: "student", title: "Welcome to your quest journal", body: "Run BridgeEngine on an opportunity to build your action plan.", href: "/student/engine", at: isoDaysFromNow(-2, now), read: true },
      { id: "n3", role: "sponsor", title: "2 verified needs close within 7 days", body: "Smart Impact Allocation can suggest how to cover them.", href: "/sponsor/allocate", at: isoDaysFromNow(-1, now), read: false },
      { id: "n4", role: "institution", title: "2 requests awaiting verification", body: "New submissions from Recife and Yogyakarta.", href: "/institution", at: isoDaysFromNow(-1, now), read: false },
    ],
    savedWaivers: [],
    savedOpportunities: [],
    scenarios: [],
    milestones: [
      { id: "m1", at: isoDaysFromNow(-60, now), label: "Joined Northfield data club" },
      { id: "m2", at: isoDaysFromNow(-21, now), label: "Passed the practice certification test" },
      { id: "m3", at: isoDaysFromNow(-6, now), label: "Earned a place on the certification exam register" },
    ],
    onboarded: false,
    sound: false,
    demo: { stage: 0, scanned: false, engineRun: false, approved: false, contributed: false },
  };
}
