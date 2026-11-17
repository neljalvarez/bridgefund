"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Check } from "lucide-react";
import type { OppProgress } from "@/lib/selectors";
import { OPP_CATEGORY_LABEL, fmtDate, relDays, urgencyOf, usd } from "@/lib/format";
import { ChunkyProgress, StatusBadge, UrgencyBadge } from "@/components/ui/primitives";

export function nextStep(p: OppProgress): { label: string; href: string } {
  const r = p.request;
  if (p.unlocked) return { label: "View passport", href: "/student/passport" };
  if (!r) return { label: "Build my plan", href: `/student/engine?opp=${p.opp.id}` };
  if (r.status === "Draft") return { label: "Review & submit", href: `/student/engine?opp=${p.opp.id}` };
  if (r.infoRequested) return { label: "Respond to institution", href: "/student/requests" };
  if (["Submitted", "Under Review"].includes(r.status)) return { label: "Track verification", href: "/student/requests" };
  return { label: "Track funding", href: "/student/requests" };
}

export function QuestCard({ p, selected, onSelect }: { p: OppProgress; selected?: boolean; onSelect?: () => void }) {
  const step = nextStep(p);
  const urgency = urgencyOf(p.opp.deadline);
  return (
    <article className={`border-2 border-line bg-surface transition-shadow ${selected ? "shadow-offset" : "hover:shadow-offset-sm"}`}>
      <button type="button" onClick={onSelect} className="block w-full p-3 text-left" aria-pressed={selected} aria-label={`Show bridge for ${p.opp.title}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{OPP_CATEGORY_LABEL[p.opp.category]}</p>
            <h3 className="font-semibold leading-snug">{p.opp.title}</h3>
          </div>
          {p.unlocked ? (
            <span className="stamp shrink-0 rotate-[-6deg] border-forest text-forest">
              <Check size={12} className="mr-1" /> Unlocked
            </span>
          ) : (
            <UrgencyBadge label={urgency.label} />
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1">
            <CalendarClock size={12} aria-hidden /> {fmtDate(p.opp.deadline)} · {relDays(p.opp.deadline)}
          </span>
          <span>
            <span className="font-semibold text-ink">{usd(p.covered)}</span> / {usd(p.total)}
          </span>
        </div>
        <ChunkyProgress value={p.covered} max={p.total} className="mt-2" segments={14} label={`${p.opp.title} progress`} />
      </button>
      <div className="flex items-center justify-between gap-2 border-t-2 border-line/20 px-3 py-2">
        {p.request ? <StatusBadge status={p.request.status} /> : <span className="text-xs text-muted">No plan yet</span>}
        <Link href={step.href} className="flex items-center gap-1 text-xs font-semibold text-forest hover:underline">
          {step.label} <ArrowRight size={12} />
        </Link>
      </div>
    </article>
  );
}
