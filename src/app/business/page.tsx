import type { Metadata } from "next";
import Link from "next/link";
import { Ban, Briefcase, Building2, HandHeart, Landmark, ShieldCheck } from "lucide-react";
import { PixelSprite } from "@/components/pixel/PixelSprite";

export const metadata: Metadata = { title: "Business model" };

const STREAMS = [
  {
    icon: Building2,
    title: "Institutional software subscriptions",
    who: "Schools, universities, nonprofits",
    body: "The verification desk, resource inventory, assistance-fund ledger and barrier heatmap as a subscription. Priced by number of enrolled students, with a free tier for small and under-resourced schools.",
    pitch: "Replaces spreadsheets and email chains for hardship funds — and shows which barriers to budget for next year.",
  },
  {
    icon: Briefcase,
    title: "Corporate social-responsibility partnerships",
    who: "Companies with education or skills goals",
    body: "Companies fund verified, outcome-linked needs — an exam sat, an internship started — and receive impact receipts and aggregated reporting instead of vague annual summaries.",
    pitch: "A platform fee on CSR programmes covers verification and reporting. It is never deducted from a student's assistance.",
  },
  {
    icon: HandHeart,
    title: "Sponsored assistance programmes",
    who: "Foundations, alumni groups, local businesses",
    body: "Branded, ring-fenced funds — for example, “all certification exam fees in one district” — managed through BridgeFund with transparent allocation.",
    pitch: "Programme management fee agreed with the sponsor up front.",
  },
  {
    icon: Landmark,
    title: "Nonprofit partnerships",
    who: "Education charities & community organisations",
    body: "Nonprofits use BridgeFund as their distribution and verification layer, bringing their own funds and local trust.",
    pitch: "Discounted or grant-funded licences; shared data on recurring barriers (aggregated only).",
  },
];

export default function BusinessPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-pixel text-xs uppercase tracking-[0.2em] text-terraink">Business model</p>
      <h1 className="mt-1 max-w-3xl font-pixel text-4xl md:text-5xl">Sustainable without ever charging a student.</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        BridgeFund earns from the institutions and sponsors who already spend money on student hardship — by making that money go further and proving where it went.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Students pay nothing", body: "Requesting essential financial assistance is always free." },
          { icon: Ban, title: "No lending, ever", body: "No loans, no interest, no deferred repayment, no hidden fees." },
          { icon: HandHeart, title: "Every sponsor dollar reaches a provider", body: "Platform fees are charged to institutions and programmes, never deducted from assistance." },
        ].map((p) => (
          <div key={p.title} className="panel flex gap-3 bg-forest p-4 text-onforest">
            <p.icon size={22} className="shrink-0" aria-hidden />
            <div>
              <p className="font-pixel text-lg">{p.title}</p>
              <p className="text-sm opacity-90">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-14 font-pixel text-3xl">Four revenue streams</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {STREAMS.map((s, i) => (
          <article key={s.title} className="panel p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-line bg-gold font-pixel text-lg text-[#232824]">{i + 1}</span>
              <div>
                <h3 className="flex items-center gap-2 font-pixel text-xl">
                  <s.icon size={18} aria-hidden /> {s.title}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{s.who}</p>
              </div>
            </div>
            <p className="mt-3 text-sm">{s.body}</p>
            <p className="mt-3 border-l-4 border-gold pl-3 text-sm text-muted">{s.pitch}</p>
          </article>
        ))}
      </div>

      <h2 className="mt-14 font-pixel text-3xl">Why institutions would pay</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="panel p-5">
          <p className="font-pixel text-lg">Today</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Hardship requests arrive by email, in person, or not at all</li>
            <li>Students rarely know which waivers exist</li>
            <li>Equipment sits in cupboards while families buy new</li>
            <li>Funds pay full price for costs that could have been waived</li>
          </ul>
        </div>
        <div className="flex justify-center" aria-hidden>
          <PixelSprite name="key" scale={6} />
        </div>
        <div className="panel p-5">
          <p className="font-pixel text-lg">With BridgeFund</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>One private, consistent verification workflow</li>
            <li>Waivers and alternatives applied before any spending</li>
            <li>Shared equipment tracked and reused</li>
            <li>Aggregated insight to plan next year&apos;s budget</li>
          </ul>
        </div>
      </div>

      <div className="mt-14 border-2 border-dashed border-terra/70 p-5 text-sm text-muted">
        <p className="font-semibold text-ink">A note on what this is</p>
        <p className="mt-1">
          BridgeFund is a competition prototype. The model above is a proposal, not a description of existing contracts, customers or partnerships. Pilot partners and pricing would be validated with schools and nonprofits before launch.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/demo" className="btn-gold">
          See it in action — judge demo
        </Link>
        <Link href="/institution" className="btn-ghost">
          Explore the institution dashboard
        </Link>
      </div>
    </div>
  );
}
