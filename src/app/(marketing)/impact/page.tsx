import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/marketing/PageIntro";
import { ImpactDashboard } from "@/components/marketing/ImpactDashboard";

export const metadata: Metadata = { title: "Social impact dashboard" };

export default function ImpactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Social impact dashboard"
        title="Transparent impact, measured in three separate steps."
        actions={
          <>
            <Button asChild>
              <Link href="/pilot">See the pilot plan</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/demo">Run the demo</Link>
            </Button>
          </>
        }
      >
        BridgeFund reports the cost barriers it resolves, whether the student then took part, and whether the opportunity was completed — and never mixes them up. The figures below are fictional demonstration data.
      </PageIntro>
      <div className="container py-10 md:py-14">
        <ImpactDashboard />
      </div>
    </>
  );
}
