import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DemoBadge } from "@/components/shared/kit";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { Hero } from "@/components/marketing/Hero";
import { GapDemo } from "@/components/marketing/GapDemo";
import { BridgeSpans, Lattice, SectionMark } from "@/components/shared/Motifs";

const STEPS = [
  { title: "Find the gap", body: "List the costs. See exactly what's missing." },
  { title: "Cut the cost", body: "Waivers, discounts and borrowed equipment come first." },
  { title: "Fund the rest", body: "The school verifies it. Sponsors cover only what's left." },
];

const SPANS = [
  { key: "own", label: "Her savings", value: 150, tone: "text-stone" },
  { key: "kit", label: "Borrowed kit", value: 200, tone: "text-sage-deep" },
  { key: "school", label: "School support", value: 100, tone: "text-sage" },
  { key: "sponsor", label: "Sponsor", value: 150, tone: "text-primary" },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b">
        {/* lattice screen behind the product sheet, like light through a mashrabiya */}
        <div className="absolute inset-y-0 end-0 hidden w-[44%] border-s text-border/80 lg:block" aria-hidden>
          <Lattice />
        </div>
        <div className="container relative grid grid-cols-1 items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr]">
          <Hero />
          <div className="lg:ps-10">
            <HeroPreview />
          </div>
        </div>
      </section>

      <section className="border-b py-16 md:py-24">
        <div className="container">
          <SectionMark n="01">The idea</SectionMark>
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <h2 className="text-[2.1rem] leading-[1.1] md:text-5xl">
              A gap is a span. <em className="text-primary">Bridge it</em> in sections.
            </h2>
            <div>
              <BridgeSpans spans={SPANS} total={600} />
              <p className="mt-6 max-w-xl text-muted-foreground">
                Mariam&apos;s AED 600 competition cost, drawn as a bridge. Each arch is one source of money, sized to its amount. Sponsors carry one span — not the whole crossing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-b py-16 md:py-24">
        <div className="container">
          <SectionMark n="02">How it works</SectionMark>
          <ol className="mt-10 grid grid-cols-1 border-t md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-b py-8 md:border-b-0 md:border-e md:px-8 md:first:ps-0 md:last:border-e-0">
                <p className="tabular text-sm text-primary">0{i + 1}</p>
                <h3 className="mt-4 text-[1.75rem] leading-tight">{s.title}</h3>
                <p className="mt-3 max-w-xs text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b bg-card py-16 md:py-24">
        <div className="container">
          <SectionMark n="03">Try it</SectionMark>
          <div className="mb-10 mt-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[2.1rem] leading-[1.1] md:text-5xl">Switch savings on. Watch the ask shrink.</h2>
          </div>
          <GapDemo />
        </div>
      </section>

      <section id="impact" className="scroll-mt-20 py-16 md:py-24">
        <div className="container">
          <SectionMark n="04">Impact</SectionMark>
          <h2 className="mt-8 max-w-3xl text-[2.1rem] leading-[1.1] md:text-5xl">Every sponsor dirham goes further.</h2>
          <dl className="mt-12 grid grid-cols-1 border-t sm:grid-cols-3">
            {[
              { v: "AED 150", l: "asked, not AED 450", s: "for Mariam's STEM competition" },
              { v: "3.00x", l: "impact multiplier", s: "barriers resolved per sponsor dirham" },
              { v: "3×", l: "more students", s: "from the same AED 1,000 budget" },
            ].map((x) => (
              <div key={x.l} className="border-b py-8 sm:border-b-0 sm:border-e sm:px-8 sm:first:ps-0 sm:last:border-e-0">
                <dt className="sr-only">{x.l}</dt>
                <dd className="tabular text-5xl font-medium text-primary md:text-6xl">{x.v}</dd>
                <dd className="mt-4 font-medium">{x.l}</dd>
                <dd className="mt-1 text-sm text-muted-foreground">{x.s}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
            <DemoBadge>Simulated example with fictional data</DemoBadge>
            <Link href="/impact" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
              Explore the impact dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
