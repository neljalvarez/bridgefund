"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import { useStore } from "@/lib/store";
import { fmtDate, sum, usd } from "@/lib/format";
import { EmptyState, PageHeader, Stat, StatusBadge } from "@/components/ui/primitives";
import { Window } from "@/components/ui/Window";

export default function ContributionsPage() {
  const { state } = useStore();
  const mine = state.contributions.filter((c) => c.sponsorName === state.sponsor.name);
  const toNeeds = mine.filter((c) => c.requestId);
  const reqIds = [...new Set(toNeeds.map((c) => c.requestId!))];
  const completed = reqIds.filter((id) => state.requests.find((r) => r.id === id)?.status === "Completed").length;
  const leveraged = sum(reqIds.map((id) => state.requests.find((r) => r.id === id)!).flatMap((r) => r.reductions.map((x) => x.amount)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader kicker="My impact" title="Where your support went" description="Every contribution is tied to a specific, verified educational expense — with a receipt once it's paid." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total contributed" value={sum(mine.map((c) => c.amount))} tone="terra" />
        <Stat label="Needs supported" value={String(reqIds.length)} money={false} />
        <Stat label="Outcomes confirmed" value={String(completed)} money={false} tone="forest" />
        <Stat label="Costs removed alongside you" value={leveraged} hint="Waivers & alternatives on the same needs" />
      </div>

      <Window title="Contribution history" className="mt-6" bodyClassName="p-0">
        {mine.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No contributions yet" body="Support a verified need or use Smart Allocation to spread a budget." action={<Link href="/sponsor" className="btn-primary btn-sm">Browse verified needs</Link>} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-raised/60 text-left text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-2 font-semibold">Date</th>
                  <th className="px-4 py-2 font-semibold">Need</th>
                  <th className="px-4 py-2 text-right font-semibold">Amount</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold">
                    <span className="sr-only">Receipt</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {mine.map((c) => {
                  const r = state.requests.find((x) => x.id === c.requestId);
                  return (
                    <tr key={c.id} className="border-t border-line/20">
                      <td className="px-4 py-2.5 text-muted">{fmtDate(c.at)}</td>
                      <td className="px-4 py-2.5">{r ? `${r.ref} · ${r.purpose}` : "Shared funding pool"}</td>
                      <td className="px-4 py-2.5 text-right font-pixel">{usd(c.amount)}</td>
                      <td className="px-4 py-2.5">{r ? <StatusBadge status={r.status} /> : <span className="chip">Pooled</span>}</td>
                      <td className="px-4 py-2.5 text-right">
                        {r && (
                          <Link href={`/receipt/${c.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline">
                            <Receipt size={12} /> Receipt
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Window>
    </div>
  );
}
