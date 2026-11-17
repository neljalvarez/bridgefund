"use client";

import { motion } from "framer-motion";
import type { Expense } from "@/lib/types";
import { EXPENSE_CATEGORY_LABEL, daysUntil, fmtDateLong, urgencyOf, usd } from "@/lib/format";
import { UrgencyBadge } from "@/components/ui/primitives";

export interface ReportInput {
  title: string;
  provider?: string;
  institution?: string;
  deadline: string;
  expenses: Expense[];
  studentFunds: number;
  priorAssistance: number;
}

export function computeReport(i: ReportInput) {
  const total = i.expenses.reduce((a, e) => a + (e.amount || 0), 0);
  const available = Math.min(i.studentFunds + i.priorAssistance, total);
  const gap = Math.max(total - available, 0);
  const confirmed = i.expenses.filter((e) => e.confirmed).reduce((a, e) => a + (e.amount || 0), 0);
  return { total, available, gap, confirmed, estimated: total - confirmed };
}

export function BarrierReport({ input }: { input: ReportInput }) {
  const r = computeReport(input);
  const days = input.deadline ? daysUntil(input.deadline) : null;
  const urgency = input.deadline ? urgencyOf(input.deadline) : null;
  const max = Math.max(1, ...input.expenses.map((e) => e.amount || 0));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b-2 border-dashed border-line/40 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Financial barrier report</p>
          <h3 className="font-pixel text-xl leading-tight">{input.title || "Untitled opportunity"}</h3>
          <p className="text-xs text-muted">
            {[input.provider, input.institution].filter(Boolean).join(" · ")}
            {input.deadline && <> · Deadline {fmtDateLong(input.deadline)}</>}
          </p>
        </div>
        {urgency && days !== null && (
          <div className="text-right">
            <UrgencyBadge label={urgency.label} />
            <p className="mt-1 text-xs text-muted">{days < 0 ? "Deadline passed" : `${days} days left`}</p>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className="border-2 border-line bg-bg p-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Total cost</dt>
          <dd className="font-pixel text-2xl">{usd(r.total)}</dd>
        </div>
        <div className="border-2 border-line bg-bg p-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Available</dt>
          <dd className="font-pixel text-2xl text-forest">{usd(r.available)}</dd>
        </div>
        <div className={`border-2 border-line p-2 ${r.gap > 0 ? "bg-terra/25" : "bg-forest/20"}`}>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Outstanding gap</dt>
          <dd className="font-pixel text-2xl">{usd(r.gap)}</dd>
        </div>
      </dl>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Expense breakdown</p>
        {input.expenses.length === 0 ? (
          <p className="text-sm text-muted">Add the costs you need to cover.</p>
        ) : (
          <ul className="space-y-1.5">
            {input.expenses.map((e) => (
              <li key={e.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 text-sm">
                <span className="truncate">
                  {e.label || "Unnamed expense"} <span className="text-xs text-muted">· {EXPENSE_CATEGORY_LABEL[e.category]}</span>
                  {!e.confirmed && <span className="ml-1 text-[10px] font-semibold uppercase text-terraink">est.</span>}
                </span>
                <span className="font-pixel">{usd(e.amount || 0)}</span>
                <span className="col-span-2 h-2 bg-raised">
                  <motion.span className={`block h-full ${e.confirmed ? "bg-forest" : "stripes bg-gold"}`} initial={{ width: 0 }} animate={{ width: `${((e.amount || 0) / max) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted">
        Confirmed costs {usd(r.confirmed)} · estimated {usd(r.estimated)}
        {input.priorAssistance > 0 && <> · includes {usd(input.priorAssistance)} assistance already received</>}
      </p>
    </div>
  );
}
