/**
 * Demonstration seed data. Every student, institution, sponsor and amount is
 * FICTIONAL. Deadlines are generated relative to the day the demo is seeded so
 * the walkthrough always makes sense.
 */
import type { AppState, Contribution, DistributionEvent, Expense, FundingRequest, Institution, Opportunity, Reduction, RequestStatus, Resource, Sponsor, Student } from "./types";
import { isoDaysFromNow } from "./format";
import { GRANT_BUDGETS } from "./knowledge";

export const STATE_VERSION = 5;
export const DEMO_STUDENT_ID = "s-amina";
export const DEMO_OPPORTUNITY_ID = "o-amina-cert";
export const DEMO_SPONSOR_ID = "sp-juniper";

export const INSTITUTIONS: Institution[] = [
  { id: "i-northfield", name: "Northfield Community School", type: "School", country: "Kenya", city: "Nairobi", fund: 600 },
  { id: "i-riverside", name: "Riverside Secondary School", type: "School", country: "Philippines", city: "Cebu", fund: 250 },
  { id: "i-ponte", name: "Ponte Educational Trust", type: "Nonprofit", country: "Brazil", city: "Recife", fund: 400 },
  { id: "i-lakeshore", name: "Lakeshore Public High School", type: "School", country: "India", city: "Pune", fund: 180 },
  { id: "i-horizon", name: "Horizon Learning Collective", type: "Nonprofit", country: "Jordan", city: "Amman", fund: 350 },
  { id: "i-valleverde", name: "Valle Verde Preparatoria", type: "School", country: "Mexico", city: "Puebla", fund: 150 },
  { id: "i-brightpath", name: "Bright Path Education Foundation", type: "Nonprofit", country: "Nigeria", city: "Lagos", fund: 300 },
  { id: "i-songhan", name: "Song Han Upper Secondary", type: "School", country: "Vietnam", city: "Da Nang", fund: 120 },
  { id: "i-altamira", name: "Altamira Community College", type: "University", country: "Colombia", city: "Medellín", fund: 280 },
  { id: "i-merapi", name: "Merapi Senior High School", type: "School", country: "Indonesia", city: "Yogyakarta", fund: 140 },
  { id: "i-asante", name: "Asante Ridge Senior High", type: "School", country: "Ghana", city: "Kumasi", fund: 160 },
  { id: "i-ravi", name: "Ravi Scholars Trust", type: "Nonprofit", country: "Pakistan", city: "Lahore", fund: 320 },
  { id: "i-pacifico", name: "Colegio Pacífico", type: "School", country: "Peru", city: "Lima", fund: 130 },
];

const elig = (lowIncome: boolean, publicSchool: boolean, firstGeneration: boolean, hasSchoolLetter: boolean) => ({ lowIncome, publicSchool, firstGeneration, hasSchoolLetter });

