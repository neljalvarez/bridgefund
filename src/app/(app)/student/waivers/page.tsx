"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, CalendarClock, ChevronDown, ClipboardCheck, Clock, Info, RotateCcw, Search } from "lucide-react";
import type { EducationLevel, EligibilityProfile, OpportunityCategory, Waiver } from "@/lib/types";
import { useStore } from "@/lib/store";
import { setEligibility, toggleSavedWaiver } from "@/lib/actions";
import { WAIVERS } from "@/lib/knowledge";
import { meetsRequirements, requirementReasons } from "@/lib/engine";
import { currentStudent } from "@/lib/selectors";
import { LEVEL_LABEL, OPP_CATEGORIES, OPP_LABEL, fmtDate, isoDaysFromNow, relDays } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DemoBadge, EmptyState, PageHeader } from "@/components/shared/kit";

const ALL = "all";
const savingsText = (w: Waiver) => (w.savingsType === "fixed" ? `$${w.savings} off` : w.savings === 100 ? `Full fee${w.maxSavings ? ` (up to $${w.maxSavings})` : ""}` : `${w.savings}% off${w.maxSavings ? ` (max $${w.maxSavings})` : ""}`);
const savingsValue = (w: Waiver) => (w.savingsType === "fixed" ? w.savings : w.maxSavings ?? w.savings);
const KIND = { waiver: "Fee waiver", discount: "Discount", institutional: "Institutional" } as const;

type Assessment = { status: "likely" | "check" | "unavailable"; notes: string[] };

function assess(w: Waiver, country: string, level: EducationLevel, profile: EligibilityProfile): Assessment {
  if (!w.countries.includes("Global") && !w.countries.includes(country)) return { status: "unavailable", notes: [`Only offered in ${w.countries.join(", ")}`] };
  const notes: string[] = [];
  if (!w.levels.includes(level)) notes.push(`Intended for ${w.levels.map((l) => LEVEL_LABEL[l].toLowerCase()).join(", ")} students`);
  const missing = Object.fromEntries(Object.entries(w.requires).filter(([k, v]) => v && !profile[k as keyof EligibilityProfile]));
  notes.push(...requirementReasons(missing).map((r) => `Requires that ${r}`));
  return { status: notes.length === 0 && meetsRequirements(profile, w.requires) ? "likely" : "check", notes };
}

