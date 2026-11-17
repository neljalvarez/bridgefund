import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Ban, Briefcase, Building2, Check, HandHeart, Landmark, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BusinessSimulator } from "@/components/marketing/BusinessSimulator";

export const metadata: Metadata = { title: "Business model" };

const STREAMS = [
  { icon: Building2, title: "Institutional software subscriptions", who: "Schools, universities, colleges", body: "The verification workflow, lending inventory, assistance-fund ledger and barrier analytics, priced by enrolled students. A free tier keeps small and under-resourced schools on the platform.", value: "Replaces spreadsheets and email chains for hardship funds, and shows which barriers to budget for next year." },
  { icon: Briefcase, title: "Corporate social responsibility partnerships", who: "Companies with education or skills goals", body: "Companies fund verified, outcome-linked needs — an exam sat, an internship started — and receive impact receipts and aggregated reporting.", value: "A platform fee on CSR programmes covers verification and reporting. It is never deducted from a student's assistance." },
  { icon: HandHeart, title: "Sponsored educational assistance programmes", who: "Foundations, alumni associations, local businesses", body: "Ring-fenced programmes — for example, every certification exam fee in one district — run through BridgeFund with transparent allocation.", value: "A programme management fee agreed with the sponsor up front." },
  { icon: Landmark, title: "Nonprofit licensing partnerships", who: "Education charities and community organisations", body: "Nonprofits license BridgeFund as their verification and distribution layer, bringing their own funds and local trust.", value: "Discounted or grant-funded licences, plus shared aggregated insight on recurring barriers." },
];

export default function BusinessPage() {
  return (
    <>
      <section className="border-b">
        <div className="container py-16 md:py-24">
          <p className="text-sm font-medium text-primary">Sustainable business model</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Sustainable without ever charging a student.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">BridgeFund earns from the institutions and partners who already spend money on student hardship — by making that money go further and proving where it went.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "Students never pay", b: "Requesting essential financial assistance is always free." },
              { icon: Ban, t: "No loans or interest", b: "No lending, deferred repayment, hidden fees or predatory mechanisms." },
              { icon: Check, t: "Assistance reaches providers in full", b: "Platform fees are charged to institutions and programmes, never taken from aid." },
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
          <h2 className="text-3xl font-semibold tracking-tight">Proposed revenue streams</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
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
                <p className="mt-3 border-l-2 border-primary pl-3 text-sm text-muted-foreground">{s.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="simulator" className="scroll-mt-20 border-b">
        <div className="container py-16 md:py-20">
          <p className="text-sm font-medium text-primary">Business model simulator</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Test the assumptions yourself.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Change any input to see recurring revenue, costs, profit and break-even under three growth scenarios. Every value is a hypothetical projection for discussion, not a forecast.</p>
          <div className="mt-10">
            <BusinessSimulator />
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Why institutions would pay</h2>
            <p className="mt-4 text-muted-foreground">Hardship funds already exist — but they pay full price for costs that could have been waived, and rarely know which barriers recur.</p>
          </div>
          <ul className="space-y-3">
            {["One private, consistent verification workflow", "Waivers, alternatives and loans applied before any money is spent", "Shared equipment tracked and reused across year groups", "Aggregated analytics to plan next year's assistance budget", "Transparent receipts that help attract new sponsors"].map((x) => (
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
                <strong className="text-foreground">A note on status.</strong> BridgeFund is a competition prototype. This model is a proposal — not a description of existing customers, contracts or partnerships. Pricing and pilot partners would be validated with schools and nonprofits before launch.
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
