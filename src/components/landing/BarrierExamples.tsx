import { BookOpen, Briefcase, Bus, FileText, GraduationCap, Laptop, ScrollText, Trophy, Wifi } from "lucide-react";
import { DemoLabel } from "@/components/ui/primitives";

const BARRIERS = [
  { icon: ScrollText, label: "Examination fees" },
  { icon: GraduationCap, label: "University application fees" },
  { icon: Trophy, label: "Competition registration" },
  { icon: Laptop, label: "Educational equipment" },
  { icon: BookOpen, label: "Textbooks & materials" },
  { icon: Bus, label: "Transport to interviews" },
  { icon: Briefcase, label: "Internship travel" },
  { icon: FileText, label: "Certification fees" },
  { icon: Wifi, label: "Internet & technology" },
];

const SCENARIOS = [
  { value: "$110", label: "shortfall on a $180 certification exam", note: "after the student's own $70 savings" },
  { value: "$28", label: "bus fare and mobile data", note: "to reach a tuition-free coding academy interview" },
  { value: "$45", label: "university application fee", note: "fully waivable — if the student knows to ask" },
  { value: "$85", label: "robotics kit purchase", note: "avoidable — the school already owns six" },
];

export function BarrierExamples() {
  return (
    <section className="border-b-2 border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-pixel text-xs uppercase tracking-[0.2em] text-terraink">The problem</p>
            <h2 className="mt-1 font-pixel text-3xl md:text-4xl">The barrier is rarely tuition. It&apos;s the small, sudden costs.</h2>
            <p className="mt-3 text-muted">
              Talented students lose opportunities they have already earned because of one fee, one bus ticket or one piece of equipment — amounts too small for traditional scholarships and too large for a tight household budget.
            </p>
          </div>
          <DemoLabel>Illustrative scenarios, not research statistics</DemoLabel>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SCENARIOS.map((s) => (
            <div key={s.label} className="panel p-4">
              <p className="font-pixel text-4xl text-forest">{s.value}</p>
              <p className="mt-2 text-sm font-semibold">{s.label}</p>
              <p className="mt-1 text-xs text-muted">{s.note}</p>
            </div>
          ))}
        </div>

        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Types of financial barriers BridgeFund addresses">
          {BARRIERS.map((b) => (
            <li key={b.label} className="flex items-center gap-1.5 border-2 border-line bg-bg px-2.5 py-1.5 text-sm">
              <b.icon size={15} className="text-forest" aria-hidden /> {b.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
