"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarDays, Lightbulb, ScanLine, Target, Wand2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { currentStudent, institutionOf, oppOf, studentOverview } from "@/lib/selectors";
import { planFor } from "@/lib/plan";
import { planFindings } from "@/lib/engine";
import { fmtDate, relDays, usd } from "@/lib/format";
import { EmptyState, PageHeader, Stat, StatusBadge } from "@/components/ui/primitives";
import { Window } from "@/components/ui/Window";
import { BridgePanel } from "@/components/student/BridgePanel";
import { QuestCard } from "@/components/student/QuestCard";

const KIND_LABEL: Record<string, string> = { waiver: "Fee waiver", alternative: "Free alternative", discount: "Discount", borrow: "Borrow", grant: "Grant" };

export default function StudentDashboard() {
  const { state } = useStore();
  const student = currentStudent(state);
  const inst = institutionOf(state, student.institutionId);
  const ov = studentOverview(state);
  const sorted = [...ov.active].sort((a, b) => Number(a.unlocked) - Number(b.unlocked) || a.opp.deadline.localeCompare(b.opp.deadline));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = sorted.find((p) => p.opp.id === selectedId) ?? sorted[0];

  const recommendations = useMemo(
    () =>
      ov.active
        .filter((p) => !p.request || p.request.status === "Draft")
        .flatMap((p) => planFindings(planFor(state, p.opp)).map((f) => ({ ...f, opp: p.opp })))
        .slice(0, 5),
    [ov.active, state],
  );

  const deadlines = [
    ...ov.active.map((p) => ({ id: p.opp.id, label: p.opp.title, date: p.opp.deadline, kind: "Opportunity" })),
    ...state.reservations.filter((r) => r.studentId === student.id && r.status === "Reserved").map((r) => ({ id: r.id, label: `Pick up: ${state.resources.find((x) => x.id === r.resourceId)?.name}`, date: r.pickupDate, kind: "Resource" })),
  ]
    .filter((d) => new Date(d.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const infoNeeded = ov.requests.filter((r) => r.infoRequested);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        kicker={`Student · ${inst?.name ?? ""}`}
        title={`${student.firstName}'s quest journal`}
        description={<>Goal: {student.goal}. Every plank on the bridge is part of a barrier you&apos;ve already cleared.</>}
        actions={
          <>
            <Link href="/student/scanner" className="btn-ghost">
              <ScanLine size={16} /> Scan a new barrier
            </Link>
            <Link href="/student/engine" className="btn-primary">
              <Wand2 size={16} /> Run BridgeEngine
            </Link>
          </>
        }
      />

      {infoNeeded.length > 0 && (
        <div className="mb-6 flex flex-col gap-2 border-2 border-line bg-gold/30 p-3 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p className="flex items-center gap-2 text-sm">
            <AlertTriangle size={16} /> Your institution asked for more information on {infoNeeded.map((r) => r.ref).join(", ")}.
          </p>
          <Link href="/student/requests" className="btn-ghost btn-sm">
            Respond <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active opportunities" value={String(ov.active.length)} money={false} icon={<Target size={14} />} />
        <Stat label="Total financial barriers" value={ov.total} />
        <Stat label="Already covered" value={ov.covered} tone="forest" hint="Your funds, reductions & support" />
        <Stat label="Remaining funding gap" value={ov.remaining} tone="terra" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Window title={selected ? `Bridge · ${selected.opp.title}` : "Your bridge"} tone="ink">
            {selected ? <BridgePanel p={selected} /> : <EmptyState title="No active opportunities" body="Scan a barrier to add your first quest." action={<Link className="btn-primary btn-sm" href="/student/scanner">Open scanner</Link>} />}
          </Window>

          <section aria-labelledby="quests">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="quests" className="font-pixel text-xl">
                Active quests
              </h2>
              <Link href="/student/calculator" className="text-xs font-semibold text-forest hover:underline">
                Compare costs →
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {sorted.map((p) => (
                <QuestCard key={p.opp.id} p={p} selected={selected?.opp.id === p.opp.id} onSelect={() => setSelectedId(p.opp.id)} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <Window title="Recommended assistance" icon={<Lightbulb size={14} />}>
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted">All your plans are built. New recommendations appear when you add an opportunity.</p>
            ) : (
              <ul className="space-y-3">
                {recommendations.map((r) => (
                  <li key={`${r.opp.id}-${r.id}`} className="border-l-4 border-gold pl-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {KIND_LABEL[r.kind]} · saves {usd(r.amount)}
                    </p>
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-xs text-muted">For {r.opp.title}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/student/engine" className="btn-ghost btn-sm mt-4 w-full">
              Apply with BridgeEngine
            </Link>
          </Window>

          <Window title="Upcoming deadlines" icon={<CalendarDays size={14} />} actions={<Link href="/student/calendar" className="text-xs underline">Calendar</Link>}>
            <ul className="space-y-2">
              {deadlines.map((d) => (
                <li key={d.id} className="flex items-center gap-3">
                  <span className="flex w-12 shrink-0 flex-col items-center border-2 border-line bg-bg py-0.5">
                    <span className="text-[9px] font-semibold uppercase">{fmtDate(d.date, { month: "short" })}</span>
                    <span className="font-pixel text-lg leading-none">{new Date(d.date).getDate()}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{d.label}</span>
                    <span className="text-xs text-muted">
                      {d.kind} · {relDays(d.date)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Window>

          <Window title="Application status">
            {ov.requests.length === 0 ? (
              <p className="text-sm text-muted">No funding requests yet. BridgeEngine creates one only for what&apos;s left after reductions.</p>
            ) : (
              <ul className="space-y-2">
                {ov.requests.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{oppOf(state, r.opportunityId)?.title ?? r.purpose}</span>
                      <span className="text-xs text-muted">
                        {r.ref} · {usd(r.amount)} requested
                      </span>
                    </span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </Window>

          <Window title="Progress toward goals">
            <ol className="relative space-y-3 border-l-2 border-dashed border-line/50 pl-4">
              {[...state.milestones].reverse().slice(0, 4).map((m) => (
                <li key={m.id} className="relative text-sm">
                  <span className="absolute -left-[1.4rem] top-1 h-3 w-3 border-2 border-line bg-gold" aria-hidden />
                  <span className="font-medium">{m.label}</span>
                  <span className="block text-xs text-muted">{fmtDate(m.at, { month: "short", day: "numeric", year: "numeric" })}</span>
                </li>
              ))}
            </ol>
            <Link href="/student/passport" className="mt-3 inline-block text-xs font-semibold text-forest hover:underline">
              Open opportunity passport →
            </Link>
          </Window>
        </aside>
      </div>
    </div>
  );
}
