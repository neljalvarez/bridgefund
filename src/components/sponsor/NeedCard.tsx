"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Bookmark, BookmarkCheck, CalendarClock, MapPin } from "lucide-react";
import type { FundingRequest } from "@/lib/types";
import { useStore } from "@/lib/store";
import { remainingOf, toggleSavedNeed } from "@/lib/actions";
import { institutionOf, oppOf, studentOf } from "@/lib/selectors";
import { OPP_LABEL, fmtDate, relDays, urgencyOf, usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, UrgencyBadge } from "@/components/shared/kit";
import { ContributeDialog } from "./ContributeDialog";

export function NeedCard({ r }: { r: FundingRequest }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const st = studentOf(state, r.studentId);
  const opp = oppOf(state, r.opportunityId);
  const inst = institutionOf(state, r.institutionId);
  const remaining = remainingOf(r);
  const saved = state.savedNeeds.includes(r.id);
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-elevated">
      <div className="flex-1 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified by {inst?.name}
          </span>
          <button type="button" onClick={() => dispatch(toggleSavedNeed(r.id), { info: saved ? "Removed from saved" : "Saved for later" })} aria-pressed={saved} aria-label={saved ? "Remove from saved" : "Save opportunity"} className="text-muted-foreground hover:text-foreground">
            {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
        <Link href={`/sponsor/marketplace/${r.id}`} className="mt-3 block font-medium leading-snug hover:text-primary">
          {r.purpose}
        </Link>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{st?.firstName}</span>
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3" /> {st?.city}, {st?.country}
          </span>
          {opp && <span>· {OPP_LABEL[opp.category]}</span>}
        </p>
        {opp && <p className="mt-3 line-clamp-2 text-[13px] text-muted-foreground">{opp.outcome}</p>}
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Amount remaining</p>
            <p className="text-2xl font-semibold tracking-tight tabular">{usd(remaining)}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <UrgencyBadge label={urgencyOf(r.deadline).label} />
            <p className="mt-1 flex items-center justify-end gap-1">
              <CalendarClock className="h-3 w-3" /> {fmtDate(r.deadline)} · {relDays(r.deadline)}
            </p>
          </div>
        </div>
        <Progress value={r.amount ? (r.funded / r.amount) * 100 : 0} className="mt-3" />
        <p className="mt-1.5 text-xs text-muted-foreground">
          {usd(r.funded)} of {usd(r.amount)} verified requirement funded
        </p>
      </div>
      <div className={cn("flex items-center justify-between gap-2 border-t px-5 py-3")}>
        <StatusBadge status={r.status} />
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/sponsor/marketplace/${r.id}`}>Details</Link>
          </Button>
          <Button size="sm" onClick={() => setOpen(true)} disabled={remaining <= 0 || !["Verified", "Partially Funded"].includes(r.status)}>
            Contribute
          </Button>
        </div>
      </div>
      <ContributeDialog request={r} open={open} onOpenChange={setOpen} />
    </Card>
  );
}
