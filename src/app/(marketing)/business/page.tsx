import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Ban, Briefcase, Building2, Check, HandHeart, Landmark, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BusinessSimulator } from "@/components/marketing/BusinessSimulator";

export const metadata: Metadata = { title: "Business model" };

const STREAMS = [
  { icon: Building2, title: "School subscriptions", who: "Schools, colleges, universities", body: "Verification, lending and analytics, priced per student. Free tier for small schools.", value: "Replaces spreadsheets and email chains." },
  { icon: Briefcase, title: "Company partnerships", who: "CSR and skills programmes", body: "Companies fund verified needs and get impact reporting.", value: "Fee paid by the company — never taken from aid." },
  { icon: HandHeart, title: "Sponsored programmes", who: "Foundations and alumni", body: "Ring-fenced programmes, e.g. every exam fee in a district.", value: "Management fee agreed up front." },
  { icon: Landmark, title: "Nonprofit licences", who: "Education charities", body: "Charities use BridgeFund to verify and distribute their own funds.", value: "Discounted or grant-funded." },
];

export default function BusinessPage() {
  return (
    <>
      <section className="border-b">
        <div className="container py-16 md:py-24">
          <p className="text-sm font-medium text-primary">Business model</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Sustainable, and free for students</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Schools and partners pay. Students never do.</p>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "Students never pay", b: "Asking for help is always free." },
              { icon: Ban, t: "No loans or interest", b: "No lending, no hidden fees." },
              { icon: Check, t: "Aid arrives in full", b: "Fees never come out of assistance." },
            ].map((p) => (
              <Card key={p.t} className="flex gap-3 p-5">
                <p.icon className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{p.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.b}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="container py-16 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight">How it earns</h2>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {STREAMS.map((s, i) => (
              <Card key={s.title} className="p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Stream {i + 1}</p>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.who}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed">{s.body}</p>
                <p className="mt-3 border-s-2 border-primary ps-3 text-sm text-muted-foreground">{s.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="simulator" className="scroll-mt-20 border-b">
        <div className="container py-16 md:py-20">
          <p className="text-sm font-medium text-primary">Business model simulator</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Test the assumptions yourself.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Change any assumption. Every figure is hypothetical.</p>
          <div className="mt-10">
            <BusinessSimulator />
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container grid grid-cols-1 gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Why institutions would pay</h2>
            <p className="mt-4 text-muted-foreground">Hardship funds already exist. BridgeFund makes them go further.</p>
          </div>
          <ul className="space-y-3">
            {["One private, consistent verification workflow", "Waivers, free alternatives and equipment lending applied before any money is spent", "Shared equipment tracked and reused across year groups", "Aggregated analytics to plan next year's assistance budget", "Transparent receipts that help attract new sponsors"].map((x) => (
              <li key={x} className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="container py-16">
          <Card className="flex flex-col gap-4 border-dashed p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <Users className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="max-w-2xl text-sm text-muted-foreground">
                <strong className="text-foreground">Prototype.</strong> A proposal — no customers, contracts or partners yet. Pricing would be tested in the pilot.
              </p>
            </div>
            <Button asChild>
              <Link href="/demo">
                See it in action <ArrowRight />
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </>
  );
}
