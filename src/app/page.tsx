import { Hero } from "@/components/landing/Hero";
import { BarrierExamples } from "@/components/landing/BarrierExamples";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { FeaturedNeeds } from "@/components/landing/FeaturedNeeds";
import { ImpactSandbox } from "@/components/landing/ImpactSandbox";
import { Partners } from "@/components/landing/Partners";
import { Faq } from "@/components/landing/Faq";
import { ClosingCta } from "@/components/landing/ClosingCta";

export default function Home() {
  return (
    <>
      <Hero />
      <BarrierExamples />
      <HowItWorks />
      <BeforeAfter />
      <FeaturedNeeds />
      <ImpactSandbox />
      <Partners />
      <Faq />
      <ClosingCta />
    </>
  );
}
