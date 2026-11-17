"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import type { OppProgress } from "@/lib/selectors";
import type { RequestStatus } from "@/lib/types";
import { OPP_LABEL, STATUS_FLOW, fmtDate, relDays, urgencyOf, usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { GapBreakdown } from "@/components/shared/GapBreakdown";
import { StatusBadge, UrgencyBadge } from "@/components/shared/kit";

export function nextStep(p: OppProgress): { label: string; href: string } {
  const r = p.request;
  if (!r) return { label: "Run BridgeEngine", href: `/student/engine?opp=${p.opp.id}` };
  if (r.status === "Draft") return { label: "Review and submit", href: `/student/engine?opp=${p.opp.id}` };
  if (r.status === "Additional Information Required") return { label: "Provide information", href: "/student/requests" };
  if (["Fully Funded", "Completed"].includes(r.status)) return { label: "View breakdown", href: "/student/requests" };
  return { label: "Track request", href: "/student/requests" };
}

export function ApplicationProgress({ status }: { status: RequestStatus }) {
  const idx = status === "Additional Information Required" ? 2 : STATUS_FLOW.indexOf(status);
  return (
    <div className="flex gap-1" aria-hidden>
      {STATUS_FLOW.slice(1).map((s, i) => (
        <span key={s} className={cn("h-1 flex-1 rounded-full", i < idx ? "bg-primary" : "bg-secondary", status === "Additional Information Required" && i === 2 && "bg-warning")} />
      ))}
    </div>
  );
}

export function OpportunityCard({ p, selected, onSelect }: { p: OppProgress; selected?: boolean; onSelect?: () => void }) {
  const step = nextStep(p);
  return (
    <Card className={cn("flex flex-col transition-shadow hover:shadow-elevated", selected && "ring-2 ring-primary/40")}>
      <button type="button" onClick={onSelect} className="flex-1 p-4 text-left focus-visible:outline-none" aria-pressed={selected}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{OPP_LABEL[p.opp.category]}</p>
            <p className="mt-0.5 font-medium leading-snug">{p.opp.title}</p>
          </div>
          {p.secured ? <StatusBadge status={p.request?.status ?? "Completed"} /> : <UrgencyBadge label={urgencyOf(p.opp.deadline).label} />}
        </div>
        <div className="mt-3 flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground tabular">{usd(p.covered)}</span> of {usd(p.total)}
          </span>
          <span className={cn("text-xs font-medium tabular", p.remaining > 0 ? "text-foreground" : "text-primary")}>{p.remaining > 0 ? `${usd(p.remaining)} gap` : "No gap"}</span>
        </div>
        <GapBreakdown b={p} showLegend={false} height="h-2" className="mt-2" />
        {p.request && (
          <div className="mt-3">
            <ApplicationProgress status={p.request.status} />
          </div>
        )}
      </button>
      <div className="flex items-center justify-between border-t px-4 py-2.5 text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" /> {fmtDate(p.opp.deadline)} · {relDays(p.opp.deadline)}
        </span>
        <Link href={step.href} className="flex items-center gap-1 font-medium text-primary hover:underline">
          {step.label} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}