export const STUDENTS: Student[] = [
  { id: "s-amina", firstName: "Amina", initials: "AY", country: "Kenya", city: "Nairobi", grade: "Grade 12", level: "secondary", institutionId: "i-northfield", goal: "Become a certified data analyst", eligibility: elig(true, true, true, true) },
  { id: "s-joshua", firstName: "Joshua", initials: "JR", country: "Philippines", city: "Cebu", grade: "Grade 11", level: "secondary", institutionId: "i-riverside", goal: "Compete in the national science olympiad finals", eligibility: elig(true, true, false, true) },
  { id: "s-lucia", firstName: "Lucía", initials: "LM", country: "Colombia", city: "Medellín", grade: "Pre-university", level: "pre-university", institutionId: "i-altamira", goal: "Qualify for an engineering degree", eligibility: elig(true, true, true, true) },
  { id: "s-priya", firstName: "Priya", initials: "PK", country: "India", city: "Pune", grade: "Diploma, year 1", level: "vocational", institutionId: "i-lakeshore", goal: "Complete a software engineering internship", eligibility: elig(true, true, true, true) },
  { id: "s-mateus", firstName: "Mateus", initials: "MS", country: "Brazil", city: "Recife", grade: "Final year", level: "secondary", institutionId: "i-ponte", goal: "Sit the national university entrance exam", eligibility: elig(true, true, true, false) },
  { id: "s-hana", firstName: "Hana", initials: "HA", country: "Jordan", city: "Amman", grade: "Grade 12", level: "secondary", institutionId: "i-horizon", goal: "Meet the English requirement for university", eligibility: elig(true, false, true, true) },
  { id: "s-diego", firstName: "Diego", initials: "DR", country: "Mexico", city: "Puebla", grade: "Grade 12", level: "secondary", institutionId: "i-valleverde", goal: "Attend a coding academy admission interview", eligibility: elig(true, true, false, true) },
  { id: "s-ngozi", firstName: "Ngozi", initials: "NO", country: "Nigeria", city: "Lagos", grade: "Year 2", level: "undergraduate", institutionId: "i-brightpath", goal: "Finish an online data science course", eligibility: elig(true, false, true, true) },
  { id: "s-linh", firstName: "Linh", initials: "LT", country: "Vietnam", city: "Da Nang", grade: "Grade 11", level: "secondary", institutionId: "i-songhan", goal: "Represent the school at the national debate championship", eligibility: elig(false, true, false, true) },
  { id: "s-putri", firstName: "Putri", initials: "PW", country: "Indonesia", city: "Yogyakarta", grade: "Grade 12", level: "secondary", institutionId: "i-merapi", goal: "Apply to a public university", eligibility: elig(true, true, true, false) },
  { id: "s-ayesha", firstName: "Ayesha", initials: "AK", country: "Pakistan", city: "Lahore", grade: "Grade 12", level: "secondary", institutionId: "i-ravi", goal: "Sit the engineering university entrance test", eligibility: elig(true, true, true, true) },
  { id: "s-kofi", firstName: "Kofi", initials: "KM", country: "Ghana", city: "Kumasi", grade: "Final year", level: "undergraduate", institutionId: "i-asante", goal: "Start an agricultural research internship", eligibility: elig(true, true, true, true) },
  { id: "s-mariana", firstName: "Mariana", initials: "MQ", country: "Peru", city: "Lima", grade: "Grade 11", level: "secondary", institutionId: "i-pacifico", goal: "Join the national youth robotics team", eligibility: elig(false, true, false, true) },
  { id: "s-fatima", firstName: "Fatima", initials: "FH", country: "Kenya", city: "Nairobi", grade: "Grade 12", level: "secondary", institutionId: "i-northfield", goal: "Complete A-level chemistry practicals", eligibility: elig(true, true, false, true) },
  { id: "s-tomas", firstName: "Tomás", initials: "TB", country: "Philippines", city: "Cebu", grade: "Grade 10", level: "secondary", institutionId: "i-riverside", goal: "Compete at the regional robotics finals", eligibility: elig(true, true, false, true) },
];

export const SPONSORS: Sponsor[] = [
  { id: DEMO_SPONSOR_ID, name: "Juniper Demo Fund", type: "Foundation", balance: 500, startingBalance: 500 },
  { id: "sp-harbor", name: "Harbor Tech CSR Programme", type: "Company", balance: 1200, startingBalance: 1400 },
  { id: "sp-community", name: "Community Giving Circle", type: "Individual", balance: 260, startingBalance: 400 },
];

const res = (id: string, name: string, type: Resource["type"], institutionId: string, total: number, available: number, retailValue: number, loanTerm: string, description: string, keywords: string[]): Resource => ({ id, name, type, institutionId, total, available, retailValue, loanTerm, description, keywords });

