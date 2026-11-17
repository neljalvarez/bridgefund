"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { currentStudent, institutionOf, studentOverview } from "@/lib/selectors";
import { fmtDate, relDays, sum, usd } from "@/lib/format";
import { PageHeader } from "@/components/ui/primitives";
import { PixelSprite, type SpriteName } from "@/components/pixel/PixelSprite";
import { Window } from "@/components/ui/Window";

interface Achievement {
  id: string;
  title: string;
  desc: string;
  sprite: SpriteName;
  earned: boolean;
  color: string;
}

export default function PassportPage() {
  const { state } = useStore();
  const s = currentStudent(state);
  const inst = institutionOf(state, s.institutionId);
  const ov = studentOverview(state);
  const mineReq = ov.requests;
  const reservations = state.reservations.filter((r) => r.studentId === s.id);
  const borrowed = sum(reservations.map((r) => state.resources.find((x) => x.id === r.resourceId)?.retailValue ?? 0));
  const resolved = ov.opps.filter((p) => p.unlocked);
  const moneySaved = sum(mineReq.flatMap((r) => r.reductions.filter((x) => x.kind !== "borrow").map((x) => x.amount))) + borrowed;
  const assistance = sum(mineReq.map((r) => r.funded));

  const achievements: Achievement[] = [
    { id: "a1", title: "First quest", desc: "Added an opportunity to the journal", sprite: "flag", earned: ov.opps.length > 0, color: "#294C3D" },
    { id: "a2", title: "Cartographer", desc: "Mapped a new barrier with the scanner", sprite: "scroll", earned: ov.opps.some((p) => p.opp.createdAt > state.seededAt), color: "#8C6A3C" },
    { id: "a3", title: "Plan builder", desc: "Turned a BridgeEngine plan into action", sprite: "key", earned: mineReq.length > 0, color: "#D8AA55" },
    { id: "a4", title: "Waiver wise", desc: "Secured a fee waiver or discount", sprite: "star", earned: mineReq.some((r) => r.reductions.some((x) => ["waiver", "discount"].includes(x.kind))), color: "#C97052" },
    { id: "a5", title: "Borrow champion", desc: "Borrowed equipment instead of buying", sprite: "chest", earned: reservations.length > 0, color: "#294C3D" },
    { id: "a6", title: "Verified", desc: "Request verified by your institution", sprite: "heart", earned: mineReq.some((r) => ["Verified", "Partially Funded", "Fully Funded", "Completed"].includes(r.status)), color: "#C97052" },
    { id: "a7", title: "Opportunity unlocked", desc: "Closed a financial gap completely", sprite: "student", earned: resolved.length > 0, color: "#294C3D" },
    { id: "a8", title: "Deadline keeper", desc: "Saved a waiver deadline to the calendar", sprite: "coin", earned: state.savedWaivers.length > 0, color: "#D8AA55" },
  ];
  const earned = achievements.filter((a) => a.earned).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader kicker="Opportunity passport" title="Where your education has taken you" description="Stamps recognise progress you made — never hardship and never the amount of help received." />

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="panel overflow-hidden bg-forest text-onforest">
          <div className="border-b-2 border-line p-5 text-center">
            <p className="font-pixel text-xs uppercase tracking-[0.3em] opacity-80">Opportunity passport</p>
            <div className="mx-auto mt-4 flex h-28 w-24 items-center justify-center border-2 border-line bg-bg">
              <PixelSprite name="student" scale={6} />
            </div>
            <p className="mt-3 font-pixel text-2xl">{s.firstName}</p>
            <p className="text-sm opacity-80">
              {s.grade} · {inst?.name}
            </p>
            <p className="text-xs opacity-70">
              {s.city}, {s.country}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-px bg-line/40 text-center">
            {[
              ["Opportunities pursued", String(ov.opps.length)],
              ["Barriers resolved", String(resolved.length)],
              ["Money saved", usd(moneySaved)],
              ["Assistance received", usd(assistance)],
            ].map(([k, v]) => (
              <div key={k} className="bg-forest p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{k}</dt>
                <dd className="font-pixel text-2xl">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="border-t-2 border-line p-3 text-center font-mono text-[10px] tracking-[0.2em] opacity-70">BF&lt;&lt;{s.initials}&lt;&lt;DEMO&lt;&lt;FICTIONAL&lt;&lt;&lt;&lt;</p>
        </div>

        <div className="space-y-6">
          <Window title={`Stamps · ${earned}/${achievements.length}`} tone="ink">
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {achievements.map((a, i) => (
                <li key={a.id} className="flex flex-col items-center text-center">
                  <motion.div
                    initial={a.earned ? { scale: 1.6, opacity: 0, rotate: -20 } : false}
                    animate={{ scale: 1, opacity: 1, rotate: a.earned ? (i % 2 ? 6 : -6) : 0 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 16 }}
                    className={`relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-double ${a.earned ? "" : "border-line/30 opacity-40 grayscale"}`}
                    style={a.earned ? { borderColor: a.color, background: `${a.color}1A` } : undefined}
                  >
                    <PixelSprite name={a.sprite} scale={a.sprite === "student" ? 4 : 6} />
                    {!a.earned && <Lock size={16} className="absolute bottom-1 right-1" aria-hidden />}
                  </motion.div>
                  <p className="mt-2 font-pixel text-sm">{a.title}</p>
                  <p className="text-[11px] text-muted">{a.desc}</p>
                  <span className="sr-only">{a.earned ? "Earned" : "Not yet earned"}</span>
                </li>
              ))}
            </ul>
          </Window>

          <div className="grid gap-6 md:grid-cols-2">
            <Window title="Educational milestones">
              <ol className="relative space-y-3 border-l-2 border-dashed border-line/50 pl-4">
                {[
                  ...state.milestones.map((m) => ({ id: m.id, at: m.at, label: m.label })),
                  ...mineReq.filter((r) => r.status === "Completed" || r.status === "Fully Funded").map((r) => ({ id: r.id, at: r.history[r.history.length - 1].at, label: `Barrier cleared: ${r.purpose}` })),
                ]
                  .sort((a, b) => b.at.localeCompare(a.at))
                  .map((m) => (
                    <li key={m.id} className="relative text-sm">
                      <span className="absolute -left-[1.4rem] top-1 h-3 w-3 border-2 border-line bg-gold" aria-hidden />
                      {m.label}
                      <span className="block text-xs text-muted">{fmtDate(m.at, { month: "short", day: "numeric", year: "numeric" })}</span>
                    </li>
                  ))}
              </ol>
            </Window>
            <Window title="Upcoming opportunities">
              <ul className="space-y-2">
                {ov.active
                  .filter((p) => !p.unlocked)
                  .map((p) => (
                    <li key={p.opp.id} className="flex items-center justify-between gap-2 text-sm">
                      <Link href={`/student/engine?opp=${p.opp.id}`} className="min-w-0 truncate hover:underline">
                        {p.opp.title}
                      </Link>
                      <span className="shrink-0 text-xs text-muted">{relDays(p.opp.deadline)}</span>
                    </li>
                  ))}
                {ov.active.every((p) => p.unlocked) && <li className="text-sm text-muted">Every active opportunity is unlocked. Time for a new quest!</li>}
              </ul>
            </Window>
          </div>
        </div>
      </div>
    </div>
  );
}