function WaiverCard({ w, assessment, open: initial, deadline }: { w: Waiver; assessment?: Assessment; open?: boolean; deadline: string }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(!!initial);
  const saved = state.savedWaivers.includes(w.id);
  return (
    <Card id={w.id} className={cn("overflow-hidden", initial && "ring-2 ring-primary/40")}>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="neutral">{KIND[w.kind]}</Badge>
          {w.categories.slice(0, 2).map((c) => (
            <Badge key={c} variant="outline">
              {OPP_LABEL[c]}
            </Badge>
          ))}
          {assessment && (
            <Badge variant={assessment.status === "likely" ? "success" : assessment.status === "check" ? "warning" : "neutral"}>
              {assessment.status === "likely" ? "Likely eligible" : assessment.status === "check" ? "Check requirements" : "Not in your country"}
            </Badge>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-medium">{w.name}</h3>
            <p className="text-sm text-muted-foreground">
              {w.provider} · {w.countries.join(", ")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-semibold text-primary">{savingsText(w)}</p>
            <p className="mt-0.5 flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <CalendarClock className="h-3 w-3" /> by {fmtDate(deadline)} · {relDays(deadline)}
            </p>
          </div>
        </div>
        {assessment && assessment.notes.length > 0 && (
          <ul className="mt-3 space-y-0.5 text-xs text-muted-foreground">
            {assessment.notes.map((n) => (
              <li key={n} className="flex gap-1.5">
                <Info className="mt-0.5 h-3 w-3 shrink-0" /> {n}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-between border-t px-5 py-2.5">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setOpen(!open)} aria-expanded={open}>
          Details and how to apply <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
        </Button>
        <Button variant={saved ? "soft" : "outline"} size="sm" aria-pressed={saved} onClick={() => dispatch(toggleSavedWaiver(w.id), { info: saved ? "Removed from saved" : "Saved — the deadline is on your tracker" })}>
          {saved ? <BookmarkCheck /> : <Bookmark />} {saved ? "Saved" : "Save"}
        </Button>
      </div>
      {open && (
        <div className="grid gap-5 border-t bg-muted/30 p-5 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Eligibility requirements</p>
            <ul className="space-y-1">
              {w.eligibility.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Required documents</p>
            <ul className="space-y-1">
              {w.documents.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Application instructions</p>
            <ol className="list-decimal space-y-1 pl-4">
              {w.instructions.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ol>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> Processing {w.processingDays ? `~${w.processingDays} days` : "instant"}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

function Finder() {
  const { state, dispatch } = useStore();
  const student = currentStudent(state);
  const focus = useSearchParams().get("w");
  const [q, setQ] = useState("");
  const [country, setCountry] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [level, setLevel] = useState(ALL);
  const [elig, setElig] = useState(ALL);
  const [within, setWithin] = useState(ALL);
  const [minSave, setMinSave] = useState(ALL);
  const [savedOnly, setSavedOnly] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [profile, setProfile] = useState<{ country: string; level: EducationLevel; elig: EligibilityProfile } | null>(null);
  const [draft, setDraft] = useState({ country: student.country, level: student.level, elig: student.eligibility });
  const countries = [...new Set(state.institutions.map((i) => i.country))].sort();
  const deadlineOf = (w: Waiver) => isoDaysFromNow(w.deadlineDays, new Date(state.seededAt));

  const list = useMemo(
    () =>
      WAIVERS.filter((w) => {
        if (q && !`${w.name} ${w.provider} ${w.eligibility.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (country !== ALL && !(w.countries.includes(country) || w.countries.includes("Global"))) return false;
        if (category !== ALL && !w.categories.includes(category as OpportunityCategory)) return false;
        if (level !== ALL && !w.levels.includes(level as EducationLevel)) return false;
        if (elig === "none" && Object.values(w.requires).some(Boolean)) return false;
        if (elig !== ALL && elig !== "none" && !w.requires[elig as keyof EligibilityProfile]) return false;
        if (within !== ALL && w.deadlineDays > Number(within)) return false;
        if (minSave !== ALL && savingsValue(w) < Number(minSave)) return false;
        if (savedOnly && !state.savedWaivers.includes(w.id)) return false;
        return true;
      }).sort((a, b) => a.deadlineDays - b.deadlineDays),
    [q, country, category, level, elig, within, minSave, savedOnly, state.savedWaivers],
  );

  const clear = () => {
    setQ("");
    setCountry(ALL);
    setCategory(ALL);
    setLevel(ALL);
    setElig(ALL);
    setWithin(ALL);
    setMinSave(ALL);
    setSavedOnly(false);
  };

  const sel = (label: string, value: string, set: (v: string) => void, opts: [string, string][]) => (
    <div className="min-w-[150px] flex-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={set}>
        <SelectTrigger className="mt-1.5" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {opts.map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const likely = profile ? list.filter((w) => assess(w, profile.country, profile.level, profile.elig).status === "likely").length : 0;

  return (
    <>
      <Card className="mb-4 flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium">Personalised eligibility assessment</p>
          <p className="text-sm text-muted-foreground">{profile ? `${likely} waiver${likely === 1 ? "" : "s"} look likely for you in ${profile.country}. Eligibility is never guaranteed — the provider decides.` : "Answer a few private questions to see which waivers you may qualify for."}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {profile && (
            <Button variant="ghost" onClick={() => setProfile(null)}>
              Clear assessment
            </Button>
          )}
          <Button onClick={() => setQuiz(true)}>
            <ClipboardCheck /> {profile ? "Update answers" : "Check my eligibility"}
          </Button>
        </div>
      </Card>

      <Card className="mb-5 space-y-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search waivers" className="pl-9" placeholder="Search by name, organisation or requirement…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3">
          {sel("Country", country, setCountry, [[ALL, "All countries"], ...countries.map((c) => [c, c] as [string, string])])}
          {sel("Opportunity type", category, setCategory, [[ALL, "All types"], ...OPP_CATEGORIES.map((c) => [c, OPP_LABEL[c]] as [string, string])])}
          {sel("Educational level", level, setLevel, [[ALL, "All levels"], ...(Object.keys(LEVEL_LABEL) as EducationLevel[]).map((l) => [l, LEVEL_LABEL[l]] as [string, string])])}
          {sel("Eligibility", elig, setElig, [[ALL, "Any"], ["none", "No special requirements"], ["lowIncome", "Low-income"], ["publicSchool", "Public school"], ["hasSchoolLetter", "School letter"]])}
          {sel("Deadline", within, setWithin, [[ALL, "Any time"], ["14", "Within 14 days"], ["30", "Within 30 days"], ["60", "Within 60 days"]])}
          {sel("Estimated savings", minSave, setMinSave, [[ALL, "Any amount"], ["25", "$25 or more"], ["50", "$50 or more"]])}
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={savedOnly} onCheckedChange={setSavedOnly} /> Saved only ({state.savedWaivers.length})
          </label>
          <Button variant="ghost" size="sm" onClick={clear}>
            <RotateCcw /> Reset filters
          </Button>
        </div>
      </Card>

      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
        {list.length} result{list.length === 1 ? "" : "s"}
      </p>
      {list.length === 0 ? (
        <EmptyState title="No waivers match" description="Try another country or opportunity type, or reset the filters." action={<Button variant="outline" onClick={clear}>Reset filters</Button>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((w) => (
            <WaiverCard key={w.id} w={w} deadline={deadlineOf(w)} open={focus === w.id} assessment={profile ? assess(w, profile.country, profile.level, profile.elig) : undefined} />
          ))}
        </div>
      )}

      <Dialog open={quiz} onOpenChange={setQuiz}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eligibility assessment</DialogTitle>
            <DialogDescription>Your answers stay in this browser. Results are indicative only and never guarantee eligibility.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Country</Label>
              <Select value={draft.country} onValueChange={(v) => setDraft({ ...draft, country: v })}>
                <SelectTrigger className="mt-1.5" aria-label="Country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Educational level</Label>
              <Select value={draft.level} onValueChange={(v) => setDraft({ ...draft, level: v as EducationLevel })}>
                <SelectTrigger className="mt-1.5" aria-label="Educational level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LEVEL_LABEL) as EducationLevel[]).map((l) => (
                    <SelectItem key={l} value={l}>
                      {LEVEL_LABEL[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            {(
              [
                ["lowIncome", "My household income is below the local low-income threshold"],
                ["publicSchool", "I attend (or graduated from) a public school"],
                ["firstGeneration", "I'd be the first in my family at university"],
                ["hasSchoolLetter", "A teacher or counselor can write a supporting letter"],
              ] as [keyof EligibilityProfile, string][]
            ).map(([k, l]) => (
              <label key={k} className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5 text-sm">
                {l}
                <Switch checked={draft.elig[k]} onCheckedChange={(v) => setDraft({ ...draft, elig: { ...draft.elig, [k]: v } })} />
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setProfile(draft);
                dispatch(setEligibility(draft.elig));
                setCountry(ALL);
                setQuiz(false);
              }}
            >
              Show my results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function WaiversPage() {
  return (
    <>
      <PageHeader title="Fee waivers" description="Waivers and discounts you may qualify for." actions={<DemoBadge>Simulated directory</DemoBadge>} />
      <Suspense>
        <Finder />
      </Suspense>
    </>
  );
}
