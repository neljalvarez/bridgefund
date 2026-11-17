"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Crown, Download, Plus, Trash2 } from "lucide-react";
import type { CalculatorScenario, ExpenseCategory, OpportunityCategory } from "@/lib/types";
import { useStore } from "@/lib/store";
import { saveScenarios } from "@/lib/actions";
import { currentStudent } from "@/lib/selectors";
import { runBridgeEngine } from "@/lib/engine";
import { ALTERNATIVES, GRANTS, WAIVERS } from "@/lib/knowledge";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABEL, OPP_CATEGORIES, OPP_CATEGORY_LABEL, uid, usd } from "@/lib/format";
import { PageHeader } from "@/components/ui/primitives";
import { Window } from "@/components/ui/Window";

type Scenario = CalculatorScenario & { category?: OpportunityCategory };
type Line = Scenario["lines"][number];

const emptyLines = (): Line[] => EXPENSE_CATEGORIES.map((c) => ({ id: uid("l"), category: c, label: EXPENSE_CATEGORY_LABEL[c], amount: 0, confirmed: false }));

export default function CalculatorPage() {
  const { state, dispatch } = useStore();
  const student = currentStudent(state);

  const fromJournal = (): Scenario[] =>
    state.opportunities
      .filter((o) => o.studentId === student.id)
      .slice(0, 3)
      .map((o) => ({
        id: uid("sc"),
        name: o.title,
        funds: o.studentFunds + o.priorAssistance,
        category: o.category,
        lines: EXPENSE_CATEGORIES.map((c) => {
          const items = o.expenses.filter((e) => e.category === c);
          return {
            id: uid("l"),
            category: c,
            label: items.map((e) => e.label).join(", ") || EXPENSE_CATEGORY_LABEL[c],
            amount: items.reduce((a, e) => a + e.amount, 0),
            confirmed: items.length > 0 && items.every((e) => e.confirmed),
          };
        }),
      }));

  const [scenarios, setScenarios] = useState<Scenario[]>(() => (state.scenarios.length ? (state.scenarios as Scenario[]) : fromJournal()));

  useEffect(() => {
    const t = setTimeout(() => dispatch(saveScenarios(scenarios)), 300);
    return () => clearTimeout(t);
  }, [scenarios, dispatch]);

  const update = (id: string, fn: (s: Scenario) => Scenario) => setScenarios((xs) => xs.map((s) => (s.id === id ? fn(s) : s)));
  const setLine = (sid: string, cat: ExpenseCategory, patch: Partial<Line>) => update(sid, (s) => ({ ...s, lines: s.lines.map((l) => (l.category === cat ? { ...l, ...patch } : l)) }));

  const results = useMemo(
    () =>
      scenarios.map((s) => {
        const total = s.lines.reduce((a, l) => a + l.amount, 0);
        const confirmed = s.lines.filter((l) => l.confirmed).reduce((a, l) => a + l.amount, 0);
        const gap = Math.max(total - s.funds, 0);
        const plan = runBridgeEngine(
          {
            category: s.category ?? "course",
            country: student.country,
            studentFunds: s.funds,
            priorAssistance: 0,
            eligibility: student.eligibility,
            expenses: s.lines.filter((l) => l.amount > 0).map((l) => ({ id: l.id, label: l.label, category: l.category, amount: l.amount, confirmed: l.confirmed })),
          },
          { waivers: WAIVERS, alternatives: ALTERNATIVES, grants: GRANTS, resources: state.resources },
        );
        return { id: s.id, total, confirmed, estimated: total - confirmed, gap, afterEngine: plan.sponsorAmount, coverage: total ? 1 - plan.sponsorAmount / total : 1 };
      }),
    [scenarios, student, state.resources],
  );

  const best = results.filter((r) => r.total > 0).sort((a, b) => a.afterEngine - b.afterEngine || b.coverage - a.coverage)[0];

  const exportCsv = () => {
    const header = ["Category", ...scenarios.map((s) => s.name)];
    const rows = EXPENSE_CATEGORIES.map((c) => [EXPENSE_CATEGORY_LABEL[c], ...scenarios.map((s) => s.lines.find((l) => l.category === c)?.amount ?? 0)]);
    const summary = [
      ["Total", ...results.map((r) => r.total)],
      ["Confirmed", ...results.map((r) => r.confirmed)],
      ["Estimated", ...results.map((r) => r.estimated)],
      ["Your funds", ...scenarios.map((s) => s.funds)],
      ["Gap after BridgeEngine", ...results.map((r) => r.afterEngine)],
    ];
    const csv = [header, ...rows, ...summary].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "bridgefund-cost-comparison.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        kicker="Opportunity cost calculator"
        title="What does it really cost?"
        description="Registration is only part of the price. Compare the full cost of each opportunity — confirmed and estimated — and see which is most financially accessible after BridgeEngine."
        actions={
          <>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setScenarios(fromJournal())}>
              <Copy size={14} /> Load from my journal
            </button>
            <button type="button" className="btn-ghost btn-sm" onClick={exportCsv}>
              <Download size={14} /> Export CSV
            </button>
            <button
              type="button"
              className="btn-primary btn-sm"
              disabled={scenarios.length >= 4}
              onClick={() => setScenarios([...scenarios, { id: uid("sc"), name: `Opportunity ${scenarios.length + 1}`, funds: 0, category: "examination", lines: emptyLines() }])}
            >
              <Plus size={14} /> Add opportunity
            </button>
          </>
        }
      />

      <div className="scrollbar-thin overflow-x-auto pb-2">
        <div className="grid min-w-[720px] gap-4" style={{ gridTemplateColumns: `repeat(${Math.max(scenarios.length, 1)}, minmax(260px, 1fr))` }}>
          {scenarios.map((s) => {
            const r = results.find((x) => x.id === s.id)!;
            const isBest = best?.id === s.id && scenarios.length > 1;
            return (
              <Window
                key={s.id}
                tone={isBest ? "gold" : "forest"}
                title={isBest ? "Most accessible" : "Opportunity"}
                icon={isBest ? <Crown size={14} /> : undefined}
                actions={
                  <button type="button" aria-label={`Remove ${s.name}`} onClick={() => setScenarios(scenarios.filter((x) => x.id !== s.id))}>
                    <Trash2 size={14} />
                  </button>
                }
              >
                <label className="sr-only" htmlFor={`name-${s.id}`}>
                  Opportunity name
                </label>
                <input id={`name-${s.id}`} className="input mb-2 font-semibold" value={s.name} onChange={(e) => update(s.id, (x) => ({ ...x, name: e.target.value }))} />
                <label className="sr-only" htmlFor={`cat-${s.id}`}>
                  Opportunity type
                </label>
                <select id={`cat-${s.id}`} className="input mb-3 text-xs" value={s.category ?? "course"} onChange={(e) => update(s.id, (x) => ({ ...x, category: e.target.value as OpportunityCategory }))}>
                  {OPP_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {OPP_CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted">
                      <th className="text-left font-semibold">Category</th>
                      <th className="text-right font-semibold">USD</th>
                      <th className="w-10 text-center font-semibold" title="Confirmed">
                        Conf.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXPENSE_CATEGORIES.map((c) => {
                      const l = s.lines.find((x) => x.category === c)!;
                      return (
                        <tr key={c} className="border-b border-line/15">
                          <td className="py-1 pr-2 text-xs">{EXPENSE_CATEGORY_LABEL[c]}</td>
                          <td className="py-1">
                            <input
                              aria-label={`${EXPENSE_CATEGORY_LABEL[c]} cost for ${s.name}`}
                              inputMode="decimal"
                              className={`w-full border-b-2 bg-transparent px-1 text-right font-pixel outline-none focus:border-forest ${l.amount && !l.confirmed ? "border-dashed border-gold" : "border-line/30"}`}
                              value={l.amount || ""}
                              placeholder="0"
                              onChange={(e) => setLine(s.id, c, { amount: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })}
                            />
                          </td>
                          <td className="py-1 text-center">
                            <input type="checkbox" aria-label={`${EXPENSE_CATEGORY_LABEL[c]} confirmed`} className="h-4 w-4 accent-[#294C3D]" checked={l.confirmed} onChange={(e) => setLine(s.id, c, { confirmed: e.target.checked })} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <label htmlFor={`funds-${s.id}`} className="text-xs font-semibold">
                    Your funds
                  </label>
                  <input
                    id={`funds-${s.id}`}
                    inputMode="decimal"
                    className="input w-24 text-right font-pixel"
                    value={s.funds || ""}
                    placeholder="0"
                    onChange={(e) => update(s.id, (x) => ({ ...x, funds: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 }))}
                  />
                </div>
                <dl className="mt-4 space-y-1 border-t-2 border-line pt-3 text-sm">
                  <div className="flex justify-between">
                    <dt>Total cost</dt>
                    <dd className="font-pixel text-lg">{usd(r.total)}</dd>
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <dt>Confirmed / estimated</dt>
                    <dd>
                      {usd(r.confirmed)} / {usd(r.estimated)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Gap after your funds</dt>
                    <dd className="font-pixel">{usd(r.gap)}</dd>
                  </div>
                  <div className={`flex justify-between border-2 border-line px-2 py-1 ${isBest ? "bg-gold/40" : "bg-raised"}`}>
                    <dt className="font-semibold">Gap after BridgeEngine</dt>
                    <dd className="font-pixel text-lg">{usd(r.afterEngine)}</dd>
                  </div>
                </dl>
              </Window>
            );
          })}
          {scenarios.length === 0 && (
            <p className="text-sm text-muted">
              No opportunities to compare. Use “Add opportunity” or “Load from my journal”.
            </p>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">Dashed amounts are estimates. Confirm them with the organiser before relying on them. “Gap after BridgeEngine” is a simulation using the demo knowledge base.</p>
    </div>
  );
}
