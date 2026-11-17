"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { verifiedNeeds } from "@/lib/selectors";
import { NeedCard } from "@/components/sponsor/NeedCard";
import { DemoLabel } from "@/components/ui/primitives";

export function FeaturedNeeds() {
  const { state } = useStore();
  // Freeze the selection on mount so cards don't disappear mid-contribution.
  const [ids] = useState(() =>
    verifiedNeeds(state)
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 3)
      .map((r) => r.id),
  );
  const needs = ids.map((id) => state.requests.find((r) => r.id === id)!).filter(Boolean);
  return (
    <section className="border-b-2 border-line">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-terraink">Featured opportunities</p>
            <h2 className="mt-1 font-pixel text-3xl md:text-4xl">Verified needs, closing soon</h2>
            <p className="mt-3 text-muted">Sponsors see the educational goal and the exact remaining gap — never a student&apos;s personal financial details.</p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <DemoLabel>Fictional students</DemoLabel>
            <Link href="/sponsor" className="btn-ghost btn-sm">
              See all verified needs <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {needs.map((r) => (
            <NeedCard key={r.id} request={r} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
