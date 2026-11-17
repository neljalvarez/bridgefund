"use client";

import { Check } from "lucide-react";
import type { AppState, FundingRequest, RequestStatus } from "@/lib/types";
import { remainingOf } from "@/lib/actions";
import { STATUS_FLOW, aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/** Line-by-line financial breakdown of a request. Totals always reconcile. */
export function RequestBreakdown({ r, state, compact }: { r: FundingRequest; state: AppState; compact?: boolean }) {
  const contributions = state.contributions.filter((c) => c.requestId === r.id);
  return (
    <div className="text-sm">
      {!compact &&
        r.expenses.map((e) => (
          <div key={e.id} className="flex justify-between gap-3 py-1">
            <span className="text-muted-foreground">
              {e.label} {!e.confirmed && <span className="text-[11px]">(estimate)</span>}
            </span>
            <span className="tabular">{aed(e.amount)}</span>
          </div>
        ))}
      <div className={cn("flex justify-between gap-3 py-1 font-medium", !compact && "border-t pt-1.5")}>
        <span>Total cost</span>
        <span className="tabular">{aed(r.totalCost)}</span>
      </div>
      <div className="flex justify-between gap-3 py-1">
        <span className="text-muted-foreground">Personal funds</span>
        <span className="tabular">−{aed(r.studentFunds)}</span>
      </div>
      {r.reductions.map((x) => (
        <div key={x.id} className="flex items-center justify-between gap-3 py-1">
          <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
            <span className="truncate">{x.title}</span>
            <Badge variant={x.confirmed ? "success" : "outline"} className={cn("shrink-0", !x.confirmed && "border-dashed")}>
              {x.confirmed ? "Confirmed" : "Estimated"}
            </Badge>
          </span>
          <span className="shrink-0 text-primary tabular">−{aed(x.amount)}</span>
        </div>
      ))}
      {contributions.map((c) => (
        <div key={c.id} className="flex justify-between gap-3 py-1">
          <span className="truncate text-muted-foreground">{c.sourceLabel}</span>
          <span className="tabular text-primary">−{aed(c.amount)}</span>
        </div>
      ))}
      <div className="mt-1 flex justify-between gap-3 border-t pt-2 font-semibold">
        <span>Remaining financial gap</span>
        <span className="tabular">{aed(remainingOf(r))}</span>
      </div>
    </div>
  );
}

export function StatusTrack({ status }: { status: RequestStatus }) {
  if (status === "Rejected") return <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">This request was not approved. Your institution has shared the reason privately.</p>;
  const info = status === "Additional Information Required";
  const idx = info ? 2 : STATUS_FLOW.indexOf(status);
  const steps = STATUS_FLOW.map((s, i) => (info && i === 2 ? "Info required" : s));
  return (
    <ol className="grid grid-cols-7 gap-1.5" aria-label={`Status: ${status}`}>
      {steps.map((s, i) => {
        const done = i < idx || (status === "Completed" && i === idx);
        const current = i === idx && status !== "Completed";
        return (
          <li key={s} className="min-w-0" aria-current={current ? "step" : undefined}>
            <span className={cn("block h-1.5 rounded-full", done ? "bg-primary" : current ? (info ? "bg-warning" : "bg-primary/50") : "bg-secondary")} />
            <span className={cn("mt-1.5 flex items-center gap-1 truncate text-[11px]", current ? "font-medium text-foreground" : "text-muted-foreground")}>
              {done && <Check className="h-3 w-3 shrink-0 text-primary" />}
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
