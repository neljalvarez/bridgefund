import Link from "next/link";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} className="crisp shrink-0" aria-hidden>
      <rect width="16" height="16" fill="#F5F0E1" />
      <rect x="0" y="0" width="16" height="16" fill="none" stroke="#232824" strokeWidth="1" />
      <rect x="1" y="9" width="2" height="6" fill="#232824" />
      <rect x="13" y="9" width="2" height="6" fill="#232824" />
      <rect x="3" y="9" width="3" height="2" fill="#294C3D" />
      <rect x="6" y="9" width="2" height="2" fill="#D8AA55" />
      <rect x="8" y="9" width="3" height="2" fill="#C97052" />
      <rect x="11" y="9" width="2" height="2" fill="#294C3D" />
      <rect x="2" y="4" width="1" height="5" fill="#232824" />
      <rect x="13" y="4" width="1" height="5" fill="#232824" />
      <rect x="3" y="4" width="10" height="1" fill="#232824" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="BridgeFund home">
      <LogoMark />
      <span className="font-pixel text-xl leading-none tracking-wide">
        Bridge<span className="text-forest">Fund</span>
      </span>
    </Link>
  );
}
