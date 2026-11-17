import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarClock, Gauge, ScanSearch, Scissors, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/marketing/PageIntro";

export const metadata: Metadata = { title: "Why BridgeFund?" };

const ALTERNATIVES = [
  { name: "Crowdfunding", good: "Fast, open to anyone, transparent fees.", differ: "Asks for the full amount; results depend on the student's network." },
  { name: "Scholarship directories", good: "Great for finding large awards.", differ: "Discovery isn't delivery — and rarely covers an AED 150 competition cost." },
  { name: "Student loans", good: "Can finance big, long-term costs.", differ: "BridgeFund never lends. Debt is too much for a small gap." },
  { name: "Financial literacy apps", good: "Build lasting money skills.", differ: "Skills can't pay a fee due next week." },
  { name: "Emergency funds", good: "Schools know their students; research shows small grants help.", differ: "Often manual, and pay full price for costs that could be waived." },
];

const MATRIX: { capability: string; values: [string, string, string, string, string, string] }[] = [
  { capability: "Identifies the specific expense blocking the student", values: ["Varies", "Not the focus", "Not the focus", "Varies", "Often", "Core"] },
  { capability: "Reduces cost before raising money", values: ["Not the focus", "Not the focus", "Not the focus", "Varies", "Varies", "Core"] },
  { capability: "Deadline-aware matching and prioritisation", values: ["Not the focus", "Varies", "Not the focus", "Not the focus", "Varies", "Core"] },
  { capability: "Institutional verification of need", values: ["Not typically", "Varies", "Credit checks", "Not the focus", "Core", "Core"] },
  { capability: "Payment to the provider, not unrestricted cash", values: ["Not typically", "Varies", "Varies", "Not applicable", "Varies", "Core"] },
  { capability: "Public, per-dollar impact measurement", values: ["Campaign totals", "Not the focus", "Not the focus", "Not applicable", "Varies", "Core"] },
  { capability: "No repayment required", values: ["Yes", "Yes", "No", "Not applicable", "Usually", "Yes"] },
];
const COLS = ["Crowdfunding", "Scholarship directories", "Student loans", "Financial literacy apps", "Emergency assistance", "BridgeFund (proposed)"];

const DIFFERENTIATION = [
  { icon: ScanSearch, t: "Finds the exact barrier", b: "Each expense, itemised." },
  { icon: Scissors, t: "Cuts costs first", b: "Waivers, discounts and borrowing before money." },
  { icon: CalendarClock, t: "Deadline-aware", b: "Only options that arrive in time." },
  { icon: BadgeCheck, t: "School-verified", b: "Every need checked before sponsors see it." },
  { icon: Target, t: "Targeted", b: "Paid to the provider, never as cash." },
  { icon: Gauge, t: "Measurable", b: "Impact per sponsor dollar, published." },
];

