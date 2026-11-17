"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PixelSprite } from "./PixelSprite";
import type { BridgeSegment, SegmentSource } from "@/lib/selectors";

export const PLANK_COLORS: Record<Exclude<SegmentSource, "gap">, { fill: string; label: string }> = {
  student: { fill: "#294C3D", label: "Student funds" },
  reduction: { fill: "#D8AA55", label: "Waivers, alternatives & grants" },
  sponsor: { fill: "#C97052", label: "Sponsor & institution funding" },
};

export function planksFromSegments(segments: BridgeSegment[], count: number): SegmentSource[] {
  const total = segments.reduce((s, x) => s + x.amount, 0);
  if (total <= 0) return Array(count).fill("gap");
  const out: SegmentSource[] = [];
  for (let i = 0; i < count; i++) {
    const mid = ((i + 0.5) / count) * total;
    let acc = 0;
    let src: SegmentSource = "gap";
    for (const seg of segments) {
      acc += seg.amount;
      if (mid <= acc) {
        src = seg.source;
        break;
      }
    }
    out.push(src);
  }
  // Never show a closed bridge while any gap remains, and never leave a gap plank when the gap is zero.
  const gap = segments.find((s) => s.source === "gap")?.amount ?? 0;
  if (gap > 0 && !out.includes("gap")) out[count - 1] = "gap";
  if (gap <= 0) return out.map((p) => (p === "gap" ? segments.filter((s) => s.amount > 0 && s.source !== "gap").at(-1)?.source ?? "student" : p));
  return out;
}

interface Props {
  planks: SegmentSource[];
  unlocked?: boolean;
  className?: string;
  label?: string;
  showWater?: boolean;
  compact?: boolean;
}

const SPAN_X = 44;
const SPAN_W = 152;

export function PixelBridge({ planks, unlocked = false, className, label, showWater = true, compact = false }: Props) {
  const reduce = useReducedMotion();
  const n = planks.length;
  const pw = SPAN_W / n;
  const filled = planks.filter((p) => p !== "gap").length;
  const h = compact ? 64 : 92;
  const deckY = compact ? 34 : 50;

  return (
    <svg
      viewBox={`0 0 240 ${h}`}
      className={`crisp w-full ${className ?? ""}`}
      role="img"
      aria-label={label ?? `Bridge ${Math.round((filled / n) * 100)}% complete${unlocked ? " — opportunity unlocked" : ""}`}
    >
      {/* water / chasm */}
      {showWater && (
        <g>
          <rect x={SPAN_X} y={deckY + 10} width={SPAN_W} height={h - deckY - 10} fill="#BCC9B6" opacity={0.45} />
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.rect
              key={i}
              x={SPAN_X + 6 + i * 15}
              y={h - 12 - (i % 3) * 6}
              width={6}
              height={2}
              fill="#294C3D"
              opacity={0.35}
              animate={reduce ? undefined : { x: [SPAN_X + 6 + i * 15, SPAN_X + 10 + i * 15, SPAN_X + 6 + i * 15] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: i * 0.13 }}
            />
          ))}
        </g>
      )}

      {/* cliffs */}
      <g fill="#232824">
        <rect x={0} y={deckY} width={SPAN_X + 2} height={h - deckY} />
        <rect x={SPAN_X + SPAN_W - 2} y={deckY} width={240 - SPAN_X - SPAN_W + 2} height={h - deckY} />
      </g>
      <g fill="#294C3D">
        <rect x={0} y={deckY} width={SPAN_X + 2} height={4} />
        <rect x={SPAN_X + SPAN_W - 2} y={deckY} width={240 - SPAN_X - SPAN_W + 2} height={4} />
      </g>
      <g fill="#5C635A" opacity={0.6}>
        <rect x={8} y={deckY + 12} width={6} height={4} />
        <rect x={24} y={deckY + 24} width={8} height={4} />
        <rect x={210} y={deckY + 16} width={6} height={4} />
        <rect x={224} y={deckY + 30} width={8} height={4} />
      </g>

      {/* posts + ropes */}
      <g fill="#232824">
        <rect x={SPAN_X - 2} y={deckY - 18} width={4} height={18} />
        <rect x={SPAN_X + SPAN_W - 2} y={deckY - 18} width={4} height={18} />
      </g>
      <line x1={SPAN_X} y1={deckY - 16} x2={SPAN_X + SPAN_W} y2={deckY - 16} stroke="#232824" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />

      {/* planks */}
      {planks.map((p, i) => {
        const x = SPAN_X + i * pw;
        if (p === "gap") {
          return <rect key={i} x={x + 1} y={deckY} width={pw - 2} height={6} fill="none" stroke="#232824" strokeDasharray="2 2" opacity={0.45} />;
        }
        return (
          <motion.g
            key={`${i}-${p}`}
            initial={reduce ? false : { y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.06, ease: [0.2, 0.9, 0.3, 1.2] }}
          >
            <rect x={x + 0.5} y={deckY} width={pw - 1} height={6} fill={PLANK_COLORS[p].fill} />
            <rect x={x + 0.5} y={deckY} width={pw - 1} height={1.5} fill="#FBF8EF" opacity={0.25} />
            <rect x={x + pw / 2 - 0.5} y={deckY + 6} width={1} height={3} fill="#232824" opacity={0.6} />
            <line x1={x + pw / 2} y1={deckY - 16} x2={x + pw / 2} y2={deckY} stroke="#232824" strokeWidth={0.6} opacity={0.5} />
          </motion.g>
        );
      })}

      {/* destination */}
      <PixelSprite name="school" inline scale={compact ? 1.6 : 1.9} x={212} y={deckY - (compact ? 24 : 28.5)} />

      {/* student */}
      <motion.g
        initial={false}
        animate={{ x: unlocked ? 176 : 0 }}
        transition={{ duration: reduce ? 0 : 1.6, ease: "linear", delay: reduce ? 0 : 0.5 }}
      >
        <motion.g animate={reduce ? undefined : { y: [0, -1.5, 0] }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}>
          <PixelSprite name="student" inline scale={compact ? 1.7 : 2.1} x={compact ? 14 : 14} y={deckY - (compact ? 24 : 29.5)} />
        </motion.g>
      </motion.g>

      {unlocked && (
        <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: reduce ? 0 : 2 }} style={{ transformOrigin: "120px 14px" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={100 + i * 10} y={i % 2 ? 8 : 4} width={3} height={3} fill={i % 2 ? "#C97052" : "#D8AA55"} />
          ))}
        </motion.g>
      )}
    </svg>
  );
}

export function BridgeLegend({ className }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted ${className ?? ""}`}>
      {Object.entries(PLANK_COLORS).map(([k, v]) => (
        <li key={k} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-4 border border-line" style={{ background: v.fill }} />
          {v.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-4 border border-dashed border-line" />
        Remaining gap
      </li>
    </ul>
  );
}
