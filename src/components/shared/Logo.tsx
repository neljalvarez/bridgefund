import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7 shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path d="M7 21c3-6 6-9 9-9s6 3 9 9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M7 21h18" stroke="#E7F4EF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} aria-label="BridgeFund home">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight">BridgeFund</span>
    </Link>
  );
}
