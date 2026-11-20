"use client";

import { HelpCircle } from "lucide-react";
import { HELP } from "@/lib/help";
import { useLocale } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** A small (?) beside an unfamiliar feature. Click or press Enter to read a one-line explanation. */
export function HelpTip({ term, className }: { term: string; className?: string }) {
  const locale = useLocale();
  const text = HELP[term];
  if (!text) return null;
  return (
    <Popover>
      <PopoverTrigger
        className={cn("inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm align-middle text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
        aria-label={locale === "ar" ? `ما هذا: ${term}` : `What is "${term}"?`}
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3 text-sm leading-relaxed normal-case tracking-normal" style={{ fontFamily: "var(--font-sans)" }}>
        <p className="eyebrow mb-1 text-primary">{term}</p>
        <p className="text-foreground">{text[locale]}</p>
      </PopoverContent>
    </Popover>
  );
}
