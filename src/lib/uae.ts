/**
 * UAE launch-market data.
 *
 * OPPORTUNITIES and ASSISTANCE list REAL programmes, checked against official
 * pages (and reputable news coverage where the official page was unavailable)
 * on 17 November 2026. BridgeFund is NOT affiliated with or endorsed by any of
 * these organisations. Fees, dates or amounts the organiser has not published
 * are shown as "Not published" — never estimated. Always confirm on the
 * official link before applying.
 */
import type { OpportunityCategory } from "./types";

export const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"] as const;
export type Emirate = (typeof EMIRATES)[number];

export const EMIRATE_AR: Record<Emirate, string> = {
  "Abu Dhabi": "أبوظبي",
  Dubai: "دبي",
  Sharjah: "الشارقة",
  Ajman: "عجمان",
  "Umm Al Quwain": "أم القيوين",
  "Ras Al Khaimah": "رأس الخيمة",
  Fujairah: "الفجيرة",
};

export const VERIFIED_ON = "2026-11-17";

export type OppStatus = "Open" | "Upcoming" | "Closed";

export interface UaeOpportunity {
  id: string;
  name: string;
  organiser: string;
  category: OpportunityCategory;
  location: string;
  emirates: Emirate[] | "All";
  eligibility: string[];
  /** Official dates. `deadline` null = not yet announced. */
  opens: string | null;
  deadline: string | null;
  dateNote: string;
  /** Costs as published by the organiser; null = not published. */
  publishedFees: string | null;
  /** Typical cost categories a student should plan for (no amounts). */
  planFor: string[];
  url: string;
  sources: string[];
}

