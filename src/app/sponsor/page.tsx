"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useRef, useState } from "react";
import { Compass, Filter, PiggyBank, ShieldCheck } from "lucide-react";
import type { OpportunityCategory } from "@/lib/types";
import { useStore } from "@/lib/store";
import { contributeToPool, remainingOf } from "@/lib/actions";
import { oppOf, studentOf } from "@/lib/selectors";
import { OPP_CATEGORY_LABEL, daysUntil, sum, urgencyOf, usd } from "@/lib/format";
import { DemoLabel, EmptyState, PageHeader, Stat } from "@/components/ui/primitives";
import { NeedCard } from "@/components/sponsor/NeedCard";
import { Window } from "@/components/ui/Window";

function PoolBox() {
  const { state, dispatch } = useStore();
  const [amount, setAmount] = useState("50");
  const v = Number(amount);
  const err = !(v > 0) ? "Enter an amount." : v > state.sponsor.balance ? "More than your demo balance." : null;
  return (
    <Window title="Shared funding pool" icon={<PiggyBank size={14} />} tone="gold">
      <p className="text-sm text-muted">Not sure who to support? Add to the pool and verifying institutions allocate it to the most urgent verified needs.</p>
      <p className="mt-2 text-sm">
        Pool balance: <span className="font-pixel text-lg">{usd(state.pool)}</span>
      </p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (err) return;
          dispatch(contributeToPool(v), { toast: { title: `${usd(v)} added to the shared pool`, tone: "success" }, sound: "coin" });
        }}
      >
        <label htmlFor="pool-amt" className="sr-only">
          Amount
        </label>
        <input id="pool-amt" className="input font-pixel" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={!!err} />
        <button className="btn-primary shrink-0" disabled={!!err}>
          Add to pool
        </button>
      </form>
      {err && amount && <p className="mt-1 text-xs text-terraink">{err}</p>}
    </Window>
  );
}

