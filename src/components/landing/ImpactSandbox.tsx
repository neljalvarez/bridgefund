"use client";

import { useStore } from "@/lib/store";
import { sum } from "@/lib/format";
import { DemoLabel, Stat } from "@/components/ui/primitives";
import { Window } from "@/components/ui/Window";
import { BarChart } from "@/components/ui/charts";

export function ImpactSandbox() {
  const { state } = useStore();
  const completed = state.requests.filter((r) => r.status === "Completed");
  const reduced = sum(state.requests.flatMap((r) => r.reductions.map((x) => x.amount)));
  const sponsored = sum(state.contributions.filter((c) => c.requestId).map((c) => c.amount));
  const reserved = state.reservations.length;
  const verified = state.requests.filter((r) => ["Verified", "Partially Funded", "Fully Funded", "Completed"].includes(r.status)).length;

  const byKind = [
    { label: "Fee waivers", value: sum(state.requests.flatMap((r) => r.reductions.filter((x) => x.kind === "waiver").map((x) => x.amount))) },
    { label: "Free alternatives", value: sum(state.requests.flatMap((r) => r.reductions.filter((x) => x.kind === "alternative").map((x) => x.amount))) },
    { label: "Discounts", value: sum(state.requests.flatMap((r) => r.reductions.filter((x) => x.kind === "discount").map((x) => x.amount))) },
    { label: "Borrowed items", value: sum(state.requests.flatMap((r) => r.reductions.filter((x) => x.kind === "borrow").map((x) => x.amount))) },
    { label: "Grants", value: sum(state.requests.flatMap((r) => r.reductions.filter((x) => x.kind === "grant").map((x) => x.amount))) },
    { label: "Sponsors", value: sponsored },
  ];

  return (
    <section className="border-b-2 border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-terraink">Platform impact dashboard</p>
            <h2 className="mt-1 font-pixel text-3xl md:text-4xl">Live from the demo sandbox</h2>
            <p className="mt-3 text-muted">These numbers update as you use the prototype. They are simulated and do not represent real-world results.</p>
          </div>
          <DemoLabel>Simulated sandbox data</DemoLabel>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Costs removed before fundraising" value={reduced} tone="forest" hint="Waivers, alternatives, discounts, loans, grants" />
          <Stat label="Sponsor funds directed" value={sponsored} tone="terra" />
          <Stat label="Needs verified" value={String(verified)} money={false} hint={`${completed.length} completed`} />
          <Stat label="Items reserved instead of bought" value={String(reserved)} money={false} />
        </div>
        <Window title="Where the gap-closing money came from" className="mt-6" tone="ink">
          <BarChart data={byKind} format="money" />
        </Window>
      </div>
    </section>
  );
}
