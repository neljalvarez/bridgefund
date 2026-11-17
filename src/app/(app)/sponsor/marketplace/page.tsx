"use client";

import { EMIRATES } from "@/lib/uae";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { PieChart, RotateCcw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { OpportunityCategory } from "@/lib/types";
import { useStore } from "@/lib/store";
import { remainingOf } from "@/lib/actions";
import { oppOf, studentOf } from "@/lib/selectors";
import { OPP_CATEGORIES, OPP_LABEL, daysUntil, urgencyOf, aed } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoBadge, EmptyState, PageHeader } from "@/components/shared/kit";
import { NeedCard } from "@/components/sponsor/NeedCard";

const ALL = "all";

export default function MarketplacePage() {
  const { state } = useStore();
  const [category, setCategory] = useState<string>(ALL);
  const [country, setCountry] = useState(ALL);
  const [institution, setInstitution] = useState(ALL);
  const [urgency, setUrgency] = useState(ALL);
  const [maxGap, setMaxGap] = useState(200);
  const [within, setWithin] = useState(60);
  const [sort, setSort] = useState("deadline");
  const [savedOnly, setSavedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Needs seen during this visit stay visible after they are fully funded, so the sponsor sees the result.
  const seen = useRef(new Set<string>());
  const pool = state.requests.filter((r) => seen.current.has(r.id) || (["Verified", "Partially Funded"].includes(r.status) && daysUntil(r.deadline) >= 0));
  pool.forEach((r) => seen.current.add(r.id));

  const countries = [...EMIRATES].filter((e) => pool.some((r) => studentOf(state, r.studentId)?.emirate === e));
  const insts = [...new Set(pool.map((r) => r.institutionId))];

  const list = useMemo(() => {
    const xs = pool.filter((r) => {
      const st = studentOf(state, r.studentId);
      if (category !== ALL && oppOf(state, r.opportunityId)?.category !== category) return false;
      if (country !== ALL && st?.emirate !== country) return false;
      if (institution !== ALL && r.institutionId !== institution) return false;
      if (urgency !== ALL && urgencyOf(r.deadline).label !== urgency) return false;
      if (remainingOf(r) > maxGap) return false;
      if (daysUntil(r.deadline) > within) return false;
      if (savedOnly && !state.savedNeeds.includes(r.id)) return false;
      return true;
    });
    return xs.sort((a, b) => (sort === "deadline" ? a.deadline.localeCompare(b.deadline) : sort === "small" ? remainingOf(a) - remainingOf(b) : remainingOf(b) - remainingOf(a)));
  }, [pool, state, category, country, institution, urgency, maxGap, within, sort, savedOnly]);

  const clear = () => {
    setCategory(ALL);
    setCountry(ALL);
    setInstitution(ALL);
    setUrgency(ALL);
    setMaxGap(200);
    setWithin(60);
    setSavedOnly(false);
  };

  const sel = (label: string, value: string, set: (v: string) => void, options: [string, string][]) => (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={set}>
        <SelectTrigger className="mt-1.5" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Opportunity marketplace"
        description="Checked by schools and already reduced by savings. You fund only what remains."
        actions={
          <>
            <DemoBadge>Fictional students</DemoBadge>
            <Button asChild>
              <Link href="/sponsor/allocate">
                <PieChart /> Impact planner
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <Button variant="outline" className="w-full lg:hidden" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}>
            <SlidersHorizontal /> {showFilters ? "Hide filters" : "Show filters"}
          </Button>
          <Card className={`space-y-4 p-4 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Filters</p>
              <Button variant="ghost" size="sm" onClick={clear}>
                <RotateCcw /> Clear
              </Button>
            </div>
            {sel("Educational category", category, setCategory, [[ALL, "All categories"], ...OPP_CATEGORIES.map((c) => [c, OPP_LABEL[c as OpportunityCategory]] as [string, string])])}
            {sel("Emirate", country, setCountry, [[ALL, "All emirates"], ...countries.map((c) => [c, c] as [string, string])])}
            {sel("Institution", institution, setInstitution, [[ALL, "All institutions"], ...insts.map((i) => [i, state.institutions.find((x) => x.id === i)?.name ?? i] as [string, string])])}
            {sel("Urgency", urgency, setUrgency, [[ALL, "Any urgency"], ["Critical", "Critical (≤7 days)"], ["High", "High (≤14 days)"], ["Moderate", "Moderate (≤30 days)"], ["Low", "Low"]])}
            <div>
              <Label className="text-xs text-muted-foreground">Financial gap up to {aed(maxGap)}</Label>
              <Slider className="mt-3" min={10} max={200} step={5} value={[maxGap]} onValueChange={([v]) => setMaxGap(v)} aria-label="Maximum financial gap" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Deadline within {within} days</Label>
              <Slider className="mt-3" min={3} max={60} step={1} value={[within]} onValueChange={([v]) => setWithin(v)} aria-label="Deadline within days" />
            </div>
            <label className="flex items-center justify-between gap-2 text-sm">
              Saved only ({state.savedNeeds.length})
              <Switch checked={savedOnly} onCheckedChange={setSavedOnly} />
            </label>
          </Card>
          <p className="flex gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> Students are never ranked by popularity. Personal circumstances stay with the verifying institution.
          </p>
        </aside>
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {list.length} verified need{list.length === 1 ? "" : "s"}
            </p>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[220px]" aria-label="Sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Deadline: soonest first</SelectItem>
                <SelectItem value="small">Remaining: smallest first</SelectItem>
                <SelectItem value="large">Remaining: largest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {list.length === 0 ? (
            <EmptyState title="No needs match these filters" description="Widen the gap or deadline range, or clear filters." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {list.map((r) => (
                <NeedCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
