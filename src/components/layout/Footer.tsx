import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="no-print mt-16 border-t-2 border-line bg-raised/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-md text-sm text-muted">
            Small gaps. Big futures. BridgeFund finds the cheapest path across the small financial barriers between students and life-changing educational opportunities.
          </p>
          <p className="mt-4 max-w-md border-2 border-dashed border-terra/70 p-3 text-xs text-muted">
            <strong className="text-ink">Competition prototype.</strong> Every student, institution, sponsor, programme, amount and outcome shown is fictional demonstration data. No real money moves and no real
            verification takes place. Final eligibility for any waiver or programme must always be confirmed by the relevant institution.
          </p>
        </div>
        <div>
          <p className="font-pixel text-sm">Explore</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li><Link className="hover:text-ink hover:underline" href="/demo">Judge demo mode</Link></li>
            <li><Link className="hover:text-ink hover:underline" href="/student">Student quest journal</Link></li>
            <li><Link className="hover:text-ink hover:underline" href="/sponsor">Sponsor marketplace</Link></li>
            <li><Link className="hover:text-ink hover:underline" href="/institution">Institution dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-pixel text-sm">Principles</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li>Students are never charged to ask for help</li>
            <li>No loans, no interest, no hidden fees</li>
            <li>Cost reduction before fundraising</li>
            <li>Private details stay with the verifier</li>
            <li><Link className="hover:text-ink hover:underline" href="/business">Business model →</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
