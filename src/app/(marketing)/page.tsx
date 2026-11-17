import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Building2,
  Check,
  GraduationCap,
  HandCoins,
  Minus,
  Package,
  PieChart,
  PlayCircle,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DemoBadge } from "@/components/shared/kit";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { GapDemo } from "@/components/marketing/GapDemo";
import { ImpactStats } from "@/components/marketing/ImpactStats";

const Section = ({ id, eyebrow, title, intro, children, muted }: { id?: string; eyebrow: string; title: string; intro?: string; children: React.ReactNode; muted?: boolean }) => (
  <section id={id} className={`scroll-mt-20 border-t py-20 md:py-24 ${muted ? "bg-card" : ""}`}>
    <div className="container">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>}
      <div className="mt-12">{children}</div>
    </div>
  </section>
);

const BARRIERS = [
  ["$110", "short on a $180 certification exam", "after the student's own savings"],
  ["$28", "bus fare and mobile data", "to reach a tuition-free coding academy interview"],
  ["$45", "university application fee", "fully waivable — if the student knows to ask"],
  ["$85", "robotics kit", "the school already owns six that can be borrowed"],
];

const STEPS = [
  { icon: ScanSearch, title: "Identify the exact barrier", body: "The Financial Barrier Scanner turns “I can't afford it” into an itemised shortfall, with deadline urgency and every expense category." },
  { icon: Sparkles, title: "Reduce the cost first", body: "BridgeEngine checks fee waivers, free alternatives, discounts, borrowable equipment, institutional help and grants — explaining every recommendation." },
  { icon: HandCoins, title: "Fund only what remains", body: "The student's institution verifies the need privately. Sponsors fund the exact remaining amount, paid directly to the provider." },
];

const CAPABILITIES = [
  { icon: Sparkles, title: "BridgeEngine", body: "Deterministic, explainable gap resolution in seven fixed priorities — with eligibility, documents, timing and deadlines for every recommendation." },
  { icon: ScanSearch, title: "Financial Barrier Scanner", body: "A guided questionnaire that produces a professional barrier report in under a minute." },
  { icon: Ticket, title: "Fee Waiver Finder", body: "Searchable waivers and reductions with a personalised, non-binding eligibility assessment." },
  { icon: Package, title: "Resource Rescue", body: "Borrow calculators, laptops, lab kits and textbooks your schools already own." },
  { icon: PieChart, title: "Smart Impact Allocation", body: "Spread a sponsor budget across urgent verified needs with transparent reasoning." },
  { icon: BarChart3, title: "Barrier analytics", body: "Aggregated insight for institutions — the barriers that recur, and what resolved them." },
];

const AUDIENCES = [
  { id: "students", icon: GraduationCap, title: "For students", points: ["Free to use — always", "See exactly what stands between you and an opportunity", "Discover waivers and free alternatives you didn't know existed", "Private: sponsors never see your circumstances"], cta: ["Find your opportunity", "/signin?role=student"] },
  { id: "sponsors", icon: HandCoins, title: "For sponsors", points: ["Fund verified, specific educational expenses", "Every dollar goes further — costs are reduced first", "An impact planner to compare allocation approaches", "Downloadable impact receipts for every contribution"], cta: ["Explore the marketplace", "/signin?role=sponsor"] },
  { id: "institutions", icon: Building2, title: "For institutions", points: ["One private verification workflow", "Assign waivers and lend equipment in a click", "Allocate funds with full distribution history", "Understand recurring barriers with analytics"], cta: ["Open the institution view", "/signin?role=institution"] },
];

const COMPARE: [string, string | boolean, string | boolean, string | boolean, string | boolean][] = [
  ["Covers small, urgent costs ($20–$200)", false, "Sometimes", false, true],
  ["Reduces the cost before asking for money", false, false, false, true],
  ["Student never repays", true, true, false, true],
  ["Need verified by the student's institution", "Sometimes", false, "Credit check", true],
  ["Private — no public appeal for help", true, false, true, true],
  ["Sponsor sees exactly what was funded", false, "Partially", false, true],
];

