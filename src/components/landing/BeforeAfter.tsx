"use client";

import { motion } from "framer-motion";
import { DemoLabel } from "@/components/ui/primitives";

const ROWS = {
  before: [
    { label: "Student savings", amount: 70, color: "#294C3D" },
    { label: "Asked from donors", amount: 110, color: "#C97052", striped: true },
  ],
  after: [
    { label: "Student savings", amount: 70, color: "#294C3D" },
    { label: "Fee waiver found", amount: 50, color: "#D8AA55" },
    { label: "Verified sponsor", amount: 60, color: "#C97052" },
  ],
};

function Bar({ rows }: { rows: { label: string; amount: number; color: string; striped?: boolean }[] }) {
  return (
    <div className="flex h-12 border-2 border-line bg-surface">
      {rows.map((r, i) => (
        <motion.div
          key={r.label}
          initial={{ width: 0 }}
          animate={{ width: `${(r.amount / 180) * 100}%` }}
          transition={{ duration: 0.6, delay: i * 0.25 }}
          className="relative flex items-center justify-center overflow-hidden border-r-2 border-line last:border-r-0"
          style={{ background: r.color }}
        >
          {r.striped && <span className="stripes absolute inset-0" aria-hidden />}
          <span className="relative font-pixel text-sm text-[#232824] mix-blend-normal" style={{ color: r.color === "#294C3D" ? "#F5F0E1" : "#232824" }}>
            ${r.amount}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function BeforeAfter() {
  return (
    <section className="border-b-2 border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-terraink">Before & after</p>
            <h2 className="mt-1 font-pixel text-3xl md:text-4xl">Same $180 exam. Half the ask.</h2>
            <p className="mt-3 text-muted">Generic fundraising asks donors to cover the whole shortfall. BridgeFund reduces the cost first, so every sponsor dollar goes further.</p>
          </div>
          <DemoLabel>Example scenario</DemoLabel>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="panel p-5">
            <p className="font-pixel text-lg">Without BridgeFund</p>
            <p className="text-sm text-muted">Crowdfund the shortfall</p>
            <div className="mt-4">
              <Bar rows={ROWS.before} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Donor ask</dt>
                <dd className="font-pixel text-2xl text-terraink">$110</dd>
              </div>
              <div>
                <dt className="text-muted">Waiver the student qualified for</dt>
                <dd className="font-pixel text-2xl">Missed</dd>
              </div>
            </dl>
          </div>
          <div className="panel p-5">
            <p className="font-pixel text-lg">With BridgeFund</p>
            <p className="text-sm text-muted">Reduce, verify, then fund the remainder</p>
            <div className="mt-4">
              <Bar rows={ROWS.after} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Sponsor ask</dt>
                <dd className="font-pixel text-2xl text-forest">$60</dd>
              </div>
              <div>
                <dt className="text-muted">Sponsor money saved</dt>
                <dd className="font-pixel text-2xl text-forest">45%</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
