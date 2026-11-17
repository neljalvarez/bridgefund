"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, ChevronDown, ClipboardCheck, Info, Search } from "lucide-react";
import type { EligibilityProfile, OpportunityCategory, Waiver } from "@/lib/types";
import { useStore } from "@/lib/store";
import { toggleSavedWaiver } from "@/lib/actions";
import { WAIVERS } from "@/lib/knowledge";
import { meetsRequirements, requirementReasons } from "@/lib/engine";
import { currentStudent } from "@/lib/selectors";
import { OPP_CATEGORIES, OPP_CATEGORY_LABEL, fmtDate, isoDaysFromNow, relDays } from "@/lib/format";
import { DemoLabel, EmptyState, PageHeader } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";

const savingsText = (w: Waiver) => (w.savingsType === "fixed" ? `$${w.savings} off` : w.savings === 100 ? `Full fee${w.maxSavings ? ` (up to $${w.maxSavings})` : ""}` : `${w.savings}% off${w.maxSavings ? ` (max $${w.maxSavings})` : ""}`);
const KIND = { waiver: "Fee waiver", discount: "Discount", institutional: "Institutional" };

function WaiverCard({ w, deadline, match, defaultOpen }: { w: Waiver; deadline: string; match?: { ok: boolean; missing: string[] }; defaultOpen?: boolean }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(!!defaultOpen);
  const saved = state.savedWaivers.includes(w.id);
  return (
    <article className={`panel ${defaultOpen ? "ring-4 ring-gold" : ""}`} id={w.id}>
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="chip">{KIND[w.kind]}</span>
            {w.categories.map((c) => (
              <span key={c} className="chip bg-surface">
                {OPP_CATEGORY_LABEL[c]}
              </span>
            ))}
            {match && <span className={`chip ${match.ok ? "bg-forest text-onforest" : "bg-gold/50"}`}>{match.ok ? "Likely eligible" : "Check requirements"}</span>}
          </div>
          <h3 className="mt-2 font-semibold">{w.name}</h3>
          <p className="text-xs text-muted">
            {w.provider} · {w.countries.join(", ")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-pixel text-xl text-forest">{savingsText(w)}</p>
          <p className="text-xs text-muted">
            apply by {fmtDate(deadline)} ({relDays(deadline)})
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t-2 border-line/20 px-4 py-2">
        <button type="button" className="flex items-center gap-1 text-xs font-semibold text-forest hover:underline" onClick={() => setOpen(!open)} aria-expanded={open}>
          Details & how to apply <ChevronDown size={12} className={open ? "rotate-180" : ""} />
        </button>
        <button
          type="button"
          className="btn-ghost btn-sm"
          aria-pressed={saved}
          onClick={() => dispatch(toggleSavedWaiver(w.id), { toast: { title: saved ? "Removed from saved" : "Saved — it's on your deadline calendar", tone: "info" } })}
        >
          {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />} {saved ? "Saved" : "Save"}
        </button>
      </div>
      {open && (
        <div className="grid gap-4 border-t-2 border-line/20 p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="label">Eligibility</p>
            <ul className="list-disc space-y-0.5 pl-4">
              {w.eligibility.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            {match && !match.ok && <p className="mt-2 text-xs text-terraink">Based on your answers, check: {match.missing.join("; ")}.</p>}
          </div>
          <div>
            <p className="label">Required documents</p>
            <ul className="list-disc space-y-0.5 pl-4">
              {w.documents.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">How to apply</p>
            <ol className="list-decimal space-y-0.5 pl-4">
              {w.instructions.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </article>
  );
}

function Questionnaire({ open, onClose, onResult }: { open: boolean; onClose: () => void; onResult: (a: { country: string; category: OpportunityCategory | ""; profile: EligibilityProfile }) => void }) {
  const { state } = useStore();
  const student = currentStudent(state);
  const [country, setCountry] = useState(student.country);
  const [category, setCategory] = useState<OpportunityCategory | "">("");
  const [profile, setProfile] = useState<EligibilityProfile>(student.eligibility);
  const countries = [...new Set(state.institutions.map((i) => i.country))].sort();
  const Q: { key: keyof EligibilityProfile; q: string }[] = [
    { key: "lowIncome", q: "Is your household income below your country's low-income threshold?" },
    { key: "publicSchool", q: "Do you attend (or did you finish at) a public school?" },
    { key: "firstGeneration", q: "Would you be the first in your family to attend university?" },
    { key: "hasSchoolLetter", q: "Can a teacher or counselor write a short supporting letter?" },
  ];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Eligibility questionnaire"
      footer={
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            onResult({ country, category, profile });
            onClose();
          }}
        >
          Show my matches
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="q-country" className="label">
              Country
            </label>
            <select id="q-country" className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="q-cat" className="label">
              Opportunity type
            </label>
            <select id="q-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value as OpportunityCategory | "")}>
              <option value="">Any</option>
              {OPP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {OPP_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {Q.map((q) => (
          <fieldset key={q.key} className="flex flex-col gap-2 border-b border-line/20 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <legend className="sr-only">{q.q}</legend>
            <span className="text-sm" aria-hidden>
              {q.q}
            </span>
            <div className="flex shrink-0 gap-1">
              {[true, false].map((v) => (
                <button key={String(v)} type="button" aria-pressed={profile[q.key] === v} onClick={() => setProfile({ ...profile, [q.key]: v })} className={`btn btn-sm ${profile[q.key] === v ? "bg-forest text-onforest" : "bg-surface"}`}>
                  {v ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <p className="flex gap-2 text-xs text-muted">
          <Info size={14} className="shrink-0" /> Answers stay in your browser. Matches are indicative only — final eligibility is always confirmed by the institution offering the waiver.
        </p>
      </div>
    </Modal>
  );
}

function WaiversInner() {
  const { state } = useStore();
  const params = useSearchParams();
  const focus = params.get("w");
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("All");
  const [category, setCategory] = useState<OpportunityCategory | "All">("All");
  const [kind, setKind] = useState<"All" | Waiver["kind"]>("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [answers, setAnswers] = useState<{ country: string; category: OpportunityCategory | ""; profile: EligibilityProfile } | null>(null);
  const countries = ["All", "Global", ...new Set(state.institutions.map((i) => i.country).sort())];
  const deadlineOf = (w: Waiver) => isoDaysFromNow(w.deadlineDays, new Date(state.seededAt));

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return WAIVERS.filter((w) => {
      if (t && !`${w.name} ${w.provider} ${w.eligibility.join(" ")}`.toLowerCase().includes(t)) return false;
      if (country !== "All" && !(w.countries.includes(country) || (country !== "Global" && w.countries.includes("Global")))) return false;
      if (category !== "All" && !w.categories.includes(category)) return false;
      if (kind !== "All" && w.kind !== kind) return false;
      if (savedOnly && !state.savedWaivers.includes(w.id)) return false;
      if (answers) {
        if (!(w.countries.includes("Global") || w.countries.includes(answers.country))) return false;
        if (answers.category && !w.categories.includes(answers.category)) return false;
      }
      return true;
    }).sort((a, b) => a.deadlineDays - b.deadlineDays);
  }, [q, country, category, kind, savedOnly, answers, state.savedWaivers]);

  const matchOf = (w: Waiver) => {
    if (!answers) return undefined;
    const ok = meetsRequirements(answers.profile, w.requires);
    const missing = requirementReasons(Object.fromEntries(Object.entries(w.requires).filter(([k, v]) => v && !answers.profile[k as keyof EligibilityProfile])));
    return { ok, missing };
  };

  return (
    <>
      <PageActions onQuiz={() => setQuizOpen(true)} />
      <div className="mb-4 flex flex-col gap-3 border-2 border-line bg-surface p-3 lg:flex-row lg:items-end">
        <div className="relative flex-1">
          <label htmlFor="wq" className="label">
            Search
          </label>
          <Search size={14} className="pointer-events-none absolute bottom-3 left-3 text-muted" aria-hidden />
          <input id="wq" className="input pl-8" value={q} onChange={(e) => setQ(e.target.value)} placeholder="exam, application, transcript…" />
        </div>
        <div>
          <label htmlFor="wc" className="label">
            Country
          </label>
          <select id="wc" className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="wcat" className="label">
            Opportunity
          </label>
          <select id="wcat" className="input" value={category} onChange={(e) => setCategory(e.target.value as OpportunityCategory | "All")}>
            <option value="All">All categories</option>
            {OPP_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {OPP_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="wk" className="label">
            Type
          </label>
          <select id="wk" className="input" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
            <option value="All">All types</option>
            <option value="waiver">Fee waivers</option>
            <option value="discount">Discounts</option>
            <option value="institutional">Institutional</option>
          </select>
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} className="h-4 w-4 accent-[#294C3D]" /> Saved only ({state.savedWaivers.length})
        </label>
      </div>

      {answers && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-2 border-line bg-sage/40 p-3 text-sm">
          <span>
            Showing matches for <strong>{answers.country}</strong>
            {answers.category && (
              <>
                {" "}
                · <strong>{OPP_CATEGORY_LABEL[answers.category]}</strong>
              </>
            )}{" "}
            — {list.filter((w) => matchOf(w)?.ok).length} likely eligible
          </span>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setAnswers(null)}>
            Clear questionnaire
          </button>
        </div>
      )}

      <p className="mb-3 text-sm text-muted" aria-live="polite">
        {list.length} result{list.length === 1 ? "" : "s"}
      </p>
      {list.length === 0 ? (
        <EmptyState title="No waivers match" body="Try a different country or category, or clear your filters." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((w) => (
            <WaiverCard key={w.id} w={w} deadline={deadlineOf(w)} match={matchOf(w)} defaultOpen={focus === w.id} />
          ))}
        </div>
      )}

      <Questionnaire open={quizOpen} onClose={() => setQuizOpen(false)} onResult={setAnswers} />
    </>
  );
}

function PageActions({ onQuiz }: { onQuiz: () => void }) {
  return (
    <div className="mb-4 flex flex-col items-start gap-3 border-2 border-dashed border-line/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">
        <strong>Not sure what you qualify for?</strong> <span className="text-muted">Answer four yes/no questions to see likely matches.</span>
      </p>
      <button type="button" className="btn-gold" onClick={onQuiz}>
        <ClipboardCheck size={16} /> Take the eligibility questionnaire
      </button>
    </div>
  );
}

export default function WaiversPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        kicker="Fee waiver finder"
        title="Fees you may not have to pay"
        description="A searchable directory of waivers, reductions and institutional programmes. Final eligibility must always be confirmed by the institution offering it."
        actions={<DemoLabel>Simulated directory entries</DemoLabel>}
      />
      <Suspense>
        <WaiversInner />
      </Suspense>
    </div>
  );
}
