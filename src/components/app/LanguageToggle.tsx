"use client";

import { Languages } from "lucide-react";
import { useMaybeStore } from "@/lib/store";
import { setDisplay } from "@/lib/actions";
import { Button } from "@/components/ui/button";

/** Switches the interface between English and Arabic (right-to-left). */
export function LanguageToggle({ className }: { className?: string }) {
  const store = useMaybeStore();
  if (!store) return null;
  const next = store.state.display.locale === "ar" ? "en" : "ar";
  return (
    <Button variant="ghost" size="sm" className={className} onClick={() => store.dispatch(setDisplay({ locale: next }))} aria-label={next === "ar" ? "التبديل إلى العربية" : "Switch to English"}>
      <Languages /> {next === "ar" ? "العربية" : "English"}
    </Button>
  );
}
