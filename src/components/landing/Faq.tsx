"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Is BridgeFund a loan or scholarship provider?",
    a: "Neither. BridgeFund never lends money and never charges interest or fees to students. It finds waivers, free alternatives, discounts, borrowable equipment and grants first, and only then connects the remaining amount with verified sponsors.",
  },
  {
    q: "How is a student's privacy protected?",
    a: "Sponsors only see the educational goal, the verified amount, the deadline and the potential outcome. The reason for the request, supporting documents and household circumstances stay with the verifying school or nonprofit. Analytics are shown in aggregate only.",
  },
  {
    q: "Does money go to the student directly?",
    a: "No. The verifying institution pays the exam board, university, transport company or other provider directly, then confirms completion. That is what generates the sponsor's impact receipt.",
  },
  {
    q: "How does BridgeEngine decide what to recommend?",
    a: "It uses deterministic rules against a knowledge base, always in the same order: fee waivers, free alternatives, discounts and institutional help, equipment borrowing, grants, and finally sponsors. Every recommendation shows why it matched. No AI chatbot is involved.",
  },
  {
    q: "Is anything on this site real?",
    a: "No. This is a competition prototype. All students, institutions, sponsors, programmes, waivers, amounts and outcomes are fictional demonstration data, and every payment and verification is simulated. Final eligibility for any real waiver must be confirmed by the relevant institution.",
  },
  {
    q: "How would BridgeFund sustain itself?",
    a: "Through institutional software subscriptions, corporate social-responsibility partnerships, sponsored assistance programmes and nonprofit partnerships — never by charging students. See the business model page for details.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-20 border-b-2 border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="font-pixel text-xs uppercase tracking-[0.2em] text-terraink">FAQ</p>
          <h2 className="mt-1 font-pixel text-3xl md:text-4xl">Questions judges ask</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="panel-flat bg-bg">
                <h3>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-semibold"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {f.q}
                    {isOpen ? <Minus size={16} aria-hidden /> : <Plus size={16} aria-hidden />}
                  </button>
                </h3>
                {isOpen && (
                  <p id={`faq-${i}`} className="border-t-2 border-line/20 px-4 py-3 text-sm text-muted">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
