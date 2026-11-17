import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing/PageIntro";
import { RescueSimulator } from "@/components/marketing/RescueSimulator";

export const metadata: Metadata = { title: "Opportunity Rescue Simulator" };

export default function SimulatorPage() {
  return (
    <>
      <PageIntro eyebrow="Rescue simulator" title="Crowdfunding vs. cutting costs first">
        Move the sliders. See how far a sponsor budget goes.
      </PageIntro>
      <div className="container py-10 md:py-14">
        <RescueSimulator />
      </div>
    </>
  );
}