const FAQ = [
  ["Is BridgeFund a loan or scholarship provider?", "Neither. BridgeFund never lends money, never charges interest and never charges students. It finds waivers, free alternatives, discounts, borrowable equipment, institutional assistance and grants first, then connects the remaining amount with verified sponsors."],
  ["How does BridgeEngine decide what to recommend?", "It applies deterministic rules against a knowledge base in a fixed order. Every recommendation explains why it matched, the eligibility requirements, expected savings, how to apply, required documents, processing time and deadline. Savings stay labelled “estimated” until the institution confirms them."],
  ["How is double counting prevented?", "Each source can reduce a specific expense only once, every reduction is capped at what's still unpaid on that line, and contributions can never exceed a request's remaining gap. Re-running BridgeEngine replaces earlier estimates rather than adding to them."],
  ["How is student privacy protected?", "Sponsors see the educational goal, verified amount, deadline and expected outcome. Explanations, documents and household circumstances stay with the verifying institution. Analytics are aggregated."],
  ["Does money go to the student?", "No. The verifying institution pays the exam board, university or provider directly and confirms completion, which finalises the sponsor's impact receipt."],
  ["Is any of this real?", "This is a competition prototype. Every student, institution, sponsor, programme and figure is fictional demonstration data, and all transactions are simulated. Final eligibility for any real waiver is always decided by its provider."],
];

