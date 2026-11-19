"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useT } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { JudgeMode } from "@/components/app/JudgeMode";

export function Hero() {
  const tr = useT();
  return (
    <div>
      <p className="eyebrow flex items-center gap-3 text-muted-foreground">
        <span className="text-primary">UAE</span> {tr("Education access · Abu Dhabi first")}
      </p>
      <h1 className="mt-6 text-[2.9rem] font-normal leading-[1.02] tracking-[-0.02em] sm:text-[4.25rem]">
        {tr("Small costs shouldn't stop")} <em className="font-normal text-primary">{tr("big futures.")}</em>
      </h1>
      <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">{tr("BridgeFund cuts the cost of an exam, application or trip first — then sponsors cover only what's left.")}</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/demo">
            <PlayCircle /> {tr("Watch the 90-second demo")}
          </Link>
        </Button>
        <JudgeMode>
          <Button size="lg" variant="outline">
            {tr("Explore freely")} <ArrowRight />
          </Button>
        </JudgeMode>
      </div>
      <dl className="mt-12 grid max-w-lg grid-cols-3 border-t text-sm">
        {[
          ["Free", "Free for students"],
          ["0%", "No loans"],
          ["100%", "Verified by schools"],
        ].map(([v, l]) => (
          <div key={l} className="border-e py-4 pe-4 last:border-e-0 [&:not(:first-child)]:ps-4">
            <dt className="tabular text-base font-medium text-foreground">{tr(v)}</dt>
            <dd className="mt-0.5 text-muted-foreground">{tr(l)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
