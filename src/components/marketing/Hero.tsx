"use client";

import Link from "next/link";
import { ArrowRight, Check, PlayCircle } from "lucide-react";
import { JudgeMode } from "@/components/app/JudgeMode";
import { useT } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function Hero() {
  const tr = useT();
  return (
    <div>
      <h1 className="text-[2.6rem] font-semibold leading-[1.1] tracking-tight sm:text-6xl">
        {tr("Small costs shouldn't stop")} <span className="text-primary">{tr("big futures.")}</span>
      </h1>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">{tr("BridgeFund cuts the cost of an exam, application or trip first — then sponsors cover only what's left.")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
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
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {["Free for students", "No loans", "Verified by schools"].map((x) => (
          <li key={x} className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-primary" /> {tr(x)}
          </li>
        ))}
      </ul>
    </div>
  );
}
