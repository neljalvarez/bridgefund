import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The BridgeFund mark: a single arch carrying a level deck, drawn in hairlines —
 * an elevation of a bridge, the way an architect would sketch it.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7 shrink-0 text-primary", className)} aria-hidden fill="none" stroke="currentColor" strokeLinecap="square">
      <rect x="1" y="1" width="30" height="30" rx="3" strokeWidth="1.5" />
      {/* deck */}
      <path d="M5 13.5h22" strokeWidth="2" />
      {/* arch */}
      <path d="M6 25.5C8.5 17.5 12 14.5 16 14.5s7.5 3 10 11" strokeWidth="1.75" />
      {/* hangers */}
      <path d="M10.5 13.5v6M16 13.5v1M21.5 13.5v6" strokeWidth="1.25" />
      {/* ground */}
      <path d="M4 25.5h24" strokeWidth="1.25" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} aria-label="BridgeFund home">
      <LogoMark />
      <span className="font-display text-[21px] font-medium leading-none tracking-[-0.01em]">
        Bridge<span className="italic text-primary">Fund</span>
      </span>
    </Link>
  );
}
