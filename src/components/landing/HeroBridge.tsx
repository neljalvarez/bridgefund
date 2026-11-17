"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PixelBridge, BridgeLegend, planksFromSegments } from "@/components/pixel/PixelBridge";
import { Window } from "@/components/ui/Window";

const STAGES = [
  { caption: "Exam fee: $180 · Amina has saved $70", gap: 110, segments: [{ source: "student" as const, amount: 70 }, { source: "gap" as const, amount: 110 }] },
  { caption: "BridgeEngine finds a $50 fee waiver", gap: 60, segments: [{ source: "student" as const, amount: 70 }, { source: "reduction" as const, amount: 50 }, { source: "gap" as const, amount: 60 }] },
  { caption: "A verified sponsor covers the last $60", gap: 0, segments: [{ source: "student" as const, amount: 70 }, { source: "reduction" as const, amount: 50 }, { source: "sponsor" as const, amount: 60 }, { source: "gap" as const, amount: 0 }] },
];

export function HeroBridge() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(reduce ? 2 : 0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const delay = stage === 2 ? 5200 : 2400;
    const t = setTimeout(() => {
      if (stage === 2) {
        setStage(0);
        setCycle((c) => c + 1);
      } else setStage(stage + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [stage, reduce]);

  const s = STAGES[stage];
  return (
    <Window title="bridge.exe — example scenario" tone="ink" bodyClassName="p-0">
      <div className="relative bg-[linear-gradient(to_bottom,rgb(var(--c-raised))_0%,rgb(var(--c-surface))_60%)] px-3 pt-4">
        <div key={cycle}>
          <PixelBridge planks={planksFromSegments(s.segments, 12)} unlocked={stage === 2} label="Animated bridge showing a $110 gap closing to $0" />
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t-2 border-line p-3 sm:flex-row sm:items-center sm:justify-between">
        <AnimatePresence mode="wait">
          <motion.p key={stage} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-sm font-medium">
            {s.caption}
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Gap</span>
          <span className={`border-2 border-line px-2 py-0.5 font-pixel text-lg ${s.gap === 0 ? "bg-forest text-onforest" : "bg-surface"}`}>${s.gap}</span>
        </div>
      </div>
      <div className="border-t-2 border-line px-3 py-2">
        <BridgeLegend />
      </div>
    </Window>
  );
}