const cell = (v: string | boolean) =>
  v === true ? <Check className="mx-auto h-4 w-4 text-primary" aria-label="Yes" /> : v === false ? <X className="mx-auto h-4 w-4 text-muted-foreground/60" aria-label="No" /> : <span className="text-xs text-muted-foreground">{v}</span>;

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" aria-hidden />
        <div className="container grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Small gaps. Big futures.
            </p>
            <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Talent is everywhere. <span className="text-primary">Opportunity should be too.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">BridgeFund removes the financial barriers standing between students and their next educational opportunity.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signin?role=student">
                  Find Your Opportunity <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/demo">
                  <PlayCircle /> Explore Interactive Demo
                </Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Free for students", "No loans, ever", "Institution-verified"].map((x) => (
                <li key={x} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <HeroPreview />
        </div>
      </section>

      <Section id="problem" eyebrow="The problem" title="The barrier is rarely tuition. It's the small, sudden costs." intro="Students who have already earned an opportunity lose it to one fee, one bus ticket or one piece of equipment — amounts too small for traditional scholarships and too large for a tight household budget." muted>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {BARRIERS.map(([v, l, n]) => (
            <Card key={l} className="p-5">
              <p className="text-3xl font-semibold tracking-tight">{v}</p>
              <p className="mt-2 text-sm font-medium">{l}</p>
              <p className="mt-1 text-sm text-muted-foreground">{n}</p>
            </Card>
          ))}
        </div>
        <div className="mt-4">
          <DemoBadge>Illustrative scenarios — not research statistics</DemoBadge>
        </div>
      </Section>

      <Section id="how-it-works" eyebrow="How it works" title="Three steps from barrier to opportunity">
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Interactive demonstration" title="Watch the gap shrink before anyone is asked to pay" intro="Toggle each assistance source. BridgeFund applies them in priority order, so sponsors fund only the genuine remainder." muted>
        <GapDemo />
      </Section>

      <Section eyebrow="Platform" title="Everything needed to close small financial gaps">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <Card key={c.title} className="p-6">
              <c.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <section className="scroll-mt-20 border-t bg-card py-20 md:py-24">
        <div className="container grid gap-6 lg:grid-cols-3">
          {AUDIENCES.map((a) => (
            <Card key={a.id} id={a.id} className="scroll-mt-24 flex flex-col p-7">
              <a.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">{a.title}</h2>
              <ul className="mt-4 flex-1 space-y-2.5 text-sm">
                {a.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {p}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-6">
                <Link href={a.cta[1]}>
                  {a.cta[0]} <ArrowRight />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <Section eyebrow="Why BridgeFund" title="Built for the gaps traditional assistance misses">
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-5 py-4 font-medium text-muted-foreground" scope="col">
                  <span className="sr-only">Criterion</span>
                </th>
                {["Scholarships", "Crowdfunding", "Student loans"].map((h) => (
                  <th key={h} className="px-4 py-4 text-center font-medium text-muted-foreground" scope="col">
                    {h}
                  </th>
                ))}
                <th className="bg-primary-light/50 px-4 py-4 text-center font-semibold text-primary" scope="col">
                  BridgeFund
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([label, ...vals]) => (
                <tr key={label as string} className="border-b last:border-0">
                  <th scope="row" className="px-5 py-3.5 text-left font-normal">
                    {label}
                  </th>
                  {vals.map((v, i) => (
                    <td key={i} className={`px-4 py-3.5 text-center ${i === 3 ? "bg-primary-light/50" : ""}`}>
                      {cell(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section eyebrow="Sustainable business model" title="Students never pay. Institutions and partners do." muted>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Institutional subscriptions", "Verification, inventory and analytics software for schools and universities."],
            ["CSR partnerships", "Companies fund verified, outcome-linked needs with transparent reporting."],
            ["Sponsored programmes", "Ring-fenced funds managed for foundations and alumni groups."],
            ["Nonprofit licensing", "Discounted licences for education charities using BridgeFund to distribute aid."],
          ].map(([t, b]) => (
            <Card key={t} className="p-5">
              <p className="font-semibold">{t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{b}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/business">
              Read the business model <ArrowRight />
            </Link>
          </Button>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Minus className="h-4 w-4" /> No loans, interest or predatory mechanisms — ever.
          </p>
        </div>
      </Section>

      <Section id="impact" eyebrow="Our impact" title="Demonstration impact" intro="These figures come from the simulated demo environment and update as you use the prototype. BridgeFund has not yet operated with real students, and no real-world impact is claimed.">
        <ImpactStats />
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <DemoBadge>Simulated demonstration data</DemoBadge>
          <Link href="/impact" className="text-sm font-medium text-primary hover:underline">
            Full impact dashboard →
          </Link>
          <Link href="/simulator" className="text-sm font-medium text-primary hover:underline">
            Opportunity Rescue Simulator →
          </Link>
          <Link href="/why" className="text-sm font-medium text-primary hover:underline">
            Why BridgeFund? →
          </Link>
        </div>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Questions we hear most" muted>
        <Accordion type="single" collapsible defaultValue="0" className="max-w-3xl">
          {FAQ.map(([q, a], i) => (
            <AccordionItem key={q} value={String(i)}>
              <AccordionTrigger>{q}</AccordionTrigger>
              <AccordionContent>{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <section className="border-t py-20">
        <div className="container">
          <div className="flex flex-col items-start gap-6 rounded-2xl bg-primary-dark p-8 text-white md:flex-row md:items-center md:justify-between md:p-12 dark:bg-primary-light dark:text-foreground">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">See the full journey in two minutes.</h2>
              <p className="mt-2 max-w-xl text-white/75 dark:text-muted-foreground">Student, institution and sponsor — one interactive walkthrough, from a $110 gap to an opportunity secured.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-primary-dark hover:bg-white/90 dark:bg-primary dark:text-primary-foreground">
                <Link href="/demo">
                  <PlayCircle /> Launch Interactive Demo
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10 dark:text-foreground">
                <Link href="/signin?start=1">
                  Get started <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Private by design
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-primary" /> Institution-verified
            </span>
            <span className="flex items-center gap-1.5">
              <HandCoins className="h-4 w-4 text-primary" /> Paid directly to providers
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
