"use client";

import { useState } from "react";
import { BadgeCheck, CalendarClock, GraduationCap, MapPin } from "lucide-react";
import type { FundingRequest } from "@/lib/types";
import { useStore } from "@/lib/store";
import { institutionOf, oppOf, studentOf } from "@/lib/selectors";
import { remainingOf } from "@/lib/actions";
import { OPP_CATEGORY_LABEL, fmtDate, relDays, urgencyOf, usd } from "@/lib/format";
import { ChunkyProgress, StatusBadge, UrgencyBadge } from "@/components/ui/primitives";
import { ContributeModal } from "./ContributeModal";

export function NeedCard({ request: r, compact, highlight }: { request: FundingRequest; compact?: boolean; highlight?: boolean }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const student = studentOf(state, r.studentId);
  const inst = institutionOf(state, student?.institutionId ?? "");
  const opp = oppOf(state, r.opportunityId);
  const remaining = remainingOf(r);
  const urgency = urgencyOf(r.deadline);
  const reductions = r.reductions.reduce((a, x) => a + x.amount, 0);

  return (
    <article className={`panel flex flex-col ${highlight ? "ring-4 ring-gold" : ""}`} id={`need-${r.id}`}>
      <div className="flex items-center justify-between gap-2 border-b-2 border-line bg-raised/60 px-3 py-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
          <BadgeCheck size={14} className="text-forest" aria-hidden /> Verified need · {r.ref}
        </span>
        <UrgencyBadge label={urgency.label} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-line bg-sage font-pixel text-sm" aria-hidden>
            {student?.initials}
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug">{r.purpose}</h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <span>{student?.firstName}</span>
              <span className="flex items-center gap-0.5">
                <MapPin size={11} aria-hidden /> {student?.city}, {student?.country}
              </span>
              {opp && <span>{OPP_CATEGORY_LABEL[opp.category]}</span>}
            </p>
          </div>
        </div>

        {!compact && opp?.outcome && (
          <p className="flex gap-2 text-sm">
            <GraduationCap size={16} className="mt-0.5 shrink-0 text-forest" aria-hidden />
            <span>
              <span className="text-muted">Potential outcome: </span>
              {opp.outcome}
            </span>
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Remaining gap</p>
              <p className="font-pixel text-3xl leading-none">{usd(remaining)}</p>
            </div>
            <div className="text-right text-xs text-muted">
              <p className="flex items-center justify-end gap-1">
                <CalendarClock size={12} aria-hidden /> {fmtDate(r.deadline)} · {relDays(r.deadline)}
              </p>
              <p>{usd(r.funded)} of {usd(r.amount)} secured</p>
            </div>
          </div>
          <ChunkyProgress value={r.funded} max={r.amount} tone="terra" className="mt-2" label={`${r.ref} funding progress`} segments={16} />
          {!compact && (
            <p className="mt-2 text-xs text-muted">
              Verified need {usd(r.amount)}
              {reductions > 0 && <> · already reduced by {usd(reductions)} through waivers & alternatives</>} · {inst?.name}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={r.status} />
          <button type="button" className="btn-primary btn-sm" onClick={() => setOpen(true)} disabled={remaining <= 0}>
            Contribute
          </button>
        </div>
      </div>
      <ContributeModal request={r} open={open} onClose={() => setOpen(false)} />
    </article>
  );
}
