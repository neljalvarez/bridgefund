"use client";

import { useState } from "react";
import { FileUp, Lock } from "lucide-react";
import type { Expense, VerificationMethod } from "@/lib/types";
import { useStore } from "@/lib/store";
import { createRequest } from "@/lib/actions";
import { VERIFICATION_LABEL, daysUntil, usd } from "@/lib/format";
import { Field } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";
import { ExpenseEditor } from "./ExpenseEditor";

export function RequestForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const mine = state.opportunities.filter((o) => o.studentId === state.currentStudentId);
  const [oppId, setOppId] = useState<string>("");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reason, setReason] = useState("");
  const [docs, setDocs] = useState<{ name: string; attached: boolean }[]>([{ name: "Proof of enrollment", attached: false }]);
  const [verification, setVerification] = useState<VerificationMethod>("school-letter");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = expenses.reduce((a, e) => a + e.amount, 0);

  const pickOpp = (id: string) => {
    setOppId(id);
    const o = mine.find((x) => x.id === id);
    if (o) {
      setPurpose(o.title);
      setDeadline(o.deadline.slice(0, 10));
      setExpenses(o.expenses.map((e) => ({ ...e })));
      setAmount(String(Math.max(o.expenses.reduce((a, e) => a + e.amount, 0) - o.studentFunds - o.priorAssistance, 0)));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!purpose.trim()) e.purpose = "Describe the educational purpose.";
    const amt = Number(amount);
    if (!(amt > 0)) e.amount = "Enter the exact amount you need (more than $0).";
    else if (total > 0 && amt > total) e.amount = `The amount can't exceed your expense total of ${usd(total)}.`;
    if (!deadline) e.deadline = "Add the deadline.";
    else if (daysUntil(new Date(`${deadline}T12:00:00`).toISOString()) < 0) e.deadline = "The deadline has passed.";
    if (!expenses.length || expenses.some((x) => !x.label.trim() || !(x.amount > 0))) e.expenses = "List each expense with an amount.";
    if (reason.trim().length < 10) e.reason = "Add a short reason (at least 10 characters). Only your verifier sees this.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (send: boolean) => {
    if (send && !validate()) return;
    if (!send && !purpose.trim()) {
      setErrors({ purpose: "Give your draft a purpose so you can find it later." });
      return;
    }
    dispatch(
      createRequest(
        {
          opportunityId: oppId || null,
          purpose: purpose.trim(),
          amount: Number(amount) || 0,
          deadline: deadline ? new Date(`${deadline}T12:00:00`).toISOString() : new Date().toISOString(),
          expenses,
          reason: reason.trim(),
          documents: docs,
          verification,
        },
        send,
      ),
      { toast: { title: send ? "Request submitted for verification" : "Draft saved", tone: send ? "success" : "info" }, sound: send ? "success" : "click" },
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New emergency funding request"
      size="lg"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={() => submit(false)}>
            Save draft
          </button>
          <button type="button" className="btn-primary" onClick={() => submit(true)}>
            Submit for verification
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="flex items-start gap-2 border-2 border-line bg-sage/40 p-3 text-xs">
          <Lock size={14} className="mt-0.5 shrink-0" />
          Your reason and documents are visible only to your verifying institution. Sponsors see the educational goal, verified amount and deadline — never your personal circumstances.
        </p>
        {mine.length > 0 && (
          <Field label="Link to an opportunity in your journal (optional)" htmlFor="rf-opp">
            <select id="rf-opp" className="input" value={oppId} onChange={(e) => pickOpp(e.target.value)}>
              <option value="">— New / other —</option>
              {mine.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
          <Field label="Educational purpose" htmlFor="rf-purpose" error={errors.purpose}>
            <input id="rf-purpose" className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Chemistry practical exam fee" />
          </Field>
          <Field label="Exact amount (USD)" htmlFor="rf-amount" error={errors.amount}>
            <input id="rf-amount" inputMode="decimal" className="input font-pixel" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
          </Field>
          <Field label="Deadline" htmlFor="rf-deadline" error={errors.deadline}>
            <input id="rf-deadline" type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </Field>
        </div>
        <div>
          <p className="label">Expense breakdown {total > 0 && <span className="normal-case">· total {usd(total)}</span>}</p>
          <ExpenseEditor expenses={expenses} onChange={setExpenses} idPrefix="rf" />
          {errors.expenses && (
            <p className="mt-1 text-xs font-semibold text-terraink" role="alert">
              {errors.expenses}
            </p>
          )}
        </div>
        <Field label="Why is assistance needed? (private)" htmlFor="rf-reason" error={errors.reason}>
          <textarea id="rf-reason" className="input min-h-20" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="A sentence or two is enough. You don't need to share more than you're comfortable with." />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="label">Supporting documents</p>
            <ul className="space-y-1.5">
              {docs.map((d, i) => (
                <li key={i} className="flex items-center justify-between gap-2 border-2 border-line bg-bg px-2 py-1.5 text-sm">
                  <span className="truncate">{d.name}</span>
                  <label className="btn-ghost btn-sm cursor-pointer">
                    <FileUp size={12} /> {d.attached ? "Replace" : "Attach"}
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDocs(docs.map((x, j) => (j === i ? { name: `${x.name} (${file.name})`, attached: true } : x)));
                      }}
                    />
                  </label>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-2 text-xs font-semibold text-forest hover:underline" onClick={() => setDocs([...docs, { name: "Official cost confirmation", attached: false }])}>
              + Add document slot
            </button>
            <p className="mt-1 text-[11px] text-muted">Demo only: file names are recorded, files are never uploaded.</p>
          </div>
          <fieldset>
            <legend className="label">Preferred verification method</legend>
            <div className="space-y-1.5">
              {(Object.keys(VERIFICATION_LABEL) as VerificationMethod[]).map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="verification" value={v} checked={verification === v} onChange={() => setVerification(v)} className="accent-[#294C3D]" />
                  {VERIFICATION_LABEL[v]}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </Modal>
  );
}
