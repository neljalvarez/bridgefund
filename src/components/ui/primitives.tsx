"use client";

import { animate, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FlaskConical, Inbox } from "lucide-react";
import type { RequestStatus } from "@/lib/types";
import { STATUS_STYLE, usd } from "@/lib/format";

/* ---------- Numbers ---------- */

export function AnimatedMoney({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v * 100) / 100),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduce]);
  return <span className={`tabular-nums ${className ?? ""}`}>{usd(Math.round(shown))}</span>;
}

export function Stat({
  label,
  value,
  hint,
  tone = "ink",
  icon,
  money = true,
}: {
  label: string;
  value: number | string;
  hint?: ReactNode;
  tone?: "ink" | "forest" | "terra" | "gold";
  icon?: ReactNode;
  money?: boolean;
}) {
  const color = { ink: "text-ink", forest: "text-forest", terra: "text-terraink", gold: "text-ink" }[tone];
  return (
    <div className="panel-flat bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <p className={`mt-1 font-pixel text-2xl leading-none ${color}`}>
        {typeof value === "number" && money ? <AnimatedMoney value={value} /> : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/* ---------- Progress ---------- */

export function ChunkyProgress({
  value,
  max,
  segments = 20,
  tone = "forest",
  label,
  className,
}: {
  value: number;
  max: number;
  segments?: number;
  tone?: "forest" | "gold" | "terra";
  label?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const on = Math.round(pct * segments);
  const fill = { forest: "bg-forest", gold: "bg-gold", terra: "bg-terra" }[tone];
  return (
    <div
      className={`flex h-4 gap-[2px] border-2 border-line bg-surface p-[2px] ${className ?? ""}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label ?? "Progress"}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <motion.span
          key={i}
          className={`flex-1 ${i < on ? fill : "bg-raised"}`}
          initial={false}
          animate={{ opacity: i < on ? 1 : 0.6 }}
          transition={{ delay: i * 0.015 }}
        />
      ))}
    </div>
  );
}

/* ---------- Badges ---------- */

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`inline-flex items-center border border-line px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${STATUS_STYLE[status]}`}>{status}</span>;
}

export function UrgencyBadge({ label }: { label: "Critical" | "High" | "Moderate" | "Low" }) {
  const style = {
    Critical: "bg-terra text-[#232824]",
    High: "bg-gold text-[#232824]",
    Moderate: "bg-sage text-ink",
    Low: "bg-raised text-muted",
  }[label];
  return <span className={`inline-flex items-center border border-line px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style}`}>{label}</span>;
}

export function DemoLabel({ children = "Fictional demo data" }: { children?: ReactNode }) {
  return (
    <span className="demo-label">
      <FlaskConical size={11} aria-hidden /> {children}
    </span>
  );
}

/* ---------- Layout helpers ---------- */

export function PageHeader({ kicker, title, description, actions }: { kicker?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {kicker && <p className="mb-1 font-pixel text-xs uppercase tracking-[0.2em] text-terraink">{kicker}</p>}
        <h1 className="font-pixel text-3xl leading-tight md:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function EmptyState({ title, body, action, icon }: { title: string; body?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line/50 px-6 py-10 text-center">
      <span className="text-muted">{icon ?? <Inbox size={28} aria-hidden />}</span>
      <p className="font-pixel text-base">{title}</p>
      {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function PixelLoader({ label = "Working…" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted" role="status">
      <span className="flex gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 bg-current" style={{ animation: `blink 0.9s steps(1) ${i * 0.2}s infinite` }} />
        ))}
      </span>
      {label}
    </span>
  );
}

export function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-semibold text-terraink" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { id: T; label: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1 border-b-2 border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => {
            const i = tabs.findIndex((x) => x.id === t.id);
            if (e.key === "ArrowRight") onChange(tabs[(i + 1) % tabs.length].id);
            if (e.key === "ArrowLeft") onChange(tabs[(i - 1 + tabs.length) % tabs.length].id);
          }}
          className={`-mb-[2px] flex items-center gap-1.5 border-2 border-b-0 px-3 py-1.5 text-sm font-semibold ${
            value === t.id ? "border-line bg-surface" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {t.label}
          {t.count !== undefined && <span className="bg-raised px-1.5 text-[10px] font-bold">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
