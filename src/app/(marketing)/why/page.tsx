import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarClock, Gauge, ScanSearch, Scissors, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/marketing/PageIntro";

export const metadata: Metadata = { title: "Why BridgeFund?" };

const ALTERNATIVES = [
  {
    name: "Traditional crowdfunding",
    good: "Fast to set up, open to anyone, and can mobilise a personal network quickly. Major platforms publish transparent fees.",
    differ: "Campaigns usually ask for the full amount, and research finds outcomes track the strength of the organiser's network. BridgeFund removes cost before asking, and sponsors fund needs an institution has verified.",
  },
  {
    name: "Scholarship directories",
    good: "Help students discover large awards for tuition and living costs, often across many providers.",
    differ: "Directories list opportunities; the student still applies to each and waits for decisions. BridgeFund targets small, specific, deadline-bound costs — an exam fee or a calculator — and applies waivers and loans of equipment automatically.",
  },
  {
    name: "Student loan platforms",
    good: "Can finance large, long-term costs such as tuition when grants are not enough, with regulated terms.",
    differ: "BridgeFund never lends and never charges interest. It is designed for gaps small enough that debt would be disproportionate.",
  },
  {
    name: "Financial literacy apps",
    good: "Build lasting budgeting and saving skills, which help students plan for future costs.",
    differ: "Skills do not close an exam-fee gap due next week. BridgeFund complements literacy tools by resolving the immediate barrier.",
  },
  {
    name: "Conventional emergency assistance",
    good: "Institutions know their students, and well-run emergency grant programmes have measurable benefits (see research below).",
    differ: "Processes are often manual and fund the full cost. BridgeFund gives staff a shared verification workflow, applies reductions first, adds outside sponsors, and reports impact transparently.",
  },
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
  { icon: ScanSearch, t: "Specific barrier identification", b: "The Barrier Scanner breaks an opportunity into its exact expenses — fees, materials, travel — so help is aimed at what is actually missing." },
  { icon: Scissors, t: "Cost reduction before fundraising", b: "BridgeEngine applies waivers, free alternatives, discounts and borrowed equipment first. Sponsors fund only what remains." },
  { icon: CalendarClock, t: "Deadline-aware assistance matching", b: "Options that cannot be processed before the deadline are excluded, and at-risk cases are escalated to staff." },
  { icon: BadgeCheck, t: "Institutional verification", b: "A school or nonprofit confirms enrolment, the opportunity and the expenses before any sponsor sees a need." },
  { icon: Target, t: "Targeted financial support", b: "Money is tied to one verified expense and paid to the provider — never to a general-purpose account." },
  { icon: Gauge, t: "Transparent impact measurement", b: "The Impact Multiplier shows barriers resolved per sponsor dollar, excluding the student's own funds." },
];

const SOURCES = [
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
    claim: "A large crowdfunding platform charges no platform fee in the US but deducts a 2.9% + $0.30 transaction fee from each donation (used as a reference for the simulator's fee assumption).",
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
        title="Built for the small, specific cost that stands between a student and an opportunity."
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
        Many good tools help students pay for education. Each was designed for a different job. Here is an honest look at where they are strong, and where BridgeFund&apos;s proposed approach is different.
      </PageIntro>

      <section className="border-b">
        <div className="container py-14 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How existing approaches compare</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ALTERNATIVES.map((a) => (
              <Card key={a.name} className="p-5">
                <h3 className="font-semibold">{a.name}</h3>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">What it does well</p>
                <p className="mt-1 text-sm leading-relaxed">{a.good}</p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-primary">Where BridgeFund differs</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.differ}</p>
              </Card>
            ))}
          </div>

          <div className="mt-10 overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[860px] text-sm">
              <caption className="sr-only">Capability comparison</caption>
              <thead>
                <tr className="border-b bg-muted/40 text-left">
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
                    <th scope="row" className="px-4 py-3 text-left font-medium">
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
            “Varies” means it depends on the provider or programme; “Not the focus” means it is not what the category is designed for — not that no provider offers it. BridgeFund&apos;s column describes the proposed design shown in this prototype, which has not yet been tested in a pilot.
          </p>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="container py-14 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">BridgeFund&apos;s proposed differentiation</h2>
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
          <p className="mt-3 max-w-2xl text-muted-foreground">External claims on this site link to their sources. These findings motivate the design; they are not evidence that BridgeFund itself works — that is what the pilot is for.</p>
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
