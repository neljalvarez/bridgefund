import Link from "next/link";
import { HandCoins, ScanSearch, Scissors } from "lucide-react";
import { DemoBadge } from "@/components/shared/kit";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { Hero } from "@/components/marketing/Hero";
import { GapDemo } from "@/components/marketing/GapDemo";

const STEPS = [
  { icon: ScanSearch, title: "Find the gap", body: "List the costs. See exactly what's missing." },
  { icon: Scissors, title: "Cut the cost", body: "Waivers, discounts and borrowed equipment come first." },
  { icon: HandCoins, title: "Fund the rest", body: "The school verifies it. Sponsors cover only what's left." },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" aria-hidden />
        <div className="container grid grid-cols-1 items-center gap-12 py-16 md:py-28 lg:grid-cols-[1.1fr_1fr]">
          <Hero />
          <HeroPreview />
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-t py-20 md:py-24">
        <div className="container">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">How it works</h2>
          <ol className="mx-auto mt-14 grid grid-cols-1 max-w-5xl gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border bg-card text-primary">
                  <s.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="mt-5 text-sm font-medium text-muted-foreground">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t bg-card py-20 md:py-24">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Try it</h2>
            <p className="mt-3 text-muted-foreground">Switch savings on and watch the sponsor ask shrink.</p>
          </div>
          <div className="mx-auto max-w-5xl">
            <GapDemo />
          </div>
        </div>
      </section>

      <section id="impact" className="scroll-mt-20 border-t py-20 md:py-24">
        <div className="container">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Every sponsor dirham goes further</h2>
          <dl className="mx-auto mt-14 grid grid-cols-1 max-w-4xl gap-10 text-center sm:grid-cols-3">
            {[
              { v: "AED 150", l: "asked, not AED 450", s: "for Mariam's STEM competition" },
              { v: "3.00x", l: "impact multiplier", s: "barriers resolved per sponsor dirham" },
              { v: "3x", l: "more students", s: "from the same AED 1,000 budget" },
            ].map((x) => (
              <div key={x.l}>
                <dt className="sr-only">{x.l}</dt>
                <dd className="text-5xl font-semibold tracking-tight text-primary tabular">{x.v}</dd>
                <dd className="mt-2 font-medium">{x.l}</dd>
                <dd className="text-sm text-muted-foreground">{x.s}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-12 flex flex-col items-center gap-4">
            <DemoBadge>Simulated example with fictional data</DemoBadge>
            <Link href="/impact" className="text-sm font-medium text-primary hover:underline">
              Explore the impact dashboard →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
