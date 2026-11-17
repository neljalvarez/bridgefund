"use client";

import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";
import { useStore } from "@/lib/store";
import { setRole } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { ROLE_META } from "./nav";

export function RoleSwitcher({ className, onSwitch, stacked }: { className?: string; onSwitch?: () => void; stacked?: boolean }) {
  const { state, dispatch } = useStore();
  const router = useRouter();
  return (
    <div role="radiogroup" aria-label="View as" className={cn("flex rounded-lg border bg-muted/60 p-0.5", stacked && "flex-col", className)}>
      {(Object.keys(ROLE_META) as Role[]).map((r) => {
        const m = ROLE_META[r];
        const active = state.role === r;
        return (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              dispatch(setRole(r));
              router.push(m.home);
              onSwitch?.();
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              stacked && "justify-start py-2",
            )}
          >
            <m.icon className="h-3.5 w-3.5" aria-hidden />
            {m.label}
            {stacked && <span className="ms-auto text-xs font-normal text-muted-foreground">{m.persona}</span>}
          </button>
        );
      })}
    </div>
  );
}
