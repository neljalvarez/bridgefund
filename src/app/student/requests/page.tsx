"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ChevronDown, Lock, Plus, Send, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { deleteDraft, remainingOf, respondToInfo, submitRequest } from "@/lib/actions";
import { VERIFICATION_LABEL, fmtDate, fmtDateLong, usd } from "@/lib/format";
import { ChunkyProgress, EmptyState, PageHeader, StatusBadge } from "@/components/ui/primitives";
import { StatusTrack } from "@/components/student/StatusTrack";
import { RequestForm } from "@/components/student/RequestForm";
import type { FundingRequest } from "@/lib/types";

function RequestItem({ r }: { r: FundingRequest }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(r.status === "Draft" || !!r.infoRequested);
  const [reply, setReply] = useState("");
  const reductions = r.reductions.reduce((a, x) => a + x.amount, 0);
  const receipt = state.contributions.find((c) => c.requestId === r.id);

  return (
    <article className="panel">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {r.ref} · due {fmtDate(r.deadline)}
          </p>
          <h3 className="font-semibold">{r.purpose}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Remaining</p>
            <p className="font-pixel text-xl">{usd(remainingOf(r))}</p>
          </div>
          <StatusBadge status={r.status} />
          <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </div>
      </button>
      {open && (
        <div className="space-y-4 border-t-2 border-line p-4">
          {r.infoRequested && (
            <div className="space-y-2 border-2 border-line bg-gold/30 p-3" role="alert">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle size={15} /> Your institution asked: “{r.infoRequested}”
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor={`reply-${r.id}`} className="sr-only">
                  Your reply
                </label>
                <input id={`reply-${r.id}`} className="input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply or describe the document you attached" />
                <button
                  type="button"
                  className="btn-primary shrink-0"
                  onClick={() => {
                    dispatch(respondToInfo(r.id, reply.trim()), { toast: { title: "Response sent to your institution", tone: "success" } });
                    setReply("");
                  }}
                >
                  Send & attach documents
                </button>
              </div>
            </div>
          )}

          <StatusTrack status={r.status} />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="label">Cost breakdown</p>
              <table className="w-full text-sm">
                <tbody>
                  {r.expenses.map((e) => (
                    <tr key={e.id} className="border-b border-line/20">
                      <td className="py-1">{e.label}</td>
                      <td className="py-1 text-right">{usd(e.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-line/20 text-forest">
                    <td className="py-1">Your contribution</td>
                    <td className="py-1 text-right">−{usd(r.studentFunds)}</td>
                  </tr>
                  {r.reductions.map((x) => (
                    <tr key={x.id} className="border-b border-line/20 text-forest">
                      <td className="py-1">{x.title}</td>
                      <td className="py-1 text-right">−{usd(x.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-1">Requested from sponsors</td>
                    <td className="py-1 text-right font-pixel">{usd(r.amount)}</td>
                  </tr>
                </tbody>
              </table>
              {reductions > 0 && <p className="mt-1 text-xs text-muted">BridgeFund removed {usd(reductions)} before asking anyone for money.</p>}
            </div>
            <div className="space-y-3">
              <div>
                <p className="label">Funding progress</p>
                <ChunkyProgress value={r.funded} max={r.amount} tone="terra" label={`${r.ref} funding`} />
                <p className="mt-1 text-xs text-muted">
                  {usd(r.funded)} of {usd(r.amount)} secured · deadline {fmtDateLong(r.deadline)}
                </p>
              </div>
              <div>
                <p className="label flex items-center gap-1">
                  <Lock size={11} /> Private to your verifier
                </p>
                <p className="text-sm">{r.reason}</p>
                <p className="mt-1 text-xs text-muted">
                  Verification: {VERIFICATION_LABEL[r.verification]} · Documents: {r.documents.filter((d) => d.attached).length}/{r.documents.length} attached
                </p>
              </div>
            </div>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-semibold">Activity log ({r.history.length})</summary>
            <ol className="mt-2 space-y-1 border-l-2 border-line/40 pl-3">
              {[...r.history].reverse().map((h, i) => (
                <li key={i} className="text-xs">
                  <span className="text-muted">{fmtDate(h.at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span> — {h.note}
                </li>
              ))}
            </ol>
          </details>

          <div className="flex flex-wrap gap-2">
            {r.status === "Draft" && (
              <>
                <button type="button" className="btn-primary btn-sm" onClick={() => dispatch(submitRequest(r.id), { toast: { title: `${r.ref} submitted`, tone: "success" }, sound: "success" })}>
                  <Send size={14} /> Submit for verification
                </button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => dispatch(deleteDraft(r.id), { toast: { title: "Draft deleted", tone: "info" } })}>
                  <Trash2 size={14} /> Delete draft
                </button>
              </>
            )}
            {receipt && ["Fully Funded", "Completed"].includes(r.status) && (
              <Link href={`/receipt/${receipt.id}`} className="btn-ghost btn-sm">
                View impact receipt
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default function RequestsPage() {
  const { state } = useStore();
  const [formKey, setFormKey] = useState(0);
  const [open, setOpen] = useState(false);
  const mine = state.requests.filter((r) => r.studentId === state.currentStudentId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        kicker="Emergency funding requests"
        title="Your requests"
        description="Specific, verified, private. Run BridgeEngine first so you only ask for what's left — or submit a direct request for an urgent need."
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setFormKey((k) => k + 1);
              setOpen(true);
            }}
          >
            <Plus size={16} /> New request
          </button>
        }
      />
      {mine.length === 0 ? (
        <EmptyState title="No requests yet" body="Most students start with BridgeEngine — it often closes the gap without any request at all." action={<Link href="/student/engine" className="btn-primary btn-sm">Open BridgeEngine</Link>} />
      ) : (
        <div className="space-y-4">
          {mine.map((r) => (
            <RequestItem key={r.id} r={r} />
          ))}
        </div>
      )}
      <RequestForm key={formKey} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