export const OPPORTUNITIES: UaeOpportunity[] = [
  {
    id: "op-eysc",
    name: "Emirates Young Scientist Competition 2026",
    organiser: "UAE Ministry of Education with ATRC",
    category: "science-fair",
    location: "Finals at the NSTI Festival, ADNEC Centre Al Ain",
    emirates: "All",
    eligibility: ["Grades 5–12 at UAE schools or recognised science/youth clubs", "Teams of 2–3 from the same school", "At least one UAE national student per team", "Registered by a supervising teacher"],
    opens: "2026-05-21",
    deadline: "2026-09-20",
    dateNote: "Application phase 21 May – 20 Sep 2026; finals 10–13 Nov 2026",
    publishedFees: null,
    planFor: ["Project materials", "Transport to Al Ain", "Display printing"],
    url: "https://challengeon.atrc.ae/en/challenges/eysc2026",
    sources: ["https://challengeon.atrc.ae/en/challenges/eysc2026/pages/faq?lang=en", "https://www.gccbusinessnews.com/?p=157194"],
  },
  {
    id: "op-jic",
    name: "Junior Innovators Challenge 2026",
    organiser: "ATRC with the UAE Ministry of Education",
    category: "stem-competition",
    location: "Part of the NSTI Festival",
    emirates: "All",
    eligibility: ["KG 1 to Grade 4 in academic year 2026–27", "Enrolled in a government or private UAE school", "Nominated by the school; signed parent/guardian consent"],
    opens: "2026-05-21",
    deadline: "2026-09-15",
    dateNote: "School nomination 21 May – 15 Sep 2026 (TBC)",
    publishedFees: null,
    planFor: ["Materials", "Transport"],
    url: "https://challengeon.atrc.ae/en/challenges/jic2026",
    sources: ["https://challengeon.atrc.ae/en/challenges/jic2026/agreements?lang=en"],
  },
  {
    id: "op-atp",
    name: "Advanced Technology Pioneers 2026",
    organiser: "ATRC with the UAE Ministry of Education",
    category: "entrepreneurship",
    location: "UAE (Demo Day, November 2026)",
    emirates: "All",
    eligibility: ["University students and recent graduates", "One challenge statement per team", "Declaration required if under 18"],
    opens: "2026-09-10",
    deadline: "2026-10-11",
    dateNote: "Applications closed 11 Oct 2026",
    publishedFees: null,
    planFor: ["Prototype materials", "Transport to Demo Day"],
    url: "https://challengeon.atrc.ae/en/challenges/atp2026",
    sources: ["https://challengeon.atrc.ae/en/challenges/atp2026/pages/faq?lang=en", "https://en.aletihad.ae/news/business/4691007/launched-by-advanced-technology-research-council-and-uae-min"],
  },
  {
    id: "op-erc",
    name: "Emirates Robotics Competition (4th edition)",
    organiser: "Dubai Future Labs with RIT Dubai, Khalifa University, AUS and Mohammed Bin Rashid Library",
    category: "robotics",
    location: "Finals during Dubai Future Week, Dubai",
    emirates: ["Dubai"],
    eligibility: ["Undergraduate students at UAE universities only"],
    opens: "2026-05-21",
    deadline: "2026-05-31",
    dateNote: "Registration 21–31 May 2026; finals 18–21 Nov 2026",
    publishedFees: null,
    planFor: ["Transport to trials and finals"],
    url: "https://www.rit.edu/dubai/emirates-robotics-competition",
    sources: ["https://www.dubaifuture.ae/latest-news/emirates-robotics-competition-opens-registration-for-fourth-edition/", "https://www.wam.ae/en/article/c2zjl84-university-teams-compete-emirates-robotic"],
  },
  {
    id: "op-ftc",
    name: "FIRST Tech Challenge — UAE season",
    organiser: "firstrobotics.ae community (FIRST programme)",
    category: "robotics",
    location: "UAE events (2025–26 championship held in Dubai)",
    emirates: "All",
    eligibility: ["School robotics teams — see the official site for age and team rules"],
    opens: null,
    deadline: null,
    dateNote: "2026–27 UAE dates not yet published; last UAE championship 2–3 May 2026",
    publishedFees: "Season registration fee set by FIRST — check the official site",
    planFor: ["Robot parts and tools", "Event travel"],
    url: "https://firstrobotics.ae/",
    sources: ["https://ftc-events.firstinspires.org/2025/AECMP", "https://www.firstinspires.org/frc-get-started"],
  },
  {
    id: "op-young-trader",
    name: "Young Trader Programme (2nd edition)",
    organiser: "UAE Ministry of Education",
    category: "entrepreneurship",
    location: "Schools nationwide; national exhibition",
    emirates: "All",
    eligibility: ["Grades 1–12", "Government and private UAE schools", "Register through your school"],
    opens: null,
    deadline: "2026-10-15",
    dateNote: "Registration closed 15 Oct 2026",
    publishedFees: null,
    planFor: ["Product materials", "Exhibition transport"],
    url: "https://mena.entrepreneur.com/business-news/ministry-of-education-opens-registration-for-young-trader-program",
    sources: ["https://mena.entrepreneur.com/business-news/ministry-of-education-opens-registration-for-young-trader-program"],
  },
  {
    id: "op-aus-admission",
    name: "American University of Sharjah — Fall 2027 admission",
    organiser: "American University of Sharjah",
    category: "university-application",
    location: "Sharjah",
    emirates: ["Sharjah"],
    eligibility: ["Secondary school applicants (final year)", "Considered for merit scholarships and need-based grants"],
    opens: null,
    deadline: "2027-04-01",
    dateNote: "Fall 2027 application deadline 1 Apr 2027",
    publishedFees: "See the AUS admissions site",
    planFor: ["Document attestation", "Transport to campus"],
    url: "https://www.aus.edu/admissions/financial-grants-and-scholarships",
    sources: ["https://www.aus.edu/admissions/financial-grants-and-scholarships"],
  },
  {
    id: "op-nyuad",
    name: "NYU Abu Dhabi — undergraduate admission",
    organiser: "NYU Abu Dhabi",
    category: "university-application",
    location: "Saadiyat Island, Abu Dhabi",
    emirates: ["Abu Dhabi"],
    eligibility: ["Undergraduate applicants of any citizenship", "Need-based aid via the CSS Profile"],
    opens: null,
    deadline: null,
    dateNote: "Deadlines on the official admissions site",
    publishedFees: null,
    planFor: ["Test and document costs"],
    url: "https://nyuad.nyu.edu/en/apply/undergraduate/scholarships-and-financial-aid.html",
    sources: ["https://nyuad.nyu.edu/en/admissions/undergraduate/financial-support.html"],
  },
  {
    id: "op-adek-placement",
    name: "ADEK Work Placement Program",
    organiser: "Abu Dhabi Department of Education and Knowledge",
    category: "internship",
    location: "Workplaces across Abu Dhabi",
    emirates: ["Abu Dhabi"],
    eligibility: ["Abu Dhabi high school students", "1–2 week supervised placements during school breaks"],
    opens: null,
    deadline: null,
    dateNote: "Summer 2026 cycle complete; next cycle not yet announced",
    publishedFees: null,
    planFor: ["Daily transport", "Work-appropriate clothing"],
    url: "https://gulfnews.com/uae/adek-expands-summer-work-placements-giving-578-abu-dhabi-students-hands-on-career-experience-1.500653956",
    sources: ["https://gulfnews.com/uae/adek-expands-summer-work-placements-giving-578-abu-dhabi-students-hands-on-career-experience-1.500653956"],
  },
  {
    id: "op-rta-ajyal",
    name: "RTA Ajyal Summer Internship Programme",
    organiser: "Roads and Transport Authority, Dubai",
    category: "internship",
    location: "Dubai",
    emirates: ["Dubai"],
    eligibility: ["Emirati secondary school and university students"],
    opens: null,
    deadline: null,
    dateNote: "2026 applications opened 24 Jun 2026; next cycle not yet announced",
    publishedFees: null,
    planFor: ["Daily transport"],
    url: "https://www.rta.ae/wps/portal/rta/ae/home/news-and-media/all-news/NewsDetails/ajyal-summer-internship-programme-opens-future-opportunities-for-emirati-students",
    sources: ["https://www.wam.ae/en/article/c0vxk1z-rta-opens-applications-for-2026-ajyal-summer"],
  },
  {
    id: "op-mbzuai-nextgen",
    name: "MBZUAI NextGen Summer Program",
    organiser: "Mohamed bin Zayed University of Artificial Intelligence",
    category: "workshop",
    location: "MBZUAI campus, Abu Dhabi",
    emirates: ["Abu Dhabi"],
    eligibility: ["High school students in Grades 10–12", "Competitive selection"],
    opens: null,
    deadline: null,
    dateNote: "Week-long summer programme; next dates not yet announced",
    publishedFees: null,
    planFor: ["Transport to campus", "Laptop access"],
    url: "https://www.mediaoffice.abudhabi/en/education/mohamed-bin-zayed-university-of-artificial-intelligence-nextgen-summer-program-empowers-future-generations-of-advanced-technology-leaders/",
    sources: ["https://www.middleeastainews.com/p/mbzuai-launches-youth-ai-skills-programme"],
  },
  {
    id: "op-hospitality-camp",
    name: "UAE Hospitality Summer Camp",
    organiser: "UAE Ministry of Economy and tourism partners",
    category: "certification",
    location: "Hotels and tourism partners across the UAE",
    emirates: "All",
    eligibility: ["Ages 15–22", "High school seniors and university students", "UAE nationals and UAE-based students", "Certificate on successful completion"],
    opens: null,
    deadline: null,
    dateNote: "Next edition not yet announced",
    publishedFees: null,
    planFor: ["Daily transport"],
    url: "https://www.moet.gov.ae/en/uae-hospitality-summer-camp-2025",
    sources: ["https://www.moet.gov.ae/en/uae-hospitality-summer-camp-2025"],
  },
];

