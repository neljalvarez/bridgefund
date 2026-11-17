"use client";

import type { AppState, FundingRequest } from "@/lib/types";
import { usd } from "@/lib/format";
import { fmtMultiplier, requestImpact } from "@/lib/impact";

export function MultiplierStrip({ state, request }: { state: AppState; request: FundingRequest }) {
  const i = requestImpact(request, state.contributions);
  if (!i.sponsor) return null;
  return (
    <div className="grid grid-cols-3 gap-3 rounded-xl border bg-accent/40 p-4 text-center">
      <div>
        <p className="text-xs text-muted-foreground">Barriers resolved</p>
        <p className="text-xl font-semibold tabular">{usd(i.resolved)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Sponsor funding used</p>
        <p className="text-xl font-semibold tabular">{usd(i.sponsor)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Impact multiplier</p>
        <p className="text-xl font-semibold tabular text-primary">{fmtMultiplier(i.multiplier)}</p>
      </div>
      <p className="col-span-3 text-[11px] text-muted-foreground">Student&apos;s own funds excluded. Every sponsor dollar resolved {fmtMultiplier(i.multiplier)} in barriers because costs were reduced first.</p>
    </div>
  );
}