const SOURCES = [
  {
    claim: "Demand in the UAE is real: the Emirates Young Scientist Competition 2026 received 2,651 registrations from students in Grades 5–12.",
    source: "GCC Business News, on the 8th NSTI Festival (MoE and ATRC)",
    href: "https://www.gccbusinessnews.com/?p=157194",
  },
  {
    claim: "ADEK expanded its Summer 2026 Work Placement Program to 578 Abu Dhabi high school students, from more than 2,900 applications.",
    source: "Gulf News",
    href: "https://gulfnews.com/uae/adek-expands-summer-work-placements-giving-578-abu-dhabi-students-hands-on-career-experience-1.500653956",
  },
  {
    claim: "Cost help already exists but is scattered: RTA's student nol package offers 50% off RTA public transport; MAKTABA library borrowing in Abu Dhabi is free.",
    source: "RTA; MAKTABA (DCT Abu Dhabi)",
    href: "https://www.rta.ae/wps/portal/rta/ae/home/news-and-media/all-news/NewsDetails/nol-student-package-unveiled-at-gitex-2024",
  },
  {
    claim: "Education costs fall heavily on families in lower-income countries: households bear an estimated 33% of education spending in low-income countries, versus 18% in high-income countries.",
    source: "UNESCO Global Education Monitoring Report 2017/8 — Finance",
    href: "https://gem-report-2017.unesco.org/en/chapter/finance",
  },
  {
    claim: "8% of families in low- and middle-income countries borrow to pay for school; in Kenya, Uganda, Haiti and the Philippines the figure is around 30%.",
    source: "UNESCO GEM Report 2021/2 — World Education Blog summary",
    href: "https://world-education-blog.org/2021/12/14/8-of-families-in-the-poorest-countries-have-to-borrow-money-to-send-their-children-to-school/",
  },
  {
    claim: "Small, fast emergency grants are associated with faster graduation. Georgia State's Panther Retention Grant recipients graduated within three terms at a rate 9 percentage points higher than non-recipients; the authors note limitations.",
    source: "Ithaka S+R (2022), The Impacts of Emergency Micro-Grants on Student Success",
    href: "https://sr.ithaka.org/publications/the-impacts-of-emergency-micro-grants-on-student-success/",
  },
  {
    claim: "Removing exam fees increased exam participation, with the largest effects where predicted financial barriers were highest.",
    source: "EdWorkingPaper 25-1345, Removing Barriers to College Credits: Where and for Whom AP Exam Fee Waivers Work",
    href: "https://edworkingpapers.com/sites/default/files/ai25-1345.pdf",
  },
  {
    claim: "Charitable crowdfunding outcomes reflect existing inequalities: COVID-19 campaigns delivered substantially higher benefits in wealthier, more educated US counties.",
    source: "Igra, Kenworthy et al. (2021), Social Science & Medicine 282",
    href: "https://ideas.repec.org/a/eee/socmed/v282y2021ics0277953621004378.html",
  },
  {
    claim: "Since 2016, classroom crowdfunding requests from high-poverty schools have been less likely to be fully funded than those from low-poverty schools (64% vs 68% in 2019).",
    source: "Chronicle of Philanthropy, reporting a Grantmakers for Education study",
    href: "https://www.philanthropy.com/article/crowdfunding-success-for-schools-shows-deep-disparities-based-on-poverty/",
  },
  {
    claim: "A large crowdfunding platform charges no platform fee in the US but deducts a 2.9% + $0.30 transaction fee from each donation.",
    source: "GoFundMe pricing",
    href: "https://www.gofundme.com/c/pricing",
  },
];

const tone = (v: string) => (v === "Core" || v === "Yes" ? "font-medium text-primary" : v.startsWith("Not") || v === "No" ? "text-muted-foreground" : "");

export default function WhyPage() {
  return (
    <>
      <PageIntro
        eyebrow="Why BridgeFund?"
        title="Built for the small cost in the way"
        actions={
          <>
            <Button asChild>
              <Link href="/simulator">
                Try the rescue simulator <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/demo">Run the demo</Link>
            </Button>
          </>
        }
      >
        Good tools exist. Each solves a different problem. Here&apos;s an honest comparison.
      </PageIntro>

      <section className="border-b">
        <div className="container py-14 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How approaches compare</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ALTERNATIVES.map((a) => (
              <Card key={a.name} className="p-5">
                <h3 className="font-semibold">{a.name}</h3>
                <p className="mt-3 text-xs font-medium text-muted-foreground">Strength</p>
                <p className="mt-1 text-sm leading-relaxed">{a.good}</p>
                <p className="mt-3 text-xs font-medium text-primary">BridgeFund</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.differ}</p>
              </Card>
            ))}
          </div>

          <div className="mt-10 overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[860px] text-sm">
              <caption className="sr-only">Capability comparison</caption>
              <thead>
                <tr className="border-b bg-muted/40 text-start">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Capability
                  </th>
                  {COLS.map((c) => (
                    <th key={c} scope="col" className={`px-3 py-3 font-medium ${c.startsWith("BridgeFund") ? "text-primary" : ""}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row) => (
                  <tr key={row.capability} className="border-b last:border-0">
                    <th scope="row" className="px-4 py-3 text-start font-medium">
                      {row.capability}
                    </th>
                    {row.values.map((v, i) => (
                      <td key={i} className={`px-3 py-3 ${tone(v)} ${i === 5 ? "bg-primary-light/40 dark:bg-primary/10" : ""}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-3xl text-xs text-muted-foreground">
            “Varies” depends on the provider; “Not the focus” means it isn&apos;t what the category is built for. BridgeFund&apos;s column describes the untested prototype.
          </p>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="container py-14 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">What&apos;s different</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATION.map((d) => (
              <div key={d.t} className="flex gap-3 rounded-xl border bg-background p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <d.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium">{d.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="evidence" className="scroll-mt-20">
        <div className="container py-14 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Research and evidence</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Why the problem matters — not proof that BridgeFund works. That&apos;s what the pilot is for.</p>
          <ol className="mt-8 grid gap-3">
            {SOURCES.map((s, i) => (
              <li key={s.href} className="flex gap-4 rounded-xl border p-4">
                <span className="text-sm font-semibold text-muted-foreground tabular">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed">{s.claim}</p>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    {s.source} <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