function Marketplace() {
  const { state } = useStore();
  const params = useSearchParams();
  const focus = params.get("focus");
  const [category, setCategory] = useState<OpportunityCategory | "all">("all");
  const [country, setCountry] = useState("all");
  const [institution, setInstitution] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [maxGap, setMaxGap] = useState(200);
  const [within, setWithin] = useState(60);
  const [sort, setSort] = useState<"deadline" | "small" | "large">("deadline");
  const [showFunded, setShowFunded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Needs shown during this visit stay visible after they become fully funded, so the sponsor sees the result.
  const seen = useRef(new Set<string>());
  const pool = state.requests.filter(
    (r) => seen.current.has(r.id) || (["Verified", "Partially Funded", ...(showFunded ? ["Fully Funded", "Completed"] : [])].includes(r.status) && daysUntil(r.deadline) >= (showFunded ? -60 : 0)),
  );
  pool.filter((r) => ["Verified", "Partially Funded"].includes(r.status)).forEach((r) => seen.current.add(r.id));
  const countries = [...new Set(pool.map((r) => studentOf(state, r.studentId)?.country ?? ""))].sort();
  const insts = [...new Set(pool.map((r) => studentOf(state, r.studentId)?.institutionId ?? ""))];

  const list = useMemo(() => {
    const xs = pool.filter((r) => {
      const st = studentOf(state, r.studentId);
      const opp = oppOf(state, r.opportunityId);
      if (category !== "all" && opp?.category !== category) return false;
      if (country !== "all" && st?.country !== country) return false;
      if (institution !== "all" && st?.institutionId !== institution) return false;
      if (urgency !== "all" && urgencyOf(r.deadline).label !== urgency) return false;
      if (remainingOf(r) > maxGap) return false;
      if (daysUntil(r.deadline) > within) return false;
      return true;
    });
    return xs.sort((a, b) => (sort === "deadline" ? a.deadline.localeCompare(b.deadline) : sort === "small" ? remainingOf(a) - remainingOf(b) : remainingOf(b) - remainingOf(a)));
  }, [pool, state, category, country, institution, urgency, maxGap, within, sort]);

  const active = state.requests.filter((r) => ["Verified", "Partially Funded"].includes(r.status) && daysUntil(r.deadline) >= 0);
  const myGiving = sum(state.contributions.filter((c) => c.sponsorName === state.sponsor.name).map((c) => c.amount));

  const filters = (
    <div className="space-y-4">
      <div>
        <label htmlFor="f-cat" className="label">
          Educational category
        </label>
        <select id="f-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value as OpportunityCategory | "all")}>
          <option value="all">All categories</option>
          {Object.entries(OPP_CATEGORY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-country" className="label">
          Country
        </label>
        <select id="f-country" className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="all">All countries</option>
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-inst" className="label">
          Institution
        </label>
        <select id="f-inst" className="input" value={institution} onChange={(e) => setInstitution(e.target.value)}>
          <option value="all">All institutions</option>
          {insts.map((i) => (
            <option key={i} value={i}>
              {state.institutions.find((x) => x.id === i)?.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-urg" className="label">
          Urgency
        </label>
        <select id="f-urg" className="input" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
          <option value="all">Any urgency</option>
          {["Critical", "High", "Moderate", "Low"].map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-gap" className="label">
          Remaining gap up to {usd(maxGap)}
        </label>
        <input id="f-gap" type="range" min={10} max={200} step={5} value={maxGap} onChange={(e) => setMaxGap(Number(e.target.value))} className="w-full accent-[#294C3D]" />
      </div>
      <div>
        <label htmlFor="f-within" className="label">
          Deadline within {within} days
        </label>
        <input id="f-within" type="range" min={3} max={60} value={within} onChange={(e) => setWithin(Number(e.target.value))} className="w-full accent-[#294C3D]" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showFunded} onChange={(e) => setShowFunded(e.target.checked)} className="h-4 w-4 accent-[#294C3D]" /> Include fully funded & completed
      </label>
      <button
        type="button"
        className="btn-ghost btn-sm w-full"
        onClick={() => {
          setCategory("all");
          setCountry("all");
          setInstitution("all");
          setUrgency("all");
          setMaxGap(200);
          setWithin(60);
          setShowFunded(false);
        }}
      >
        Clear filters
      </button>
    </div>
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Your demo balance" value={state.sponsor.balance} tone="forest" hint={`of ${usd(state.sponsor.startingBalance)} simulated funds`} />
        <Stat label="You've contributed" value={myGiving} tone="terra" />
        <Stat label="Open verified needs" value={String(active.length)} money={false} />
        <Stat label="Total remaining gap" value={sum(active.map(remainingOf))} hint="Across all open verified needs" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className="space-y-6">
          <div className="lg:hidden">
            <button type="button" className="btn-ghost w-full" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>
              <Filter size={14} /> {filtersOpen ? "Hide filters" : "Show filters"}
            </button>
          </div>
          <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
            <Window title="Filters" icon={<Filter size={14} />}>
              {filters}
            </Window>
          </div>
          <PoolBox />
          <div className="panel-flat flex gap-2 bg-sage/40 p-3 text-xs">
            <ShieldCheck size={16} className="shrink-0" />
            <p>Every need is verified by the student&apos;s school or nonprofit. Personal financial details are never shown. There are no rankings or popularity contests between students.</p>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              {list.length} verified need{list.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-xs font-semibold uppercase tracking-wider text-muted">
                Sort
              </label>
              <select id="sort" className="input w-auto py-1" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                <option value="deadline">Deadline (soonest)</option>
                <option value="small">Smallest remaining gap</option>
                <option value="large">Largest remaining gap</option>
              </select>
            </div>
          </div>
          {list.length === 0 ? (
            <EmptyState title="No needs match these filters" body="Widen the gap or deadline range, or clear filters." />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {list.map((r) => (
                <NeedCard key={r.id} request={r} highlight={focus === r.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SponsorPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        kicker="Sponsor · Juniper Demo Fund"
        title="Verified needs, exact amounts"
        description="Each need has already been reduced by waivers, free alternatives and borrowed equipment. You only see — and fund — what's left."
        actions={
          <>
            <DemoLabel>Fictional students & simulated payments</DemoLabel>
            <Link href="/sponsor/allocate" className="btn-primary">
              <Compass size={16} /> Smart impact allocation
            </Link>
          </>
        }
      />
      <Suspense>
        <Marketplace />
      </Suspense>
    </div>
  );
}
