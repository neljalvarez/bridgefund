"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Unlock } from "lucide-react";
import type { OppProgress } from "@/lib/selectors";
import { PixelBridge, BridgeLegend, planksFromSegments } from "@/components/pixel/PixelBridge";
import { AnimatedMoney } from "@/components/ui/primitives";
import { fmtDate, relDays, usd } from "@/lib/format";

export function BridgePanel({ p, planks = 12 }: { p: OppProgress; planks?: number }) {
  return (
    <div>
      <div className="relative border-2 border-line bg-[linear-gradient(to_bottom,rgb(var(--c-raised))_0%,rgb(var(--c-surface))_70%)] px-2 pt-3">
        <PixelBridge planks={planksFromSegments(p.segments, planks)} unlocked={p.unlocked} label={`${p.opp.title}: ${usd(p.covered)} of ${usd(p.total)} covered`} />
        <AnimatePresence>
          {p.unlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              transition={{ delay: 1.9, type: "spring", stiffness: 220, damping: 14 }}
              className="absolute left-1/2 top-3 -translate-x-1/2 border-4 border-double border-forest bg-surface px-3 py-1 font-pixel text-lg uppercase tracking-wider text-forest shadow-offset-sm"
              role="status"
            >
              <span className="flex items-center gap-2">
                <Unlock size={16} /> Opportunity unlocked
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Total cost</dt>
          <dd className="font-pixel text-xl">{usd(p.total)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Covered</dt>
          <dd className="font-pixel text-xl text-forest">
            <AnimatedMoney value={p.covered} />
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Remaining gap</dt>
          <dd className={`font-pixel text-xl ${p.remaining > 0 ? "text-terraink" : "text-forest"}`}>
            <AnimatedMoney value={p.remaining} />
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Deadline</dt>
          <dd className="font-pixel text-xl">{fmtDate(p.opp.deadline)}</dd>
          <dd className="text-xs text-muted">{relDays(p.opp.deadline)}</dd>
        </div>
      </dl>
      <BridgeLegend className="mt-3" />
    </div>
  );
}
