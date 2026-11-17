"use client";

import { ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { remainingOf } from "@/lib/actions";
import { oppOf, studentOf } from "@/lib/selectors";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABEL, OPP_CATEGORY_LABEL, daysUntil, sum, usd } from "@/lib/format";
import { DemoLabel, PageHeader, Stat } from "@/components/ui/primitives";
import { Window } from "@/components/ui/Window";
import { BarChart, HeatGrid, StackedBar } from "@/components/ui/charts";

export default function HeatmapPage() {
  const { state } = useStore();
  const reqs = state.requests.filter((r) => r.status !== "Draft");
  const expenses = reqs.flatMap((r) => r.expenses.map((e) => ({ ...e, country: studentOf(state, r.studentId)?.country ?? "" })));
  const countries = [...new Set(expenses.map((e) => e.country))].sort();

  const freq = EXPENSE_CATEGORIES.map((c) => ({ label: EXPENSE_CATEGORY_LABEL[c], value: expenses.filter((e) => e.category === c).length })).sort((a, b) => b.value - a.value);
  const initialGaps = reqs.map((r) => Math.max(r.totalCost - r.studentFunds, 0));
  const finalAsks = reqs.map((r) => r.amount);
  const avgInitial = initialGaps.length ? sum(initialGaps) / initialGaps.length : 0;
  const avgFinal = finalAsks.length ? sum(finalAsks) / finalAsks.length : 0;

  const weeks = Array.from({ length: 6 }, (_, i) => {
    const inWeek = reqs.filter((r) => !["Completed", "Declined"].includes(r.status) && Math.floor(daysUntil(r.deadline) / 7) === i && daysUntil(r.deadline) >= 0);
    return { label: i === 0 ? "This week" : `Week ${i + 1}`, value: sum(inWeek.map(remainingOf)), hint: `${inWeek.length} requests` };
  });

  const red = (k: string) => sum(reqs.flatMap((r) => r.reductions.filter((x) => x.kind === k).map((x) => x.amount)));
  const contrib = (src: string) => sum(state.contributions.filter((c) => c.requestId && c.source === src).map((c) => c.amount));
  const distribution = [
    { label: "Student funds", value: sum(reqs.map((r) => r.studentFunds)), color: "#294C3D" },
    { label: "Fee waivers", value: red("waiver"), color: "#D8AA55" },
    { label: "Alternatives", value: red("alternative"), color: "#E6DDBF" },
    { label: "Discounts", value: red("discount"), color: "#8C6A3C" },
    { label: "Borrowed", value: red("borrow"), color: "#BCC9B6" },
    { label: "Grants", value: red("grant"), color: "#5C635A" },
    { label: "Sponsors", value: contrib("sponsor"), color: "#C97052" },
    { label: "Pool & institution", value: contrib("pool") + contrib("institution"), color: "#8C4A33" },
  ];

  const unresolvedByStatus = ["Submitted", "Under Review", "Verified", "Partially Funded", "Fully Funded"].map((s) => ({ label: s, value: reqs.filter((r) => r.status === s).length }));
  const supported = Object.entries(OPP_CATEGORY_LABEL)
    .map(([k, v]) => ({ label: v, value: reqs.filter((r) => oppOf(state, r.opportunityId)?.category === k && ["Fully Funded", "Completed"].includes(r.status)).length }))
    .filter((x) => x.value > 0);
  const unresolvedTotal = sum(reqs.filter((r) => !["Completed", "Declined"].includes(r.status)).map(remainingOf));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        kicker="Financial barrier heatmap"
        title="What's stopping students — in aggregate"
        description="Patterns across the partner network, so institutions can budget for the barriers that recur. No individual student's circumstances are shown."
        actions={<DemoLabel>Aggregated demo data</DemoLabel>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Average gap before BridgeEngine" value={avgInitial} />
        <Stat label="Average sponsor ask after" value={avgFinal} tone="forest" hint={avgInitial ? `${Math.round((1 - avgFinal / avgInitial) * 100)}% smaller` : undefined} />
        <Stat label="Unresolved financial barriers" value={unresolvedTotal} tone="terra" />
        <Stat label="Requests analysed" value={String(reqs.length)} money={false} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Window title="Barrier heatmap · expense type × country" tone="ink" className="lg:col-span-2">
          <HeatGrid rows={EXPENSE_CATEGORIES.map((c) => EXPENSE_CATEGORY_LABEL[c])} cols={countries} value={(row, col) => expenses.filter((e) => EXPENSE_CATEGORY_LABEL[e.category] === row && e.country === col).length} />
          <p className="mt-2 text-xs text-muted">Cell value = number of expense items of that type in requests from that country. Darker = more frequent.</p>
        </Window>
        <Window title="Most frequent expense categories">
          <BarChart data={freq} />
        </Window>
        <Window title="Upcoming financial deadlines (remaining $)">
          <BarChart data={weeks} format="money" color="#C97052" />
        </Window>
        <Window title="Assistance distribution — where the money came from" className="lg:col-span-2">
          <StackedBar parts={distribution} />
        </Window>
        <Window title="Unresolved requests by stage">
          <BarChart data={unresolvedByStatus} color="#D8AA55" />
        </Window>
        <Window title="Educational opportunities supported">
          {supported.length ? <BarChart data={supported} color="#294C3D" /> : <p className="text-sm text-muted">None fully funded yet.</p>}
        </Window>
      </div>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted">
        <ShieldCheck size={14} /> Aggregates only. Reasons, documents and household information never appear in analytics. Total gap tracked: {usd(sum(initialGaps))}.
      </p>
    </div>
  );
}
