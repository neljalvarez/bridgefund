"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, FileCheck2, FileX2, HandCoins, Lock, MessageSquare, Package, Ticket, XCircle } from "lucide-react";
import type { FundingRequest } from "@/lib/types";
import { useStore } from "@/lib/store";
import { approveRequest, assignWaiver, confirmCompleted, declineRequest, fundRequest, remainingOf, requestInfo, reserveResource, startReview } from "@/lib/actions";
import { institutionOf, oppOf, studentOf } from "@/lib/selectors";
import { WAIVERS } from "@/lib/knowledge";
import { waiverValue } from "@/lib/engine";
import { VERIFICATION_LABEL, fmtDate, isoDaysFromNow, relDays, urgencyOf, usd } from "@/lib/format";
import { ChunkyProgress, Field, StatusBadge, UrgencyBadge } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";

type Dialog = null | "info" | "decline" | "waiver" | "resource" | "funds";

export function ReviewCard({ r, highlight, defaultOpen }: { r: FundingRequest; highlight?: boolean; defaultOpen?: boolean }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(!!defaultOpen || !!highlight);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [text, setText] = useState("");
  const [waiverId, setWaiverId] = useState("");
  const [resId, setResId] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<"institution" | "pool">("institution");

  const st = studentOf(state, r.studentId)!;
  const inst = institutionOf(state, st.institutionId);
  const opp = oppOf(state, r.opportunityId);
  const remaining = remainingOf(r);
  const pending = ["Submitted", "Under Review"].includes(r.status);
  const funding = ["Verified", "Partially Funded"].includes(r.status);

  const applicableWaivers = WAIVERS.filter(
    (w) => (!opp || w.categories.includes(opp.category)) && (w.countries.includes("Global") || w.countries.includes(st.country)) && !r.reductions.some((x) => x.sourceId === w.id),
  );
  const availableRes = state.resources.filter((x) => x.available > 0 && x.type !== "free-resource");

  const close = () => {
    setDialog(null);
    setText("");
    setAmount("");
  };

  const waiver = WAIVERS.find((w) => w.id === waiverId);
  const waiverBase = r.expenses.filter((e) => waiver?.expenseCategories.includes(e.category)).reduce((a, e) => a + e.amount, 0);
  const suggestedWaiver = waiver ? Math.min(waiverValue(waiver, waiverBase || remaining), remaining) : 0;
  const fundsAvail = source === "pool" ? state.pool : state.institutionFunds;

  return (
    <article className={`panel ${highlight ? "ring-4 ring-gold" : ""}`} id={`req-${r.id}`}>
      <button type="button" className="flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-line bg-sage font-pixel text-sm">{st.initials}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              {r.ref} · {st.firstName} · {st.grade} · {inst?.name}
            </p>
            <p className="truncate font-semibold">{r.purpose}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <UrgencyBadge label={urgencyOf(r.deadline).label} />
          <span className="font-pixel text-xl">{usd(remaining)}</span>
          <StatusBadge status={r.status} />
          <ChevronDown size={16} className={open ? "rotate-180" : ""} aria-hidden />
        </div>
      </button>

      {open && (
        <div className="space-y-4 border-t-2 border-line p-4">
          {r.infoRequested && <p className="border-2 border-line bg-gold/30 px-3 py-2 text-sm">Waiting for student: “{r.infoRequested}”</p>}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <p className="label">Expense breakdown</p>
              <ul className="space-y-1 text-sm">
                {r.expenses.map((e) => (
                  <li key={e.id} className="flex justify-between gap-2">
                    <span>
                      {e.label} {!e.confirmed && <span className="text-[10px] font-bold uppercase text-terraink">est.</span>}
                    </span>
                    <span className="font-mono">{usd(e.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-2 text-forest">
                  <span>Student contribution</span>
                  <span className="font-mono">−{usd(r.studentFunds)}</span>
                </li>
                {r.reductions.map((x) => (
                  <li key={x.id} className="flex justify-between gap-2 text-forest">
                    <span>{x.title}</span>
                    <span className="font-mono">−{usd(x.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-2 border-t border-line/30 pt-1 font-semibold">
                  <span>Requested</span>
                  <span className="font-mono">{usd(r.amount)}</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="label flex items-center gap-1">
                <Lock size={11} /> Confidential — verifier only
              </p>
              <p className="text-sm">{r.reason}</p>
              <p className="mt-2 text-xs text-muted">Preferred verification: {VERIFICATION_LABEL[r.verification]}</p>
              <ul className="mt-2 space-y-1 text-xs">
                {r.documents.map((d) => (
                  <li key={d.name} className="flex items-center gap-1.5">
                    {d.attached ? <FileCheck2 size={13} className="text-forest" /> : <FileX2 size={13} className="text-terraink" />} {d.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label">Funding</p>
              <ChunkyProgress value={r.funded} max={r.amount} tone="terra" segments={14} label={`${r.ref} funding`} />
              <p className="mt-1 text-xs text-muted">
                {usd(r.funded)} of {usd(r.amount)} · deadline {fmtDate(r.deadline)} ({relDays(r.deadline)})
              </p>
              {opp && <p className="mt-2 text-xs">Outcome: {opp.outcome}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t-2 border-line/20 pt-3">
            {r.status === "Submitted" && (
              <button type="button" className="btn-ghost btn-sm" onClick={() => dispatch(startReview(r.id), { toast: { title: `Reviewing ${r.ref}`, tone: "info" } })}>
                Start review
              </button>
            )}
            {pending && (
              <>
                <button type="button" className="btn-primary btn-sm" onClick={() => dispatch(approveRequest(r.id), { toast: { title: `${r.ref} verified`, body: "Now visible to sponsors.", tone: "success" }, sound: "success" })}>
                  <CheckCircle2 size={14} /> Approve & verify
                </button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => setDialog("info")}>
                  <MessageSquare size={14} /> Request info
                </button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => setDialog("decline")}>
                  <XCircle size={14} /> Decline
                </button>
              </>
            )}
            {(pending || funding) && (
              <>
                <button type="button" className="btn-ghost btn-sm" onClick={() => setDialog("waiver")}>
                  <Ticket size={14} /> Assign fee waiver
                </button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => setDialog("resource")}>
                  <Package size={14} /> Reserve resource
                </button>
              </>
            )}
            {funding && (
              <button
                type="button"
                className="btn-gold btn-sm"
                onClick={() => {
                  setAmount(String(Math.min(remaining, state.institutionFunds)));
                  setDialog("funds");
                }}
              >
                <HandCoins size={14} /> Allocate funds
              </button>
            )}
            {r.status === "Fully Funded" && (
              <button type="button" className="btn-primary btn-sm" onClick={() => dispatch(confirmCompleted(r.id), { toast: { title: `${r.ref} completed`, body: "Provider paid. Student and sponsors notified.", tone: "success" }, sound: "unlock" })}>
                <CheckCircle2 size={14} /> Confirm assistance completed
              </button>
            )}
          </div>
        </div>
      )}

      <Modal
        open={dialog === "info"}
        onClose={close}
        title={`Request information · ${r.ref}`}
        size="sm"
        footer={
          <button
            type="button"
            className="btn-primary"
            disabled={text.trim().length < 5}
            onClick={() => {
              dispatch(requestInfo(r.id, text.trim()), { toast: { title: "Student notified", tone: "info" } });
              close();
            }}
          >
            Send request
          </button>
        }
      >
        <Field label="What do you need from the student?" htmlFor={`info-${r.id}`} hint="Be specific and kind — e.g. “Please attach the exam board's fee confirmation email.”">
          <textarea id={`info-${r.id}`} className="input min-h-24" value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
      </Modal>

      <Modal
        open={dialog === "decline"}
        onClose={close}
        title={`Decline · ${r.ref}`}
        size="sm"
        footer={
          <button
            type="button"
            className="btn-terra"
            disabled={text.trim().length < 5}
            onClick={() => {
              dispatch(declineRequest(r.id, text.trim()), { toast: { title: `${r.ref} declined`, tone: "info" } });
              close();
            }}
          >
            Decline request
          </button>
        }
      >
        <Field label="Reason (shared privately with the student)" htmlFor={`decline-${r.id}`} hint="Suggest an alternative where possible.">
          <textarea id={`decline-${r.id}`} className="input min-h-24" value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
      </Modal>

      <Modal
        open={dialog === "waiver"}
        onClose={close}
        title={`Assign fee waiver · ${r.ref}`}
        size="sm"
        footer={
          <button
            type="button"
            className="btn-primary"
            disabled={!waiver || !(Number(amount || suggestedWaiver) > 0)}
            onClick={() => {
              dispatch(assignWaiver(r.id, waiverId, Number(amount) || suggestedWaiver), { toast: { title: "Waiver assigned", tone: "success" }, sound: "coin" });
              close();
              setWaiverId("");
            }}
          >
            Assign waiver
          </button>
        }
      >
        {applicableWaivers.length === 0 ? (
          <p className="text-sm text-muted">No further waivers in the directory apply to this request.</p>
        ) : (
          <div className="space-y-3">
            <Field label="Waiver or programme" htmlFor={`w-${r.id}`}>
              <select
                id={`w-${r.id}`}
                className="input"
                value={waiverId}
                onChange={(e) => {
                  setWaiverId(e.target.value);
                  setAmount("");
                }}
              >
                <option value="">Select…</option>
                {applicableWaivers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </Field>
            {waiver && (
              <Field label="Reduction amount (USD)" htmlFor={`wa-${r.id}`} hint={`Suggested ${usd(suggestedWaiver)} · eligibility confirmed by your institution`}>
                <input id={`wa-${r.id}`} inputMode="decimal" className="input" placeholder={String(suggestedWaiver)} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
              </Field>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={dialog === "resource"}
        onClose={close}
        title={`Reserve resource for ${st.firstName}`}
        size="sm"
        footer={
          <button
            type="button"
            className="btn-primary"
            disabled={!resId}
            onClick={() => {
              dispatch(reserveResource(resId, r.studentId, isoDaysFromNow(2), "institution"), { toast: { title: "Resource reserved for the student", tone: "success" } });
              close();
              setResId("");
            }}
          >
            Reserve
          </button>
        }
      >
        <Field label="Available resource" htmlFor={`res-${r.id}`}>
          <select id={`res-${r.id}`} className="input" value={resId} onChange={(e) => setResId(e.target.value)}>
            <option value="">Select…</option>
            {availableRes.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} — {x.available} left · saves {usd(x.retailValue)}
              </option>
            ))}
          </select>
        </Field>
      </Modal>

      <Modal
        open={dialog === "funds"}
        onClose={close}
        title={`Allocate funds · ${r.ref}`}
        size="sm"
        footer={
          <button
            type="button"
            className="btn-primary"
            disabled={!(Number(amount) > 0) || Number(amount) > Math.min(remaining, fundsAvail)}
            onClick={() => {
              dispatch(fundRequest(r.id, Number(amount), source), { toast: { title: `${usd(Number(amount))} allocated to ${r.ref}`, tone: "success" }, sound: "coin" });
              close();
            }}
          >
            Allocate
          </button>
        }
      >
        <div className="space-y-3">
          <fieldset>
            <legend className="label">Source</legend>
            <div className="flex gap-2">
              {(
                [
                  ["institution", `Assistance fund (${usd(state.institutionFunds)})`],
                  ["pool", `Shared sponsor pool (${usd(state.pool)})`],
                ] as const
              ).map(([k, l]) => (
                <label key={k} className={`btn btn-sm cursor-pointer ${source === k ? "bg-forest text-onforest" : "bg-surface"}`}>
                  <input type="radio" className="sr-only" name={`src-${r.id}`} checked={source === k} onChange={() => setSource(k)} />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <Field
            label="Amount (USD)"
            htmlFor={`fa-${r.id}`}
            hint={`Remaining need ${usd(remaining)}`}
            error={Number(amount) > fundsAvail ? "Not enough in this fund." : Number(amount) > remaining ? "More than the remaining need." : undefined}
          >
            <input id={`fa-${r.id}`} inputMode="decimal" className="input font-pixel" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
          </Field>
        </div>
      </Modal>
    </article>
  );
}
