"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CalendarClock, PieChart } from "lucide-react";
import { useStore } from "@/lib/store";
import { remainingOf, updateReservation } from "@/lib/actions";
import { institutionOf, studentOf } from "@/lib/selectors";
import { RESOURCE_TYPE_LABEL, daysUntil, fmtDate, relDays, sum, usd } from "@/lib/format";
import { EmptyState, PageHeader, Stat, Tabs } from "@/components/ui/primitives";
import { Window } from "@/components/ui/Window";
import { ReviewCard } from "@/components/institution/ReviewCard";

type Tab = "queue" | "approved" | "inventory" | "history";

function Desk() {
  const { state, dispatch } = useStore();
  const params = useSearchParams();
  const focus = params.get("focus");
  const focused = state.requests.find((r) => r.id === focus);
  const [inst, setInst] = useState("all");
  const [tab, setTab] = useState<Tab>(focused && !["Submitted", "Under Review"].includes(focused.status) ? "approved" : "queue");

  const inScope = state.requests.filter((r) => inst === "all" || studentOf(state, r.studentId)?.institutionId === inst);
  const queue = inScope.filter((r) => ["Submitted", "Under Review"].includes(r.status)).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const approved = inScope.filter((r) => ["Verified", "Partially Funded", "Fully Funded"].includes(r.status)).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const unresolved = inScope.filter((r) => !["Completed", "Declined", "Draft"].includes(r.status));
  const upcoming = unresolved.filter((r) => daysUntil(r.deadline) >= 0 && daysUntil(r.deadline) <= 21).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const resources = state.resources.filter((r) => r.type !== "free-resource" && (inst === "all" || r.institutionId === inst));

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 border-2 border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="inst" className="text-xs font-semibold uppercase tracking-wider text-muted">
            Institution
          </label>
          <select id="inst" className="input w-auto py-1" value={inst} onChange={(e) => setInst(e.target.value)}>
            <option value="all">All partner institutions (demo network)</option>
            {state.institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} · {i.country}
              </option>
            ))}
          </select>
        </div>
        <Link href="/institution/heatmap" className="btn-ghost btn-sm">
          <PieChart size={14} /> Barrier heatmap
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Pending requests" value={String(queue.length)} money={false} tone="terra" />
        <Stat label="Assistance fund" value={state.institutionFunds} tone="forest" hint="Simulated institution budget" />
        <Stat label="Shared sponsor pool" value={state.pool} />
        <Stat label="Approved requests" value={String(approved.length)} money={false} />
        <Stat label="Unresolved barriers" value={sum(unresolved.map(remainingOf))} hint={`${unresolved.length} open requests`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div>
          <Tabs<Tab>
            label="Institution sections"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: "queue", label: "Verification queue", count: queue.length },
              { id: "approved", label: "Approved & funding", count: approved.length },
              { id: "inventory", label: "Resource inventory", count: resources.length },
              { id: "history", label: "Distribution history" },
            ]}
          />
          <div className="mt-4 space-y-3" role="tabpanel">
            {tab === "queue" &&
              (queue.length === 0 ? (
                <EmptyState title="Verification queue is clear" body="New student requests will appear here." />
              ) : (
                queue.map((r, i) => <ReviewCard key={r.id} r={r} highlight={focus === r.id} defaultOpen={i === 0} />)
              ))}
            {tab === "approved" && (approved.length === 0 ? <EmptyState title="No approved requests in progress" /> : approved.map((r) => <ReviewCard key={r.id} r={r} highlight={focus === r.id} />))}
            {tab === "inventory" && (
              <div className="space-y-4">
                <div className="panel overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="bg-raised/60 text-left text-[11px] uppercase tracking-wider text-muted">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Held by</th>
                        <th className="px-3 py-2 text-right">Available</th>
                        <th className="px-3 py-2 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((r) => (
                        <tr key={r.id} className="border-t border-line/20">
                          <td className="px-3 py-2 font-medium">{r.name}</td>
                          <td className="px-3 py-2 text-muted">{RESOURCE_TYPE_LABEL[r.type]}</td>
                          <td className="px-3 py-2 text-muted">{institutionOf(state, r.institutionId)?.name}</td>
                          <td className={`px-3 py-2 text-right font-pixel ${r.available === 0 ? "text-terraink" : ""}`}>
                            {r.available}/{r.total}
                          </td>
                          <td className="px-3 py-2 text-right">{usd(r.retailValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Window title="Active reservations">
                  {state.reservations.length === 0 ? (
                    <p className="text-sm text-muted">No reservations yet.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {state.reservations.map((rv) => {
                        const res = state.resources.find((x) => x.id === rv.resourceId);
                        const st = studentOf(state, rv.studentId);
                        return (
                          <li key={rv.id} className="flex flex-wrap items-center justify-between gap-2">
                            <span>
                              {res?.name} → {st?.firstName} · pickup {fmtDate(rv.pickupDate)} · <strong>{rv.status}</strong>
                            </span>
                            <span className="flex gap-1.5">
                              {rv.status === "Reserved" && (
                                <button type="button" className="btn-ghost btn-sm" onClick={() => dispatch(updateReservation(rv.id, "Collected"))}>
                                  Collected
                                </button>
                              )}
                              {rv.status === "Collected" && (
                                <button type="button" className="btn-ghost btn-sm" onClick={() => dispatch(updateReservation(rv.id, "Returned"))}>
                                  Returned
                                </button>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Window>
              </div>
            )}
            {tab === "history" && (
              <div className="panel">
                <ul className="divide-y divide-line/20">
                  {state.distribution.slice(0, 40).map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <span className="min-w-0">
                        <span className={`mr-2 px-1.5 py-0.5 text-[10px] font-bold uppercase ${d.kind === "completion" ? "bg-ink text-bg" : d.kind === "waiver" ? "bg-gold text-[#232824]" : d.kind === "resource" ? "bg-sage" : "bg-terra text-[#232824]"}`}>{d.kind}</span>
                        {d.label}
                        {d.requestRef && <span className="text-muted"> · {d.requestRef}</span>}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="font-pixel">{usd(d.amount)}</span>
                        <span className="block text-[10px] text-muted">{fmtDate(d.at)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <Window title="Upcoming deadlines" icon={<CalendarClock size={14} />}>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted">No unresolved deadlines in the next 3 weeks.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((r) => (
                  <li key={r.id} className="text-sm">
                    <button
                      type="button"
                      className="w-full text-left hover:underline"
                      onClick={() => {
                        setTab(["Submitted", "Under Review"].includes(r.status) ? "queue" : "approved");
                        setTimeout(() => document.getElementById(`req-${r.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
                      }}
                    >
                      <span className="font-medium">{r.ref}</span> · {usd(remainingOf(r))}
                      <span className="block text-xs text-muted">
                        {r.status} · {relDays(r.deadline)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Window>
          <div className="panel-flat bg-sage/40 p-3 text-xs">
            Institutional staff retain final approval authority. Sponsor contributions are disbursed to providers only after you confirm completion.
          </div>
        </aside>
      </div>
    </>
  );
}

export default function InstitutionPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader kicker="Institution · Verification desk" title="Verify, reduce, distribute" description="Review student requests privately, assign waivers and equipment, allocate funds, and confirm when assistance has been paid to the provider." />
      <Suspense>
        <Desk />
      </Suspense>
    </div>
  );
}
