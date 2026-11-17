"use client";

import { motion } from "framer-motion";
import { usd } from "@/lib/format";

const COLORS = ["#294C3D", "#D8AA55", "#C97052", "#BCC9B6", "#5C635A", "#8C6A3C"];

export function BarChart({
  data,
  format = "number",
  color,
  max,
}: {
  data: { label: string; value: number; hint?: string }[];
  format?: "number" | "money";
  color?: string;
  max?: number;
}) {
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  const fmt = (v: number) => (format === "money" ? usd(v) : String(Math.round(v * 10) / 10));
  return (
    <ul className="space-y-2.5" role="list">
      {data.map((d, i) => (
        <li key={d.label} className="grid grid-cols-[minmax(7rem,11rem)_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate" title={d.label}>
            {d.label}
          </span>
          <span className="h-5 border-2 border-line bg-bg" aria-hidden>
            <motion.span
              className="block h-full"
              style={{ background: color ?? COLORS[i % COLORS.length], backgroundImage: "repeating-linear-gradient(90deg, transparent 0 8px, rgba(0,0,0,.12) 8px 10px)" }}
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / top) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            />
          </span>
          <span className="w-16 text-right font-pixel">{fmt(d.value)}</span>
          <span className="sr-only">
            {d.label}: {fmt(d.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StackedBar({ parts, total }: { parts: { label: string; value: number; color: string }[]; total?: number }) {
  const t = total ?? parts.reduce((a, p) => a + p.value, 0);
  return (
    <div>
      <div className="flex h-8 border-2 border-line bg-bg" role="img" aria-label={parts.map((p) => `${p.label} ${usd(p.value)}`).join(", ")}>
        {parts.map((p) =>
          p.value > 0 ? (
            <motion.div
              key={p.label}
              className="h-full border-r-2 border-line last:border-r-0"
              style={{ background: p.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(p.value / Math.max(t, 1)) * 100}%` }}
              transition={{ duration: 0.6 }}
              title={`${p.label}: ${usd(p.value)}`}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-3 border border-line" style={{ background: p.color }} />
            {p.label} <span className="font-semibold text-ink">{usd(p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Square-cell heat grid. Values are aggregated counts — never individual records. */
export function HeatGrid({ rows, cols, value, format }: { rows: string[]; cols: string[]; value: (r: string, c: string) => number; format?: (n: number) => string }) {
  const all = rows.flatMap((r) => cols.map((c) => value(r, c)));
  const max = Math.max(1, ...all);
  const shade = (v: number) => {
    if (v <= 0) return "rgb(var(--c-bg))";
    const steps = ["#E6DDBF", "#D8AA55", "#C97052", "#8C4A33"];
    return steps[Math.min(steps.length - 1, Math.floor((v / max) * steps.length - 0.0001))];
  };
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="sr-only">Category</th>
            {cols.map((c) => (
              <th key={c} scope="col" className="h-24 align-bottom font-medium text-muted">
                <span className="inline-block w-6 origin-bottom-left translate-x-3 -rotate-45 whitespace-nowrap">{c}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <th scope="row" className="whitespace-nowrap pr-2 text-left font-medium">
                {r}
              </th>
              {cols.map((c) => {
                const v = value(r, c);
                return (
                  <td key={c} className="h-8 w-9 border border-line/40 text-center font-pixel text-[11px]" style={{ background: shade(v), color: v / max > 0.5 ? "#FBF8EF" : "#232824" }} title={`${r} · ${c}: ${format ? format(v) : v}`}>
                    {v > 0 ? (format ? format(v) : v) : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