export const RESOURCES: Resource[] = [
  res("r-graphing", "Graphing calculator", "calculator", "i-northfield", 12, 5, 120, "Full school term", "Exam-approved graphing calculators for mathematics and science papers.", ["graphing calculator"]),
  res("r-sci-calc", "Scientific calculator", "calculator", "i-riverside", 25, 18, 25, "Full school term", "Standard scientific calculators for coursework and exams.", ["scientific calculator"]),
  res("r-laptop", "Refurbished laptop", "laptop", "i-northfield", 8, 2, 450, "One semester", "Refurbished laptops with office and coding software installed.", ["laptop", "computer"]),
  res("r-laptop-2", "Chromebook", "laptop", "i-brightpath", 10, 3, 260, "One semester", "Lightweight laptops for online courses and applications.", ["chromebook"]),
  res("r-robot-kit", "Robotics starter kit", "engineering", "i-northfield", 6, 3, 85, "Until the competition ends", "Microcontroller, motors, sensors and chassis for school robotics teams.", ["robot"]),
  res("r-sensor-kit", "Sensor and controller kit", "engineering", "i-pacifico", 4, 1, 150, "Until the competition ends", "Sensors and a programmable controller for advanced robotics.", ["sensor", "controller kit"]),
  res("r-lab-set", "Lab goggles and coat set", "lab-equipment", "i-northfield", 20, 14, 35, "Practical exam period", "Safety equipment required for chemistry and biology practicals.", ["goggles", "lab coat"]),
  res("r-microscope", "Student microscope kit", "lab-equipment", "i-ponte", 5, 1, 140, "Two weeks", "Portable microscope with prepared slides for biology projects.", ["microscope"]),
  res("r-math-books", "Advanced mathematics textbook set", "textbook", "i-altamira", 15, 6, 60, "Academic year", "Exchange shelf for pre-university mathematics textbooks.", ["math textbook", "mathematics textbook"]),
  res("r-physics-books", "Physics textbook set", "textbook", "i-riverside", 10, 4, 55, "Academic year", "Donated physics textbooks passed between year groups.", ["physics textbook"]),
  res("r-prep-pack", "Certification exam prep pack", "exam-prep", "i-northfield", 10, 7, 40, "Until your exam date", "Printed past papers, a revision guide and access to recorded lessons.", ["prep pack", "revision guide"]),
  res("r-printer", "3D printer time slot", "school-equipment", "i-lakeshore", 4, 4, 30, "Two-hour slot", "Supervised 3D printer access for STEM project prototypes.", ["3d print"]),
  res("r-interview", "Interview clothing closet", "school-equipment", "i-valleverde", 12, 7, 70, "One week", "Clean, professional outfits for interviews and award ceremonies.", ["interview outfit", "formal clothes"]),
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
  { id: "r-joshua", ref: "BF-2041", studentId: "s-joshua", days: 6, funded: 0, status: "Verified", explanation: "Family income covers school costs but not an unplanned inter-island trip.", title: "National Science Olympiad finals trip", provider: "National Science Olympiad Committee", category: "competition", outcome: "Compete at national level; finalists are considered for university science scholarships.", studentFunds: 20, expenses: [exp("e1", "Finalist registration", "registration", 25), exp("e2", "Ferry and bus fare", "transportation", 48), exp("e3", "Two nights' dormitory stay", "accommodation", 30, false)], reductions: [red("waiver", "w-olympiad", "Olympiad Finalist Registration Waiver", 25, "e1")] },
  { id: "r-lucia", ref: "BF-2043", studentId: "s-lucia", days: 16, funded: 20, status: "Partially Funded", explanation: "Registration opened before the family's monthly income arrives.", title: "Pre-university mathematics placement exam", provider: "Altamira Community College", category: "examination", outcome: "Placement into the engineering foundation year.", studentFunds: 35, expenses: [exp("e1", "Exam registration", "examination", 95), exp("e2", "Certified transcript copy", "documentation", 10)], reductions: [red("alternative", "alt-transcript", "Free digital transcript", 10, "e2")] },
  { id: "r-priya", ref: "BF-2044", studentId: "s-priya", days: 12, funded: 0, status: "Verified", explanation: "The internship stipend is only paid after the first month.", title: "Software engineering internship — first month", provider: "Pune technology employer", category: "internship", outcome: "First professional software role; stipend begins in month two.", studentFunds: 12, expenses: [exp("e1", "Monthly bus pass", "transportation", 38), exp("e2", "Document attestation", "documentation", 26), exp("e3", "Lunch for the first month", "food", 40, false)], reductions: [red("waiver", "w-intern-docs", "Internship Documentation Fee Waiver", 20, "e2")] },
  { id: "r-mateus", ref: "BF-2046", studentId: "s-mateus", days: 9, funded: 0, status: "Submitted", explanation: "Registration closes before the next household payment.", title: "National university entrance exam", provider: "National Entrance Exam Office", category: "examination", outcome: "Eligibility for public university admission.", studentFunds: 12, expenses: [exp("e1", "Exam registration", "examination", 80), exp("e2", "Bus to exam centre", "transportation", 12)], reductions: [{ ...red("waiver", "w-public-exam", "Public School Entrance Exam Fee Reduction", 40, "e1"), confirmed: false }] },
  { id: "r-hana", ref: "BF-2047", studentId: "s-hana", days: 19, funded: 0, status: "Under Review", explanation: "Required by the university by the end of the month.", title: "English proficiency test for university admission", provider: "International English Assessment Council", category: "examination", outcome: "Meets the language requirement for a conditional university offer.", studentFunds: 0, expenses: [exp("e1", "Test registration", "examination", 120)], reductions: [{ ...red("waiver", "w-lang-test", "Language Test Fee Reduction", 30, "e1"), confirmed: false }] },
  { id: "r-diego", ref: "BF-2048", studentId: "s-diego", days: 4, funded: 0, status: "Verified", explanation: "The interview is in another city and transport was not budgeted.", title: "Coding academy admission interview", provider: "Puebla coding academy", category: "interview", outcome: "A place in a tuition-free coding academy cohort.", studentFunds: 0, expenses: [exp("e1", "Round-trip bus ticket", "transportation", 18), exp("e2", "Mobile data for the online test", "technology", 10)], reductions: [] },
  { id: "r-ngozi", ref: "BF-2049", studentId: "s-ngozi", days: 22, funded: 40, status: "Partially Funded", explanation: "The laptop screen failed mid-course.", title: "Online data science course — laptop repair", provider: "Lagos repair centre", category: "technology", outcome: "Finish the course and earn its completion certificate.", studentFunds: 5, expenses: [exp("e1", "Laptop screen replacement", "equipment", 80), exp("e2", "Course data bundle", "technology", 20)], reductions: [red("discount", "d-tech-access", "Technology Access Student Discount", 24, "e1"), red("discount", "d-tech-access", "Technology Access Student Discount", 6, "e2")] },
  { id: "r-linh", ref: "BF-2050", studentId: "s-linh", days: 27, funded: 35, status: "Fully Funded", explanation: "Team travel was not covered by the school budget this year.", title: "National youth debate championship", provider: "National Debate Society", category: "competition", outcome: "Represent the school at the national championship.", studentFunds: 30, expenses: [exp("e1", "Team registration share", "registration", 35), exp("e2", "Train fare", "transportation", 30)], reductions: [] },
  { id: "r-putri", ref: "BF-2051", studentId: "s-putri", days: 31, funded: 0, status: "Additional Information Required", explanation: "The application window closes before scholarship results are released.", title: "Public university application fee", provider: "State university admissions", category: "university-application", outcome: "A complete application to a public university.", studentFunds: 0, expenses: [exp("e1", "Application fee", "registration", 30)], reductions: [], infoRequested: "Please attach the official fee notice from the admissions portal." },
  { id: "r-ayesha", ref: "BF-2052", studentId: "s-ayesha", days: 8, funded: 0, status: "Verified", explanation: "The test centre is in another city and registration is due before the family's next income.", title: "Engineering university entrance test", provider: "University entrance testing service", category: "examination", outcome: "Eligibility for engineering programmes at public universities.", studentFunds: 15, expenses: [exp("e1", "Test registration", "examination", 70), exp("e2", "Intercity bus fare", "transportation", 40)], reductions: [] },
  { id: "r-kofi", ref: "BF-2053", studentId: "s-kofi", days: 14, funded: 0, status: "Verified", explanation: "The research station is 300 km away and the stipend starts after week one.", title: "Agricultural research internship — first week", provider: "National crop research station", category: "internship", outcome: "A paid research internship with a recommendation letter.", studentFunds: 10, expenses: [exp("e1", "Bus to research station", "transportation", 35), exp("e2", "First-week hostel stay", "accommodation", 125)], reductions: [] },
  { id: "r-mariana", ref: "BF-2054", studentId: "s-mariana", days: 26, funded: 0, status: "Verified", explanation: "The national team requires members to bring their own sensor kit.", title: "National youth robotics team — sensor kit", provider: "National Youth Robotics Programme", category: "competition", outcome: "A place on the national youth robotics team.", studentFunds: 30, expenses: [exp("e1", "Advanced sensor kit (team spec)", "equipment", 150)], reductions: [] },
  { id: "r-diego-2", ref: "BF-2056", studentId: "s-diego", days: 4, funded: 0, status: "Submitted", explanation: "Bus ticket to the coding academy interview.", title: "Interview travel — coding academy", provider: "Puebla coding academy", category: "interview", outcome: "A place in a tuition-free coding academy cohort.", studentFunds: 0, expenses: [exp("e1", "Round-trip bus ticket", "transportation", 18)], reductions: [] },
  { id: "r-mateus-2", ref: "BF-2057", studentId: "s-mateus", days: 5, funded: 0, status: "Submitted", explanation: "Need a laptop for the entrance exam preparation course.", title: "Laptop for exam preparation", provider: "Electronics retailer", category: "technology", outcome: "Access to online exam preparation.", studentFunds: 0, expenses: [exp("e1", "New laptop", "equipment", 420, false)], reductions: [], docsAttached: false, institutionId: "i-lakeshore", flag: "Requested amount is unusually high for an exam-prep need and no quote was attached." },
  { id: "r-fatima", ref: "BF-2031", studentId: "s-fatima", days: -10, funded: 55, status: "Completed", explanation: "The practical exam fee was due before the bursary payment.", title: "A-level chemistry practical exam fee", provider: "National examinations council", category: "examination", outcome: "Sat the chemistry practical exam.", result: "Completed opportunity", studentFunds: 0, expenses: [exp("e1", "Practical exam fee", "examination", 55)], reductions: [] },
  { id: "r-tomas", ref: "BF-2028", studentId: "s-tomas", days: -20, funded: 40, status: "Completed", explanation: "Travel to the regional finals.", title: "Regional robotics finals travel", provider: "Regional Robotics League", category: "competition", outcome: "Competed at the regional finals.", result: "Participated", studentFunds: 0, expenses: [exp("e1", "Bus and ferry fare", "transportation", 40)], reductions: [] },
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
    status: s.status,
    infoRequested: s.infoRequested,
    history: path.map((st2, i) => ({ at: isoDaysFromNow(start + i, now), status: st2, note: NOTES[st2] ?? st2, actor: st2 === "Submitted" ? "student" : st2.includes("Funded") ? "sponsor" : "institution" })),
    createdAt: created,
  };
  return { opp, req };
}

