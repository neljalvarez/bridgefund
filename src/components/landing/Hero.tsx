import Link from "next/link";
import { ArrowRight, Gamepad2, HandCoins } from "lucide-react";
import { HeroBridge } from "./HeroBridge";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-line">
      <div className="pointer-events-none absolute inset-0 stripes opacity-40" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 border-2 border-line bg-surface px-2.5 py-1 font-pixel text-xs uppercase tracking-[0.18em] shadow-offset-sm">
            <span className="h-2 w-2 animate-blink bg-terra" aria-hidden /> Small gaps. Big futures.
          </p>
          <h1 className="font-pixel text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.2rem]">
            Your future shouldn&apos;t have a <span className="relative whitespace-nowrap text-forest">price barrier<span className="absolute -bottom-1 left-0 h-2 w-full bg-gold/70" aria-hidden /></span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            BridgeFund helps students overcome the financial obstacles standing between them and their next opportunity.
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Not a scholarship directory, a loan, or a crowdfunding page — a resolver that pinpoints the exact cost in the way, shrinks it with waivers, free alternatives and borrowed equipment, and asks sponsors only for what is left.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/student/scanner" className="btn-primary px-5 py-3 text-base">
              Find Your Path <ArrowRight size={18} />
            </Link>
            <Link href="/sponsor" className="btn-ghost px-5 py-3 text-base">
              <HandCoins size={18} /> Support a Student
            </Link>
            <Link href="/demo" className="btn-gold px-5 py-3 text-base">
              <Gamepad2 size={18} /> Play the 2-minute demo
            </Link>
          </div>
        </div>
        <HeroBridge />
      </div>
    </section>
  );
}
