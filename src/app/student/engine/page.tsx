"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Play, RotateCcw, Save, Send, Wand2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { applyEnginePlan } from "@/lib/actions";
import { planFor } from "@/lib/plan";
import { requestForOpp } from "@/lib/selectors";
import { EXPENSE_CATEGORY_LABEL, OPP_CATEGORY_LABEL, fmtDateLong, usd } from "@/lib/format";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui/primitives";
import { Window } from "@/components/ui/Window";
import { EngineRun } from "@/components/student/EngineRun";
import { PixelSprite } from "@/components/pixel/PixelSprite";

function EngineInner() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const mine = state.opportunities.filter((o) => o.studentId === state.currentStudentId);
  const [oppId, setOppId] = useState(params.get("opp") ?? mine.find((o) => !requestForOpp(state, o.id))?.id ?? mine[0]?.id);
  const opp = mine.find((o) => o.id === oppId);
  const [runKey, setRunKey] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const plan = useMemo(() => (opp ? planFor(state, opp) : null), [opp, state]);
  const existing = opp ? requestForOpp(state, opp.id) : undefined;
  const locked = existing && !["Draft", "Submitted", "Under Review"].includes(existing.status);

  const run = () => {
    setFinished(false);
    setRunning(true);
    setRunKey((k) => k + 1);
  };

  const apply = (submit: boolean) => {
    if (!opp || !plan) return;
    dispatch(applyEnginePlan(opp.id, plan, submit), {
      sound: "success",
      toast:
        plan.sponsorAmount <= 0
          ? { title: "Gap closed!", body: "No sponsor funding needed for this opportunity.", tone: "success" }
          : submit
            ? { title: "Request submitted", body: `${usd(plan.sponsorAmount)} sent to your institution for verification.`, tone: "success" }
            : { title: "Plan saved as draft", tone: "info" },
    });
    router.push(plan.sponsorAmount <= 0 ? "/student" : "/student/requests");
  };

  if (!mine.length) {
    return <EmptyState title="No opportunities yet" body="Scan a barrier first, then BridgeEngine can build your plan." action={<Link href="/student/scanner" className="btn-primary btn-sm">Open scanner</Link>} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-6">
        <Window title="Choose an opportunity">
          <label htmlFor="opp" className="label">
            Opportunity
          </label>
          <select
            id="opp"
            className="input"
            value={oppId}
            onChange={(e) => {
              setOppId(e.target.value);
              setRunning(false);
              setFinished(false);
              router.replace(`/student/engine?opp=${e.target.value}`);
            }}
          >
            {mine.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
          {opp && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted">
                {OPP_CATEGORY_LABEL[opp.category]} · {opp.provider} · deadline {fmtDateLong(opp.deadline)}
              </p>
              <table className="w-full text-sm">
                <caption className="sr-only">Expenses</caption>
                <tbody>
                  {opp.expenses.map((e) => (
                    <tr key={e.id} className="border-b border-line/20">
                      <td className="py-1.5">
                        {e.label}
                        <span className="block text-xs text-muted">
                          {EXPENSE_CATEGORY_LABEL[e.category]} · {e.confirmed ? "confirmed" : "estimate"}
                        </span>
                      </td>
                      <td className="py-1.5 text-right font-pixel">{usd(e.amount)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-1.5 text-muted">You can contribute</td>
                    <td className="py-1.5 text-right font-pixel text-forest">−{usd(opp.studentFunds + opp.priorAssistance)}</td>
                  </tr>
                </tbody>
              </table>
              {existing && (
                <p className="flex items-center gap-2 text-sm">
                  Current request: <StatusBadge status={existing.status} /> <span className="text-muted">{existing.ref}</span>
                </p>
              )}
            </div>
          )}
        </Window>

        <div className="panel flex items-start gap-3 p-4">
          <PixelSprite name="key" scale={4} />
          <div className="text-sm">
            <p className="font-pixel text-base">How BridgeEngine thinks</p>
            <p className="mt-1 text-muted">
              It always works through the same six priorities and stops early if the gap closes. Every match comes from rules in a seeded knowledge base — no AI guesswork — and every match explains itself.
            </p>
          </div>
        </div>
      </div>

      <Window
        title="BridgeEngine · gap resolver"
        tone="ink"
        icon={<Wand2 size={14} />}
        actions={
          running && (
            <button type="button" onClick={run} className="flex items-center gap-1 text-xs hover:underline">
              <RotateCcw size={12} /> Replay
            </button>
          )
        }
      >
        {!plan ? null : !running ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <PixelSprite name="chest" scale={8} />
            <p className="max-w-sm text-sm text-muted">
              Gap to resolve: <span className="font-pixel text-lg text-ink">{usd(plan.initialGap)}</span>. BridgeEngine will check waivers, free alternatives, discounts, borrowable equipment and grants before sponsors.
            </p>
            <button type="button" className="btn-primary px-6 py-3" onClick={run} disabled={locked}>
              <Play size={16} /> Run BridgeEngine
            </button>
            {locked && <p className="text-xs text-muted">This request is already {existing?.status.toLowerCase()} — the plan is locked.</p>}
          </div>
        ) : (
          <>
            <EngineRun plan={plan} runKey={runKey} onDone={() => setFinished(true)} />
            {finished && !locked && (
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.sponsorAmount > 0 ? (
                  <>
                    <button type="button" className="btn-primary" onClick={() => apply(true)}>
                      <Send size={16} /> Apply plan & request {usd(plan.sponsorAmount)}
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => apply(false)}>
                      <Save size={16} /> Save as draft
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn-primary" onClick={() => apply(true)}>
                    Apply plan — no funding needed
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </Window>
    </div>
  );
}

export default function EnginePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader kicker="Flagship · BridgeEngine" title="Intelligent financial gap resolver" description="Reduce the cost first. Ask sponsors only for what's genuinely left — and know exactly why each recommendation was made." />
      <Suspense>
        <EngineInner />
      </Suspense>
    </div>
  );
}
