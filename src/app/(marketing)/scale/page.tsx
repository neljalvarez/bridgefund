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
  { icon: Coins, t: "Local currencies", b: "Stored with each amount; settled by local payment partners." },
  { icon: ListChecks, t: "Country programmes", b: "Each waiver and grant knows where it applies." },
  { icon: GraduationCap, t: "Education systems", b: "Grades and exams named the local way." },
  { icon: Building2, t: "Local eligibility", b: "Evidence rules set per programme." },
  { icon: Handshake, t: "School partners", b: "Growth through school and nonprofit networks." },
  { icon: Languages, t: "Multilingual", b: "Navigation already previews French and Spanish." },
];

const STEPS = [
  { t: "Map local help", b: "List existing waivers, subsidies and funds with a partner." },
  { t: "Configure", b: "Currency, programmes, documents. Nothing copied." },
  { t: "Launch with schools", b: "Start small, grow through their networks." },
  { t: "Add local sponsors", b: "Businesses, alumni and foundations nearby." },
];

export default function ScalePage() {
  const programmes = (country: string) => WAIVERS.filter((w) => w.countries.includes(country)).length;
  const global = WAIVERS.filter((w) => w.countries.includes("Global")).length;
  return (
    <>
      <PageIntro eyebrow="Global plan" title="One market, one partner at a time">
        Every country has its own rules. Money, programmes, eligibility and language are set per market.
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
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How we expand</h2>
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
