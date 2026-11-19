"use client";

import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import { aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/store";

/**
 * A quiet geometric lattice — eight-point stars and octagons, as in a mashrabiya screen
 * or the dome of a contemporary Gulf museum. Drawn in hairlines with currentColor,
 * so it inherits the theme (use a text colour + opacity on the wrapper).
 */
export function Lattice({ className, size = 44 }: { className?: string; size?: number }) {
  const id = useId().replace(/:/g, "");
  const s = size;
  const h = s / 2;
  const q = h - s * 0.3 * Math.SQRT2; // distance from the tile edge to the star's outer point
  return (
    <svg className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        <pattern id={`lattice-${id}`} width={s} height={s} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="0.75">
            {/* two interlaced squares form the eight-point star */}
            <rect x={h - s * 0.3} y={h - s * 0.3} width={s * 0.6} height={s * 0.6} />
            <rect x={h - s * 0.3} y={h - s * 0.3} width={s * 0.6} height={s * 0.6} transform={`rotate(45 ${h} ${h})`} />
            {/* links to the neighbouring tiles */}
            <path d={`M0 ${h}H${q}M${s - q} ${h}H${s}M${h} 0V${q}M${h} ${s - q}V${s}`} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#lattice-${id})`} />
    </svg>
  );
}

/** Small mono label with a hairline — like the section numbering on an architectural drawing sheet. */
export function SectionMark({ n, children, className }: { n?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-muted-foreground", className)}>
      {n && <span className="text-primary">{n}</span>}
      <span>{children}</span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </p>
  );
}

export interface Span {
  key: string;
  label: string;
  value: number;
  /** Tailwind text colour class used for the arch stroke and the legend tick. */
  tone: string;
}

/**
 * BridgeFund's signature drawing: the gap as a bridge. Each arch is one source of money,
 * its span proportional to the amount — so the picture *is* the funding breakdown.
 */
export function BridgeSpans({ spans, total, className, showLabels = true }: { spans: Span[]; total: number; className?: string; showLabels?: boolean }) {
  const tr = useT();
  const W = 1000;
  const deck = 34;
  const ground = 150;
  let x = 0;
  const geo = spans.map((sp) => {
    const w = total > 0 ? (sp.value / total) * W : 0;
    const g = { ...sp, x0: x, x1: x + w, w };
    x += w;
    return g;
  });
  const covered = x;
  return (
    <figure className={cn("w-full", className)}>
      <svg viewBox={`0 0 ${W} ${ground + 12}`} className="h-auto w-full overflow-visible" role="img" aria-label={`${spans.map((s) => `${s.label} ${aed(s.value)}`).join(", ")} of ${aed(total)}`}>
        {/* deck and ground lines */}
        <line x1="0" x2={W} y1={deck} y2={deck} className="stroke-foreground" strokeWidth="2.5" />
        <line x1="0" x2={W} y1={ground} y2={ground} className="stroke-border" strokeWidth="1" />
        {/* unfunded part of the span: a dashed gap */}
        {covered < W - 1 && <line x1={covered} x2={W} y1={deck + 10} y2={deck + 10} className="stroke-muted-foreground" strokeWidth="1" strokeDasharray="4 6" />}
        {geo.map((g, i) =>
          g.w <= 0 ? null : (
            <g key={g.key} className={g.tone}>
              <motion.path
                d={`M${g.x0 + 3} ${ground} A ${(g.w - 6) / 2} ${ground - deck - 10} 0 0 1 ${g.x1 - 3} ${ground}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* spandrel posts: from the deck down to the arch */}
              {(g.w > 160 ? [0.2, 0.35, 0.5, 0.65, 0.8] : [0.25, 0.5, 0.75]).map((t) => {
                const y = ground - (ground - deck - 10) * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
                return <motion.line key={t} x1={g.x0 + g.w * t} x2={g.x0 + g.w * t} y1={deck} y2={y} stroke="currentColor" strokeWidth="1.25" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 * i + 0.5 }} />;
              })}
              {/* pier */}
              {i > 0 && <line x1={g.x0} x2={g.x0} y1={deck} y2={ground} className="stroke-foreground" strokeWidth="2" />}
            </g>
          ),
        )}
        <line x1="1" x2="1" y1={deck} y2={ground} className="stroke-foreground" strokeWidth="2" />
        <line x1={W - 1} x2={W - 1} y1={deck} y2={ground} className="stroke-foreground" strokeWidth="2" />
      </svg>
      {showLabels && (
        <figcaption className="mt-3 flex border-t border-foreground/60 pt-2 text-xs">
          {geo.map((g) =>
            g.w <= 0 ? null : (
              <span key={g.key} className="min-w-0 border-s border-foreground/60 ps-2 first:border-s-0 first:ps-0" style={{ width: `${(g.w / W) * 100}%` }}>
                <span className={cn("block h-0.5 w-6", g.tone.replace("text-", "bg-"))} aria-hidden />
                <span className="mt-1 block truncate text-muted-foreground">{g.label}</span>
                <span className="tabular block font-medium text-foreground">{aed(g.value)}</span>
              </span>
            ),
          )}
          {covered < W - 1 && (
            <span className="min-w-0 border-s border-foreground/60 ps-2" style={{ width: `${((W - covered) / W) * 100}%` }}>
              <span className="block h-0.5 w-6 border-t border-dashed border-muted-foreground" aria-hidden />
              <span className="mt-1 block truncate text-muted-foreground">{tr("Still missing")}</span>
              <span className="tabular block font-medium text-warning">{aed(total - spans.reduce((a, s) => a + s.value, 0))}</span>
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
