"use client";

import { usd } from "@/lib/format";

export const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface Item {
  name?: string;
  value?: number;
  color?: string;
  payload?: { name?: string };
}

export function ChartTooltip({ active, payload, label, money = true, format }: { active?: boolean; payload?: Item[]; label?: string | number; money?: boolean; format?: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  const fmt = (v: number) => (format ? format(v) : money ? usd(v) : v.toLocaleString());
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-elevated">
      {(label ?? payload[0].payload?.name) && <p className="mb-1 font-medium text-foreground">{label ?? payload[0].payload?.name}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 tabular text-muted-foreground">
          {payload.length > 1 && <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />}
          {payload.length > 1 && <span>{p.name}:</span>}
          <span className="font-medium text-foreground">{fmt(p.value ?? 0)}</span>
        </p>
      ))}
    </div>
  );
}
