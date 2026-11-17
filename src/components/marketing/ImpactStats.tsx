"use client";

import { Hydrated, useStore } from "@/lib/store";
import { sum } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/kit";

function Stats() {
  const { state } = useStore();
  const reduced = sum(state.requests.flatMap((r) => r.reductions.map((x) => x.amount)));
  const funded = sum(state.contributions.filter((c) => c.requestId).map((c) => c.amount));
  const verified = state.requests.filter((r) => ["Verified", "Partially Funded", "Fully Funded", "Completed"].includes(r.status)).length;
  const completed = state.requests.filter((r) => ["Fully Funded", "Completed"].includes(r.status)).length;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard label="Costs removed before fundraising" value={reduced} tone="primary" hint="Waivers, alternatives, discounts, grants" />
      <StatCard label="Targeted assistance directed" value={funded} />
      <StatCard label="Needs verified by institutions" value={verified} money={false} />
      <StatCard label="Opportunities fully funded" value={completed} money={false} />
    </div>
  );
}

export function ImpactStats() {
  return (
    <Hydrated
      fallback={
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
      }
    >
      <Stats />
    </Hydrated>
  );
}
