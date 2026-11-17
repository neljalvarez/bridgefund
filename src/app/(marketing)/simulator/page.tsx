import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing/PageIntro";
import { RescueSimulator } from "@/components/marketing/RescueSimulator";

export const metadata: Metadata = { title: "Opportunity Rescue Simulator" };

export default function SimulatorPage() {
  return (
    <>
      <PageIntro eyebrow="Opportunity Rescue Simulator" title="What happens when costs are reduced before anyone is asked to give?">
        Adjust the cost of an opportunity and the help available. Compare raising the whole gap through crowdfunding with BridgeFund&apos;s reduce-first approach. Every result is a simulation estimate.
      </PageIntro>
      <div className="container py-10 md:py-14">
        <RescueSimulator />
      </div>
    </>
  );
}
