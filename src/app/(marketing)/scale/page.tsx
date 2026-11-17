import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Coins, GraduationCap, Handshake, Languages, ListChecks, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/marketing/PageIntro";
import { CURRENCIES, LAUNCH_MARKET, MARKETS } from "@/lib/regions";
import { WAIVERS } from "@/lib/knowledge";

export const metadata: Metadata = { title: "Global scalability" };

const LAYERS = [
  { icon: Coins, t: "Multiple currencies", b: "Every amount is stored in a base currency with the local currency recorded alongside it. This prototype shows display conversion in Settings; production would settle locally through regulated payment partners." },
  { icon: ListChecks, t: "Country-specific programmes", b: "Each waiver, discount and grant carries the countries, education levels and opportunity types it applies to. BridgeEngine only proposes programmes valid where the student lives." },
  { icon: GraduationCap, t: "Different education systems", b: "Grades, exams and qualification names are configured per market — a KCSE candidate in Kenya and a WASSCE candidate in Ghana are described in their own terms." },
  { icon: Building2, t: "Local eligibility rules", b: "Eligibility signals (income-based support, enrolment, prior aid) are defined per programme, so evidence requirements can differ by country and provider." },
  { icon: Handshake, t: "Regional institutional partners", b: "Schools and nonprofits verify needs and run lending inventories. Expansion follows partner networks rather than direct-to-student marketing." },
  { icon: Languages, t: "Multilingual readiness", b: "Interface text is moving into a message catalogue — navigation already switches between English, French and Spanish previews. Translations would be reviewed locally before launch." },
];

const STEPS = [
  { t: "Map the local rules", b: "With a partner, catalogue the fee waivers, exam subsidies, lending schemes and hardship funds that already exist — and who is eligible for each." },
  { t: "Configure the market", b: "Add the currency, education system, programme rules and verification documents. No assistance rule is copied from another country." },
  { t: "Launch through institutions", b: "Start with a small number of verifying schools or nonprofits, then grow through their networks, district offices and associations." },
  { t: "Add regional sponsors", b: "Invite local businesses, alumni groups and foundations to fund verified needs in their own communities." },
];

export default function ScalePage() {
  const programmes = (country: string) => WAIVERS.filter((w) => w.countries.includes(country)).length;
  const global = WAIVERS.filter((w) => w.countries.includes("Global")).length;
  return (
    <>
      <PageIntro eyebrow="Global scalability" title="Designed to expand one market — and one partner — at a time.">
        Financial assistance works differently in every country. BridgeFund&apos;s architecture keeps money, programmes, eligibility and language configurable per market, so expanding never means assuming that rules are the same everywhere.
      </PageIntro>

      <section className="border-b">
        <div className="container py-14 md:py-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LAYERS.map((l) => (
              <Card key={l.t} className="p-5">
                <l.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium">{l.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{l.b}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="container grid gap-10 py-14 md:py-20 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Badge variant="accent">
              <MapPin /> Proposed launch market
            </Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{LAUNCH_MARKET.country}</h2>
            <p className="mt-3 text-muted-foreground">
              The interactive demo follows Amina, a fictional Grade 12 student in Nairobi. Kenya is the proposed first market because school-related costs are a documented burden on families — UNESCO reports that around 30% of families in Kenya borrow to pay for education (<Link href="/why#evidence" className="text-primary hover:underline">see sources</Link>).
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Education system</dt>
                <dd className="font-medium">{LAUNCH_MARKET.educationSystem}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Languages</dt>
                <dd className="font-medium">{LAUNCH_MARKET.languages.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Proposed partner model</dt>
                <dd className="font-medium">{LAUNCH_MARKET.partnerModel}</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs text-muted-foreground">No partnership in Kenya or elsewhere has been agreed. These are proposals for a future pilot.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-background">
            <table className="w-full min-w-[560px] text-sm">
              <caption className="sr-only">Proposed expansion markets</caption>
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Market
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    Phase
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    Currency
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    Education system
                  </th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">
                    Local demo programmes
                  </th>
                </tr>
              </thead>
              <tbody>
                {MARKETS.map((m) => (
                  <tr key={m.country} className="border-b last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      {m.country}
                    </th>
                    <td className="px-3 py-3">
                      <Badge variant={m.phase === "Launch market" ? "success" : "neutral"}>{m.phase}</Badge>
                    </td>
                    <td className="px-3 py-3 tabular">{m.currency}</td>
                    <td className="px-3 py-3 text-muted-foreground">{m.educationSystem}</td>
                    <td className="px-3 py-3 text-right tabular">{programmes(m.country)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t px-4 py-3 text-xs text-muted-foreground">Plus {global} programmes in the demo knowledge base marked as available globally. Every count reflects fictional demonstration data.</p>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container py-14 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How expansion would work</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="rounded-xl border p-5">
                <span className="text-sm font-semibold text-primary tabular">0{i + 1}</span>
                <p className="mt-2 font-medium">{s.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <div className="container py-14">
          <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">Same $180 exam, shown in each demo currency</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {CURRENCIES.map((c) => `${c.code} ${Math.round(180 * c.rate).toLocaleString("en-US")}`).join(" · ")} — illustrative fixed rates, display only.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/settings">
                Change display currency <ArrowRight />
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </>
  );
}
