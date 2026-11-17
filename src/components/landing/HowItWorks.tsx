import { HandCoins, ScanLine, ShieldCheck, Wand2 } from "lucide-react";
import { PixelSprite } from "@/components/pixel/PixelSprite";

const STEPS = [
  { icon: ScanLine, title: "Scan the barrier", body: "The Barrier Scanner turns “I can't afford it” into an exact, itemised gap with a deadline and urgency.", sprite: "scroll" as const },
  { icon: Wand2, title: "Shrink it first", body: "BridgeEngine checks, in strict order: fee waivers, free alternatives, discounts, borrowable equipment, then grants.", sprite: "key" as const },
  { icon: ShieldCheck, title: "Verify privately", body: "The student's school or nonprofit verifies the need. Sensitive details never leave the verifier.", sprite: "star" as const },
  { icon: HandCoins, title: "Fund only the remainder", body: "Sponsors see the verified goal and the exact remaining amount — and get an impact receipt when it's paid.", sprite: "coin" as const },
];

const PRIORITIES = ["Fee waivers", "Free alternatives", "Discounts & institutional help", "Borrow equipment", "Grants", "Sponsor the remainder"];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-b-2 border-line">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <p className="font-pixel text-xs uppercase tracking-[0.2em] text-terraink">How BridgeFund works</p>
        <h2 className="mt-1 max-w-3xl font-pixel text-3xl md:text-4xl">A quest map from “can't afford it” to “opportunity unlocked”.</h2>

        <ol className="relative mt-10 grid gap-6 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-9 hidden border-t-2 border-dashed border-line/50 md:block" aria-hidden />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center border-2 border-line bg-surface shadow-offset">
                <PixelSprite name={s.sprite} scale={5} />
                <span className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center border-2 border-line bg-gold font-pixel text-sm text-[#232824]">{i + 1}</span>
              </div>
              <h3 className="mt-4 flex items-center gap-2 font-pixel text-lg">
                <s.icon size={16} className="text-forest" aria-hidden /> {s.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="panel mt-12 p-5">
          <p className="font-pixel text-sm">BridgeEngine priority order — sponsors come last, on purpose</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {PRIORITIES.map((p, i) => (
              <li key={p} className={`flex items-center gap-2 border-2 border-line px-2.5 py-2 text-sm ${i === 5 ? "bg-terra/30" : "bg-bg"}`}>
                <span className="font-pixel text-lg text-forest">{i + 1}</span>
                <span className="leading-tight">{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
