import type { Metadata } from "next";
import { Building2, ClipboardCheck, HandCoins, LineChart, Package, UserPlus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageIntro } from "@/components/marketing/PageIntro";
import { PilotDashboard } from "@/components/marketing/PilotDashboard";

export const metadata: Metadata = { title: "Pilot programme" };

const PILLARS = [
  {
    icon: Building2,
    t: "Partner school requirements",
    items: ["A secondary school, college or education nonprofit with a named staff lead", "An existing hardship fund, fee-waiver process or lending cupboard — however small", "Willingness to verify requests within an agreed service time", "A data-sharing and safeguarding agreement approved by the institution"],
  },
  {
    icon: UserPlus,
    t: "Student onboarding",
    items: ["Introduced by school staff, not by advertising", "Informed consent (and guardian consent for minors) before any data is stored", "Students list an opportunity and its exact expenses with staff support if needed", "Requesting help is free, and nobody is charged or offered credit"],
  },
  {
    icon: ClipboardCheck,
    t: "Manual verification",
    items: ["Staff confirm enrolment, the opportunity and each expense before sponsors see a need", "Automated checks only flag issues; a person makes every approval or rejection", "Documents are reviewed and recorded in the audit log", "Payments go to the exam board, provider or vendor — not to the student"],
  },
  {
    icon: Package,
    t: "Lending inventory",
    items: ["Catalogue calculators, laptops, lab kits and uniforms the school can lend", "Track condition, borrower and return date", "Match items to verified needs before any money is requested", "Review unused and over-demanded items at the end of each term"],
  },
  {
    icon: HandCoins,
    t: "Sponsor participation",
    items: ["Recruit a small number of local sponsors, such as alumni, businesses or a foundation", "Sponsors fund verified needs only, and staff approve every allocation", "Sponsors receive receipts once providers are paid", "No sponsor is named publicly without written agreement"],
  },
  {
    icon: LineChart,
    t: "Outcome measurement",
    items: ["Barriers resolved: requests fully funded, and the time it took", "Participation: did the student take part in the opportunity?", "Outcomes: did they complete it, as recorded by the institution?", "Cost reduction share and Impact Multiplier, reported with the method attached"],
  },
];

const TIMELINE = [
  { w: "Weeks 1–4", t: "Partner agreement, consent forms, programme catalogue for the school's country" },
  { w: "Weeks 5–8", t: "Staff training, inventory set-up, first student cohort onboarded" },
  { w: "Weeks 9–20", t: "Live requests through one school term; weekly review of verification times" },
  { w: "Weeks 21–24", t: "Outcome follow-up, independent review of results, decide whether to continue" },
];

export default function PilotPage() {
  return (
    <>
      <PageIntro eyebrow="Pilot" title="One school. One term. Real results.">
        No pilot has run yet. Here&apos;s the plan — and where real results will appear.
      </PageIntro>

      <section className="border-b">
        <div className="container py-14 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How the pilot works</h2>
          <Accordion type="multiple" className="mt-6 max-w-3xl">
            {PILLARS.map((p) => (
              <AccordionItem key={p.t} value={p.t}>
                <AccordionTrigger>
                  <span className="flex items-center gap-3">
                    <p.icon className="h-4 w-4 text-primary" strokeWidth={1.75} /> {p.t}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 pl-7">
                    {p.items.map((x) => (
                      <li key={x} className="list-disc">
                        {x}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="container py-14 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Proposed timeline</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {TIMELINE.map((x) => (
              <li key={x.w} className="rounded-xl border bg-background p-5">
                <p className="text-sm font-semibold text-primary">{x.w}</p>
                <p className="mt-2 text-sm leading-relaxed">{x.t}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
            Success is agreed up front: verification time, share of each gap removed by savings, and how many students took part.
          </p>
        </div>
      </section>

      <section id="dashboard" className="scroll-mt-20">
        <div className="container py-14 md:py-20">
          <PilotDashboard />
        </div>
      </section>
    </>
  );
}
