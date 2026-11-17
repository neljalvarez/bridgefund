"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { WAIVERS } from "@/lib/knowledge";
import { fmtDate, isoDaysFromNow, relDays } from "@/lib/format";
import { PageHeader } from "@/components/ui/primitives";
import { Window } from "@/components/ui/Window";

type Kind = "Opportunity" | "Request" | "Waiver" | "Pickup";
const KIND_STYLE: Record<Kind, string> = {
  Opportunity: "bg-terra text-[#232824]",
  Request: "bg-gold text-[#232824]",
  Waiver: "bg-forest text-onforest",
  Pickup: "bg-sage text-ink",
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function CalendarPage() {
  const { state } = useStore();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(dayKey(today));

  const events = useMemo(() => {
    const sid = state.currentStudentId;
    const list: { id: string; date: Date; kind: Kind; label: string; href: string }[] = [
      ...state.opportunities.filter((o) => o.studentId === sid).map((o) => ({ id: o.id, date: new Date(o.deadline), kind: "Opportunity" as Kind, label: o.title, href: `/student/engine?opp=${o.id}` })),
      ...state.requests.filter((r) => r.studentId === sid && !["Completed", "Declined"].includes(r.status)).map((r) => ({ id: r.id, date: new Date(r.deadline), kind: "Request" as Kind, label: `${r.ref} funding deadline`, href: "/student/requests" })),
      ...state.savedWaivers
        .map((id) => WAIVERS.find((w) => w.id === id))
        .filter(Boolean)
        .map((w) => ({ id: w!.id, date: new Date(isoDaysFromNow(w!.deadlineDays, new Date(state.seededAt))), kind: "Waiver" as Kind, label: `Apply: ${w!.name}`, href: `/student/waivers?w=${w!.id}` })),
      ...state.reservations.filter((r) => r.studentId === sid && r.status === "Reserved").map((r) => ({ id: r.id, date: new Date(r.pickupDate), kind: "Pickup" as Kind, label: `Pick up ${state.resources.find((x) => x.id === r.resourceId)?.name}`, href: "/student/resources" })),
    ];
    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [state]);

  const byDay = useMemo(() => {
    const m = new Map<string, typeof events>();
    events.forEach((e) => m.set(dayKey(e.date), [...(m.get(dayKey(e.date)) ?? []), e]));
    return m;
  }, [events]);

  const first = new Date(cursor);
  const startPad = (first.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((startPad + daysInMonth) / 7) * 7 }, (_, i) => {
    const d = i - startPad + 1;
    return d >= 1 && d <= daysInMonth ? new Date(cursor.getFullYear(), cursor.getMonth(), d) : null;
  });
  const selectedEvents = byDay.get(selected) ?? [];
  const upcoming = events.filter((e) => e.date >= new Date(today.toDateString()));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader kicker="Deadline calendar" title="Never miss a deadline" description="Opportunity deadlines, funding deadlines, saved waivers and equipment pickups — in one place." />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Window
          title={cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          actions={
            <>
              <button type="button" aria-label="Previous month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
                <ChevronLeft size={16} />
              </button>
              <button type="button" className="text-xs underline" onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}>
                Today
              </button>
              <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
                <ChevronRight size={16} />
              </button>
            </>
          }
        >
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted" aria-hidden>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1" role="grid" aria-label="Calendar">
            {cells.map((d, i) => {
              if (!d) return <span key={i} className="aspect-square bg-raised/30" aria-hidden />;
              const k = dayKey(d);
              const evs = byDay.get(k) ?? [];
              const isToday = k === dayKey(today);
              const isSel = k === selected;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(k)}
                  aria-pressed={isSel}
                  aria-label={`${d.toDateString()}${evs.length ? `, ${evs.length} event${evs.length > 1 ? "s" : ""}` : ""}`}
                  className={`flex aspect-square flex-col items-start border-2 p-1 text-left transition-colors ${isSel ? "border-line bg-gold/30" : "border-line/20 bg-bg hover:border-line/60"}`}
                >
                  <span className={`font-pixel text-sm ${isToday ? "bg-forest px-1 text-onforest" : ""}`}>{d.getDate()}</span>
                  <span className="mt-auto flex flex-wrap gap-0.5">
                    {evs.slice(0, 4).map((e) => (
                      <span key={e.id + e.kind} className={`h-2 w-2 border border-line ${KIND_STYLE[e.kind].split(" ")[0]}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <ul className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
            {(Object.keys(KIND_STYLE) as Kind[]).map((k) => (
              <li key={k} className="flex items-center gap-1">
                <span className={`h-2.5 w-2.5 border border-line ${KIND_STYLE[k].split(" ")[0]}`} /> {k}
              </li>
            ))}
          </ul>
        </Window>

        <div className="space-y-6">
          <Window title="Selected day">
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted">Nothing due on this day.</p>
            ) : (
              <ul className="space-y-2">
                {selectedEvents.map((e) => (
                  <li key={e.id + e.kind}>
                    <Link href={e.href} className="flex items-center gap-2 text-sm hover:underline">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase ${KIND_STYLE[e.kind]}`}>{e.kind}</span>
                      {e.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Window>
          <Window title="Agenda">
            <ul className="space-y-2">
              {upcoming.slice(0, 10).map((e) => (
                <li key={e.id + e.kind} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={e.href} className="min-w-0 truncate hover:underline">
                    <span className={`mr-2 px-1.5 py-0.5 text-[10px] font-bold uppercase ${KIND_STYLE[e.kind]}`}>{e.kind}</span>
                    {e.label}
                  </Link>
                  <span className="shrink-0 text-xs text-muted">
                    {fmtDate(e.date.toISOString())} · {relDays(e.date.toISOString())}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Tip: save waivers in the Fee Waiver Finder to add their deadlines here.</p>
          </Window>
        </div>
      </div>
    </div>
  );
}
