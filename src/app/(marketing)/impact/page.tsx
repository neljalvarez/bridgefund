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
        eyebrow="Impact"
        title="Impact, measured honestly"
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
        Costs resolved, students who took part, and outcomes — counted separately. Demo data only.
      </PageIntro>
      <div className="container py-10 md:py-14">
        <ImpactDashboard />
      </div>
    </>
  );
}