export function oppStatus(o: UaeOpportunity, today = new Date()): OppStatus {
  const t = today.toISOString().slice(0, 10);
  if (o.deadline && o.deadline < t) return "Closed";
  if (o.deadline && (!o.opens || o.opens <= t)) return "Open";
  return "Upcoming";
}

export interface AssistanceProgramme {
  id: string;
  name: string;
  provider: string;
  emirates: Emirate[] | "All";
  helpsWith: string;
  benefit: string;
  cost: string;
  eligibility: string[];
  apply: string;
  url: string;
  sources: string[];
}

export const ASSISTANCE: AssistanceProgramme[] = [
  {
    id: "as-nol",
    name: "Student nol card",
    provider: "Roads and Transport Authority (RTA), Dubai",
    emirates: ["Dubai"],
    helpsWith: "Transport",
    benefit: "50% off RTA metro, tram and bus fares",
    cost: "AED 70 (AED 50 fee + AED 20 credit); valid one year, renewable",
    eligibility: ["Students aged 5–23 at UAE schools or universities", "School letter, Emirates ID or passport, photo"],
    apply: "Apply online through the RTA website or app.",
    url: "https://www.rta.ae/wps/portal/rta/ae/home/rta-services/service-details?serviceId=634",
    sources: ["https://gulfnews.com/living-in-uae/transport/are-you-a-student-heres-how-you-can-get-a-50-per-cent-discount-on-public-transportation-in-dubai-1.1644241503665", "https://www.rta.ae/wps/portal/rta/ae/home/news-and-media/all-news/NewsDetails/nol-student-package-unveiled-at-gitex-2024"],
  },
  {
    id: "as-hafilat",
    name: "Hafilat student annual permit",
    provider: "Abu Dhabi Mobility (Integrated Transport Centre)",
    emirates: ["Abu Dhabi"],
    helpsWith: "Transport",
    benefit: "Unlimited bus travel in Abu Dhabi city, Al Ain and Al Dhafra for a year (not intercity)",
    cost: "AED 500 per year — worth it for regular riders, not one-off trips",
    eligibility: ["Students with a personalised Hafilat card"],
    apply: "Apply via Abu Dhabi Mobility or at a bus station customer centre.",
    url: "https://admobility.gov.ae/en/pb-bus-service/hafilat-personalized-passes",
    sources: ["https://admobility.gov.ae/en/news/standardizes-tariffs-for-public-bus-services", "https://gulfnews.com/living-in-uae/transport/how-students-in-abu-dhabi-can-save-on-public-transport-with-an-annual-permit-1.500031442"],
  },
  {
    id: "as-maktaba",
    name: "MAKTABA public libraries",
    provider: "Department of Culture and Tourism – Abu Dhabi",
    emirates: ["Abu Dhabi"],
    helpsWith: "Books and study materials",
    benefit: "Free membership: borrow books and use eBooks, audiobooks and study spaces",
    cost: "Free (borrowing membership is a free upgrade)",
    eligibility: ["Register online with an Emirates ID"],
    apply: "Create an account on the MAKTABA site, then upgrade to borrowing membership.",
    url: "https://library.dctabudhabi.ae/",
    sources: ["https://www.propertyfinder.ae/blog/how-to-get-a-library-card/", "https://library.dctabudhabi.ae/services"],
  },
  {
    id: "as-nyuad",
    name: "NYU Abu Dhabi financial aid",
    provider: "NYU Abu Dhabi",
    emirates: ["Abu Dhabi"],
    helpsWith: "University costs",
    benefit: "Need-based aid based on demonstrated need; a scholarship track for Emirati students",
    cost: "Free to apply for aid (CSS Profile)",
    eligibility: ["NYUAD undergraduate applicants of any citizenship", "Submit the CSS Profile by the aid deadline"],
    apply: "File the CSS Profile with your NYUAD application.",
    url: "https://nyuad.nyu.edu/en/apply/undergraduate/scholarships-and-financial-aid.html",
    sources: ["https://nyuad.nyu.edu/en/admissions/undergraduate/financial-support.html", "https://nyuad.nyu.edu/en/admissions/financial-support.html"],
  },
  {
    id: "as-adu",
    name: "Abu Dhabi University financial aid",
    provider: "Abu Dhabi University",
    emirates: ["Abu Dhabi"],
    helpsWith: "University costs",
    benefit: "Sanabil–Qutoof need-based aid, scholarships and tuition reductions",
    cost: "Free to apply",
    eligibility: ["ADU undergraduate students (aid level set by a needs assessment)"],
    apply: "Book an appointment with the ADU Scholarships & Financial Aid office.",
    url: "https://www.adu.ac.ae/en/study/financials/financial-aid",
    sources: ["https://adu.ac.ae/study/financials/financial-aid", "https://www.adu.ac.ae/about-adu/our-profile1/frequently-asked-questions/financial-aid-and-scholarship"],
  },
  {
    id: "as-aus",
    name: "AUS financial grants and scholarships",
    provider: "American University of Sharjah",
    emirates: ["Sharjah"],
    helpsWith: "University costs",
    benefit: "Need-based financial grants and merit scholarships; amount depends on need and academic record",
    cost: "Free to apply",
    eligibility: ["Full-time students who demonstrate financial need", "Final-year school applicants can be considered for merit scholarships"],
    apply: "Apply through the AUS Office of Financial Grants and Scholarships.",
    url: "https://www.aus.edu/admissions/financial-grants-and-scholarships",
    sources: ["https://www.aus.edu/admissions/financial-grants-and-scholarships", "https://reports.aashe.org/institutions/3388/report/2021-05-06/PA/diversity-affordability/PA-7"],
  },
];

/** Deterministic, non-reversible public reference for a student (shown to sponsors instead of names). */
export function anonId(studentId: string) {
  let h = 2166136261;
  for (const c of studentId) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const code = (h >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-4);
  return `Student ${code}`;
}
