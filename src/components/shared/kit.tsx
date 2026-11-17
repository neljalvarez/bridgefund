"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FlaskConical, Inbox } from "lucide-react";
import type { RequestStatus } from "@/lib/types";
import { STATUS_TONE, usd } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AnimatedNumber({ value, money = true, className }: { value: number; money?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      prev.current = value;
      return;
    }
    const c = animate(prev.current, value, { duration: 0.7, ease: [0.22, 1, 0.36, 1], onUpdate: setShown });
    prev.current = value;
    return () => c.stop();
  }, [value, reduce]);
  return <span className={cn("tabular", className)}>{money ? usd(Math.round(shown)) : Math.round(shown).toLocaleString()}</span>;
}

export function StatCard({ label, value, money = true, hint, icon, tone }: { label: string; value: number | string; money?: boolean; hint?: ReactNode; icon?: ReactNode; tone?: "primary" | "warning" | "muted" }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>}
      </div>
      <p className={cn("mt-2 text-2xl font-semibold tracking-tight", tone === "primary" && "text-primary", tone === "warning" && "text-warning")}>
        {typeof value === "number" ? <AnimatedNumber value={value} money={money} /> : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  const label = status === "Additional Information Required" ? "Info required" : status;
  return (
    <Badge variant={STATUS_TONE[status]} className={className} title={status}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {label}
    </Badge>
  );
}

export function UrgencyBadge({ label }: { label: "Critical" | "High" | "Moderate" | "Low" }) {
  const v = { Critical: "danger", High: "warning", Moderate: "neutral", Low: "neutral" } as const;
  return <Badge variant={v[label]}>{label}</Badge>;
}

export function DemoBadge({ children = "Simulated data" }: { children?: ReactNode }) {
  return (
    <Badge variant="outline" className="border-dashed text-muted-foreground">
      <FlaskConical aria-hidden /> {children}
    </Badge>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <div className="mb-1.5 text-[13px] font-medium text-primary">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5">{icon ?? <Inbox />}</span>
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-xs font-medium text-destructive" role="alert">
      {children}
    </p>
  );
}

export function KeyValue({ label, value, className }: { label: ReactNode; value: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 py-1.5 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  );
}
