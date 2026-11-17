"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Info, RotateCcw, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { fundRequest, remainingOf } from "@/lib/actions";
import { suggestAllocation, rankNeeds } from "@/lib/allocation";
import { oppOf, studentOf, verifiedNeeds } from "@/lib/selectors";
import { fmtDate, relDays, urgencyOf, usd } from "@/lib/format";
import { EmptyState, PageHeader, Stat, UrgencyBadge } from "@/components/ui/primitives";
import { Window } from "@/components/ui/Window";

export default function AllocatePage() {
  const { state, dispatch } = useStore();
  const [budgetText, setBudgetText] = useState(String(Math.min(500, state.sponsor.balance)));
  const budget = Math.max(0, Number(budgetText) || 0);
  const [needs] = useState(() => verifiedNeeds(state)); // freeze the list while editing
  const allocNeeds = needs.map((r) => ({ id: r.id, ref: r.ref, label: r.purpose, amount: r.amount, funded: r.funded, deadline: r.deadline }));
  const suggestion = useMemo(() => suggestAllocation(allocNeeds, budget, new Date()), [budget]); // eslint-disable-line react-hooks/exhaustive-deps
  const ranked = useMemo(() => rankNeeds(allocNeeds, new Date()), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [confirmed, setConfirmed] = useState<{ ref: string; amount: number }[] | null>(null);

  useEffect(() => {
    setAmounts(Object.fromEntries(suggestion.items.map((i) => [i.needId, i.amount])));
  }, [suggestion]);

  const total = Object.values(amounts).reduce((a, b) => a + (b || 0), 0);
  const overBudget = total > budget + 0.001;
  const overBalance = budget > state.sponsor.balance;
  const fullyCovered = needs.filter((r) => (amounts[r.id] ?? 0) >= remainingOf(r) && remainingOf(r) > 0).length;
  const edited = suggestion.items.some((i) => amounts[i.needId] !== i.amount) || Object.entries(amounts).some(([k, v]) => v > 0 && !suggestion.items.find((i) => i.needId === k));

  const confirm = () => {
    const done: { ref: string; amount: number }[] = [];
    Object.entries(amounts).forEach(([id, amt]) => {
      if (amt > 0) {
        dispatch(fundRequest(id, amt, "sponsor"));
        done.push({ ref: needs.find((n) => n.id === id)!.ref, amount: amt });
      }
    });
    setConfirmed(done);
    dispatch((s) => s, { toast: { title: `${usd(total)} allocated across ${done.length} needs`, body: "Verifying institutions will confirm each disbursement.", tone: "success" }, sound: "unlock" });
  };

  if (confirmed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Window title="Allocation confirmed" tone="forest">
          <p className="font-pixel text-2xl">
            {usd(confirmed.reduce((a, b) => a + b.amount, 0))} committed to {confirmed.length} verified needs
          </p>
          <ul className="mt-4 divide-y divide-line/20 text-sm">
            {confirmed.map((c) => (
              <li key={c.ref} className="flex justify-between py-1.5">
                <span>{c.ref}</span>
                <span className="font-pixel">{usd(c.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 text-xs text-muted">
            <ShieldCheck size={14} className="shrink-0" /> Each verifying institution keeps final approval and pays providers directly. You&apos;ll get an impact receipt for every contribution.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/sponsor/contributions" className="btn-primary">
              View my impact receipts
            </Link>
            <Link href="/sponsor" className="btn-ghost">
              Back to verified needs
            </Link>
          </div>
        </Window>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        kicker="Smart impact allocation"
        title="How far can your budget go?"
        description="A transparent suggestion for spreading a fixed contribution across verified needs — ranked by deadline urgency, the amount needed to finish each request, and existing assistance. Adjust anything before you confirm."
      />

      {needs.length === 0 ? (
        <EmptyState title="No open verified needs right now" body="Check back after institutions verify new requests." />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
            <Window title="Your budget">
              <label htmlFor="budget" className="label">
                Amount to allocate (USD)
              </label>
              <input id="budget" inputMode="decimal" className="input font-pixel text-2xl" value={budgetText} onChange={(e) => setBudgetText(e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={overBalance} />
              <p className={`mt-1 text-xs ${overBalance ? "font-semibold text-terraink" : "text-muted"}`}>
                {overBalance ? `Exceeds your demo balance of ${usd(state.sponsor.balance)}.` : `Demo balance: ${usd(state.sponsor.balance)}`}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[100, 250, 500].map((v) => (
                  <button key={v} type="button" className="btn-ghost btn-sm" onClick={() => setBudgetText(String(Math.min(v, state.sponsor.balance)))}>
                    {usd(v)}
                  </button>
                ))}
              </div>
              <div className="mt-4 border-t-2 border-line/20 pt-3 text-xs text-muted">
                <p className="font-semibold text-ink">Ranking rules</p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                  <li>Deadline urgency</li>
                  <li>Smallest amount to complete a request</li>
                  <li>Existing assistance already secured</li>
                </ol>
                <p className="mt-2">Leftover money goes to the next most urgent need as partial support.</p>
              </div>
            </Window>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Needs fully covered" value={String(fullyCovered)} money={false} tone="forest" />
                <Stat label="Total allocated" value={total} />
                <Stat label="Remaining balance" value={Math.max(budget - total, 0)} hint="Of this budget" />
              </div>

              <Window
                title="Suggested allocation"
                tone="ink"
                actions={
                  edited && (
                    <button type="button" className="flex items-center gap-1 text-xs hover:underline" onClick={() => setAmounts(Object.fromEntries(suggestion.items.map((i) => [i.needId, i.amount])))}>
                      <RotateCcw size={12} /> Reset to suggestion
                    </button>
                  )
                }
                bodyClassName="p-0"
              >
                <ul className="divide-y-2 divide-line/15">
                  {ranked.map((r, idx) => {
                    const need = needs.find((n) => n.id === r.need.id)!;
                    const st = studentOf(state, need.studentId);
                    const opp = oppOf(state, need.opportunityId);
                    const item = suggestion.items.find((i) => i.needId === need.id);
                    const amt = amounts[need.id] ?? 0;
                    const completes = amt >= r.remaining;
                    return (
                      <li key={need.id} className={`grid gap-3 p-4 md:grid-cols-[2rem_1fr_9rem] md:items-start ${amt > 0 ? "" : "opacity-70"}`}>
                        <span className="font-pixel text-xl text-muted">#{idx + 1}</span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{need.ref}</span>
                            <UrgencyBadge label={urgencyOf(need.deadline).label} />
                            {amt > 0 && completes && (
                              <span className="chip bg-forest text-onforest">
                                <Check size={10} /> Completes request
                              </span>
                            )}
                          </div>
                          <p className="font-semibold">{need.purpose}</p>
                          <p className="text-xs text-muted">
                            {st?.firstName} · {st?.country} · {opp ? `due ${fmtDate(need.deadline)} (${relDays(need.deadline)})` : ""} · {usd(r.remaining)} remaining
                            {need.funded > 0 && ` · ${usd(need.funded)} already secured`}
                          </p>
                          {item ? (
                            <ul className="mt-1.5 space-y-0.5 text-xs">
                              {item.reasons.map((reason) => (
                                <li key={reason} className="flex gap-1.5">
                                  <Info size={12} className="mt-0.5 shrink-0 text-forest" /> {reason}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1.5 text-xs text-muted">Not included — budget used on higher-ranked needs. You can add an amount manually.</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor={`amt-${need.id}`} className="sr-only">
                            Amount for {need.ref}
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                            <input
                              id={`amt-${need.id}`}
                              inputMode="decimal"
                              className="input pl-5 text-right font-pixel text-lg"
                              value={amt || ""}
                              placeholder="0"
                              onChange={(e) => {
                                const v = Math.min(Number(e.target.value.replace(/[^\d.]/g, "")) || 0, r.remaining);
                                setAmounts({ ...amounts, [need.id]: v });
                              }}
                            />
                          </div>
                          <button type="button" className="mt-1 text-[11px] font-semibold text-forest hover:underline" onClick={() => setAmounts({ ...amounts, [need.id]: r.remaining })}>
                            Cover fully ({usd(r.remaining)})
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Window>

              <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex gap-2 text-xs text-muted">
                  <ShieldCheck size={16} className="shrink-0 text-forest" /> Verifying institutions retain final approval authority and pay providers directly. Simulated payment — no real money moves.
                </p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {overBudget && <p className="text-xs font-semibold text-terraink">Allocated {usd(total)} exceeds the budget of {usd(budget)}.</p>}
                  <button type="button" className="btn-primary" disabled={overBudget || overBalance || total <= 0} onClick={confirm}>
                    Confirm {usd(total)} allocation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
