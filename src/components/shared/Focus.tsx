"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "./kit";
import { useT } from "@/lib/store";

export interface Figure {
  label: string;
  value: number | string;
  money?: boolean;
  sub?: ReactNode;
  tone?: "primary" | "warning";
}

/** The three numbers that matter most, plus one obvious next step. */
export function DashboardFocus({ figures, action }: { figures: Figure[]; action: { title: string; text?: ReactNode; href?: string; onClick?: () => void; cta: string; icon?: ReactNode } }) {
  const tr = useT();
  const Btn = (
    <Button size="lg" className="w-full sm:w-auto" onClick={action.onClick} asChild={!!action.href}>
      {action.href ? (
        <Link href={action.href}>
          {action.icon} {tr(action.cta)} <ArrowRight />
        </Link>
      ) : (
        <>
          {action.icon} {tr(action.cta)} <ArrowRight />
        </>
      )}
    </Button>
  );
  return (
    <section aria-label="Summary" className="space-y-4">
      <Card className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {figures.map((f) => (
          <div key={f.label} className="p-5 md:p-6">
            <p className="eyebrow text-muted-foreground">{tr(f.label)}</p>
            <p className={cn("mt-3 font-mono text-[2rem] font-medium leading-none tracking-[-0.03em] md:text-[2.5rem]", f.tone === "primary" && "text-primary", f.tone === "warning" && "text-warning")}>
              {typeof f.value === "number" ? <AnimatedNumber value={f.value} money={f.money ?? true} /> : <bdi>{f.value}</bdi>}
            </p>
            {f.sub && <p className="mt-2.5 text-sm text-muted-foreground">{f.sub}</p>}
          </div>
        ))}
      </Card>
      <div className="flex flex-col gap-4 rounded-lg border border-s-[3px] border-s-primary bg-card p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div className="min-w-0">
          <p className="eyebrow text-primary">{tr("Next step")}</p>
          <p className="mt-1.5 font-display text-xl font-medium leading-snug">{action.title}</p>
          {action.text && <p className="mt-0.5 text-sm text-muted-foreground">{action.text}</p>}
        </div>
        <div className="shrink-0">{Btn}</div>
      </div>
    </section>
  );
}

/** Secondary information, collapsed by default. */
export function MoreDetails({ title = "More details", children, defaultOpen }: { title?: string; children: ReactNode; defaultOpen?: boolean }) {
  const tr = useT();
  return (
    <Collapsible.Root type="single" collapsible defaultValue={defaultOpen ? "x" : undefined} className="mt-8">
      <Collapsible.Item value="x" className="border-t">
        <Collapsible.Header>
          <Collapsible.Trigger className="group flex w-full items-center justify-between py-4 text-start text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {tr(title)}
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Collapsible.Trigger>
        </Collapsible.Header>
        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="space-y-6 pb-2">{children}</div>
        </Collapsible.Content>
      </Collapsible.Item>
    </Collapsible.Root>
  );
}

/** Small list row used inside dashboards. */
export function ListRow({ href, title, meta, right }: { href: string; title: ReactNode; meta?: ReactNode; right?: ReactNode }) {
  return (
    <Link href={href} className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50">
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{title}</span>
        {meta && <span className="block truncate text-xs text-muted-foreground">{meta}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-2 text-sm">
        {right}
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
