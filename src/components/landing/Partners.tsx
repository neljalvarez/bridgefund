import { Building2, Briefcase, HeartHandshake, School } from "lucide-react";

const PARTNER_TYPES = [
  { icon: School, title: "Schools", body: "Verify needs, lend equipment they already own, and see which barriers stop their students." },
  { icon: Building2, title: "Universities", body: "Publish application-fee waivers where applicants actually look, and reach students who would never have applied." },
  { icon: HeartHandshake, title: "Nonprofits", body: "Run assistance funds with a verification workflow and transparent distribution history." },
  { icon: Briefcase, title: "Corporate sponsors", body: "Fund verified, specific outcomes — an exam sat, an interview attended — with receipts instead of vague reports." },
];

export function Partners() {
  return (
    <section className="border-b-2 border-line">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <p className="font-pixel text-xs uppercase tracking-[0.2em] text-terraink">Sponsors & institutional partners</p>
        <h2 className="mt-1 max-w-3xl font-pixel text-3xl md:text-4xl">Built for the people who already want to help</h2>
        <p className="mt-3 max-w-2xl text-muted">
          BridgeFund is an early-stage competition prototype and has no institutional partnerships yet. These are the partner types the model is designed around — and the pilot partners we are seeking.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNER_TYPES.map((p) => (
            <div key={p.title} className="panel p-4">
              <span className="flex h-10 w-10 items-center justify-center border-2 border-line bg-sage">
                <p.icon size={18} aria-hidden />
              </span>
              <h3 className="mt-3 font-pixel text-lg">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
