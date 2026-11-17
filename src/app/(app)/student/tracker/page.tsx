"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, BellOff, ChevronLeft, ChevronRight, FileCheck2, FileX2, Flag, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { addMilestone, toggleReminder } from "@/lib/actions";
import { studentOverview } from "@/lib/selectors";
import { WAIVERS } from "@/lib/knowledge";
import { fmtDate, isoDaysFromNow, relDays, usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, StatCard, StatusBadge } from "@/components/shared/kit";

type Kind = "Opportunity" | "Funding" | "Waiver" | "Pickup";
const DOT: Record<Kind, string> = { Opportunity: "bg-primary", Funding: "bg-amber-500", Waiver: "bg-sky-500", Pickup: "bg-slate-400" };
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function TrackerPage() {
  const { state, dispatch } = useStore();
  const ov = studentOverview(state);
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(key(today));
  const [milestone, setMilestone] = useState("");

  const events = useMemo(() => {
    const sid = state.currentStudentId;
    return [
      ...ov.all.map((p) => ({ id: `o-${p.opp.id}`, date: p.opp.deadline, kind: "Opportunity" as Kind, label: p.opp.title, href: `/student/engine?opp=${p.opp.id}` })),
      ...ov.requests.filter((r) => !["Completed", "Rejected", "Fully Funded"].includes(r.status)).map((r) => ({ id: `r-${r.id}`, date: r.deadline, kind: "Funding" as Kind, label: `${r.ref} funding deadline`, href: "/student/requests" })),
      ...state.savedWaivers.map((id) => WAIVERS.find((w) => w.id === id)!).filter(Boolean).map((w) => ({ id: `w-${w.id}`, date: isoDaysFromNow(w.deadlineDays, new Date(state.seededAt)), kind: "Waiver" as Kind, label: `Apply: ${w.name}`, href: `/student/waivers?w=${w.id}` })),
      ...state.reservations.filter((r) => r.studentId === sid && r.status === "Reserved").map((r) => ({ id: `p-${r.id}`, date: r.pickupDate, kind: "Pickup" as Kind, label: `Collect ${state.resources.find((x) => x.id === r.resourceId)?.name}`, href: "/student/resources" })),
    ].sort((a, b) => a.date.localeCompare(b.date));
  }, [state, ov]);

  const byDay = useMemo(() => {
    const m = new Map<string, typeof events>();
    events.forEach((e) => m.set(key(new Date(e.date)), [...(m.get(key(new Date(e.date))) ?? []), e]));
    return m;
  }, [events]);

  const pad = (new Date(cursor).getDay() + 6) % 7;
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((pad + days) / 7) * 7 }, (_, i) => (i - pad + 1 >= 1 && i - pad + 1 <= days ? new Date(cursor.getFullYear(), cursor.getMonth(), i - pad + 1) : null));
  const upcoming = events.filter((e) => new Date(e.date) >= new Date(today.toDateString()));
  const completed = ov.all.filter((p) => p.request?.status === "Completed" || p.secured);
  const pending = ov.requests.filter((r) => ["Draft", "Submitted", "Under Review", "Additional Information Required", "Verified", "Partially Funded"].includes(r.status));
  const docs = ov.requests.filter((r) => !["Completed", "Rejected"].includes(r.status)).flatMap((r) => r.documents.map((d) => ({ ...d, ref: r.ref })));

  const EventRow = ({ e }: { e: (typeof events)[number] }) => {
    const on = state.reminders.includes(e.id);
    return (
      <li className="flex items-center gap-3 py-2">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[e.kind])} />
        <Link href={e.href} className="min-w-0 flex-1 hover:underline">
          <span className="block truncate text-sm">{e.label}</span>
          <span className="text-xs text-muted-foreground">
            {e.kind} · {fmtDate(e.date)} · {relDays(e.date)}
          </span>
        </Link>
        <Button variant={on ? "soft" : "ghost"} size="icon" className="h-8 w-8" aria-pressed={on} aria-label={on ? `Turn off reminder for ${e.label}` : `Remind me about ${e.label}`} onClick={() => dispatch(toggleReminder(e.id, e.label), on ? { info: "Reminder removed" } : { success: "Reminder set", description: "You'll be notified 3 days before." })}>
          {on ? <Bell /> : <BellOff />}
        </Button>
      </li>
    );
  };

  return (
    <>
      <PageHeader title="Opportunity tracker" description="Every opportunity, deadline, document and milestone on your educational journey — with reminders so nothing slips." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Upcoming opportunities" value={ov.active.length} money={false} />
        <StatCard label="Completed" value={completed.length} money={false} />
        <StatCard label="Pending applications" value={pending.length} money={false} />
        <StatCard label="Assistance received" value={ov.assistance} />
        <StatCard label="Money saved" value={ov.savings + state.reservations.filter((r) => r.studentId === state.currentStudentId && r.status !== "Cancelled").reduce((a, r) => a + (state.resources.find((x) => x.id === r.resourceId)?.retailValue ?? 0), 0)} tone="primary" hint="Savings plus borrowed equipment" />
      </div>

      <Tabs defaultValue="calendar" className="mt-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">Opportunities</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
                    <ChevronLeft />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(key(today)); }}>
                    Today
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
                    <ChevronRight />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 text-center text-xs text-muted-foreground" aria-hidden>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <span key={d} className="pb-2">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((d, i) => {
                    if (!d) return <span key={i} />;
                    const k = key(d);
                    const evs = byDay.get(k) ?? [];
                    const isToday = k === key(today);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelected(k)}
                        aria-pressed={selected === k}
                        aria-label={`${d.toDateString()}${evs.length ? `, ${evs.length} event${evs.length > 1 ? "s" : ""}` : ""}`}
                        className={cn("flex aspect-square flex-col items-center justify-between rounded-lg border p-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", selected === k ? "border-primary bg-primary-light/60" : "border-transparent hover:bg-muted")}
                      >
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[13px] tabular", isToday && "bg-primary text-primary-foreground")}>{d.getDate()}</span>
                        <span className="flex gap-0.5">
                          {evs.slice(0, 3).map((e) => (
                            <span key={e.id} className={cn("h-1.5 w-1.5 rounded-full", DOT[e.kind])} />
                          ))}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {(Object.keys(DOT) as Kind[]).map((k) => (
                    <span key={k} className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", DOT[k])} /> {k === "Funding" ? "Financial deadline" : k}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Selected day</CardTitle>
                </CardHeader>
                <CardContent>
                  {(byDay.get(selected) ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Nothing due on this day.</p> : <ul className="divide-y">{(byDay.get(selected) ?? []).map((e) => <EventRow key={e.id} e={e} />)}</ul>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming deadlines and reminders</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y">{upcoming.slice(0, 8).map((e) => <EventRow key={e.id} e={e} />)}</ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="list">
          <Card>
            <ul className="divide-y">
              {ov.all.map((p) => (
                <li key={p.opp.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{p.opp.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {fmtDate(p.opp.deadline)} · {usd(p.covered)} of {usd(p.total)} covered
                    </p>
                  </div>
                  {p.request ? <StatusBadge status={p.request.status} /> : <Badge variant="neutral">Not started</Badge>}
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documents required</CardTitle>
          </CardHeader>
          <CardContent>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents outstanding.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {docs.map((d, i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      {d.attached ? <FileCheck2 className="h-4 w-4 text-primary" /> : <FileX2 className="h-4 w-4 text-warning" />} {d.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {d.ref} · {d.attached ? "Provided" : "Needed"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Personal milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-3 border-l pl-5">
              {[...state.milestones].reverse().map((m) => (
                <li key={m.id} className="relative text-sm">
                  <Flag className="absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full bg-card text-primary" />
                  {m.label}
                  <span className="block text-xs text-muted-foreground">{fmtDate(m.at, { month: "short", day: "numeric", year: "numeric" })}</span>
                </li>
              ))}
            </ol>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (milestone.trim().length < 3) return;
                dispatch(addMilestone(milestone.trim()), { success: "Milestone added" });
                setMilestone("");
              }}
            >
              <Input aria-label="New milestone" placeholder="e.g. Submitted my university application" value={milestone} onChange={(e) => setMilestone(e.target.value)} />
              <Button type="submit" variant="outline" disabled={milestone.trim().length < 3}>
                <Plus /> Add
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