export function demoOpportunities(now: Date): Opportunity[] {
  return [
    { id: DEMO_OPPORTUNITY_ID, studentId: DEMO_STUDENT_ID, title: "Associate Data Analyst Certification exam", provider: "Open Skills Certification Board", category: "certification", deadline: isoDaysFromNow(18, now), institutionId: "i-northfield", expenses: [exp("e1", "Certification exam fee", "examination", 180)], studentFunds: 70, priorAssistance: 0, outcome: "An industry-recognised credential required for entry-level data analyst roles.", createdAt: isoDaysFromNow(-6, now) },
    { id: "o-amina-robotics", studentId: DEMO_STUDENT_ID, title: "Regional Robotics Challenge", provider: "Regional Robotics Challenge", category: "competition", deadline: isoDaysFromNow(24, now), institutionId: "i-northfield", expenses: [exp("e1", "Team registration", "registration", 40), exp("e2", "Bus fare to venue", "transportation", 35), exp("e3", "Robotics starter kit", "materials", 85, false), exp("e4", "Lunch on competition day", "food", 15, false)], studentFunds: 20, priorAssistance: 0, outcome: "Build a working robot with the school team; regional winners advance to nationals.", createdAt: isoDaysFromNow(-4, now) },
    { id: "o-amina-uni", studentId: DEMO_STUDENT_ID, title: "State University of Technology application", provider: "State University of Technology", category: "university-application", deadline: isoDaysFromNow(40, now), institutionId: "i-northfield", expenses: [exp("e1", "Application fee", "registration", 45), exp("e2", "Certified transcript copy", "documentation", 12)], studentFunds: 0, priorAssistance: 0, outcome: "A complete application for a BSc in Data Science.", createdAt: isoDaysFromNow(-2, now) },
  ];
}

export function createSeedState(now = new Date()): AppState {
  const built = REQUESTS.map((s) => build(s, now));
  const requests = built.map((b) => b.req);
  const sponsorFor = (i: number) => (i % 2 ? "sp-harbor" : "sp-community");
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
    pool: 150,
    students: STUDENTS,
    institutions: INSTITUTIONS.map((i) => ({ ...i })),
    opportunities: [...demoOpportunities(now), ...built.map((b) => b.opp)],
    requests,
    resources: RESOURCES.map((r) => ({ ...r })),
    reservations: [],
    contributions,
    distribution,
    notifications: [
      { id: "n1", role: "student", title: "Waiver deadline approaching", body: "A fee waiver that may apply to your certification exam closes in 21 days.", href: "/student/waivers", at: isoDaysFromNow(-1, now), read: false },
      { id: "n2", role: "student", title: "Welcome to BridgeFund", body: "Run BridgeEngine on an opportunity to build your action plan.", href: "/student/engine", at: isoDaysFromNow(-2, now), read: true },
      { id: "n3", role: "sponsor", title: "2 verified needs close within 7 days", body: "Smart Impact Allocation can suggest how to cover them.", href: "/sponsor/allocate", at: isoDaysFromNow(-1, now), read: false },
      { id: "n4", role: "institution", title: "2 requests awaiting verification", body: "New submissions from Recife and Amman.", href: "/institution/requests", at: isoDaysFromNow(-1, now), read: false },
    ],
    activity: [
      { id: "a1", role: "system", text: "Demo environment seeded with fictional data", at: now.toISOString() },
      { id: "a2", role: "student", text: "Amina added Associate Data Analyst Certification exam", at: isoDaysFromNow(-6, now) },
    ],
    savedWaivers: [],
    savedNeeds: [],
    reminders: [],
    scenarios: [],
    milestones: [
      { id: "m1", at: isoDaysFromNow(-60, now), label: "Joined the Northfield data club" },
      { id: "m2", at: isoDaysFromNow(-21, now), label: "Passed the practice certification test" },
      { id: "m3", at: isoDaysFromNow(-6, now), label: "Earned a place on the certification exam register" },
    ],
    profile: { displayName: "Amina Y.", email: "amina.demo@bridgefund.example", emailUpdates: true, deadlineReminders: true },
    payments: requests
      .filter((r) => r.status === "Completed")
      .map((r) => ({ id: `pay-${r.id}`, requestId: r.id, provider: built.find((b) => b.req.id === r.id)!.opp.provider, amount: r.funded, at: r.history[r.history.length - 1].at, reference: `SIM-${r.ref.replace("BF-", "")}-PAY` })),
    pledges: [],
    matches: [],
    programFunds: { ...GRANT_BUDGETS },
    display: { currency: "USD", locale: "en" },
    pilot: { schools: 0, students: 0, requests: 0, resolved: 0, participated: 0, avgDaysToResolve: null, notes: "", updatedAt: null },
    onboarded: false,
    demo: { stage: 0, scanned: false },
  };
}
