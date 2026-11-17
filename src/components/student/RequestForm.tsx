"use client";

import { useState } from "react";
import { FileUp, Lock } from "lucide-react";
import type { Expense } from "@/lib/types";
import { useStore } from "@/lib/store";
import { createRequest } from "@/lib/actions";
import { currentStudent } from "@/lib/selectors";
import { daysUntil, aed } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/shared/kit";
import { ExpenseEditor } from "./ExpenseEditor";

export function RequestForm({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state, dispatch } = useStore();
  const student = currentStudent(state);
  const mine = state.opportunities.filter((o) => o.studentId === state.currentStudentId);
  const [oppId, setOppId] = useState("none");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [explanation, setExplanation] = useState("");
  const [docs, setDocs] = useState([{ name: "Proof of enrollment", attached: false }, { name: "Official cost confirmation", attached: false }]);
  const [institutionId, setInstitutionId] = useState(student.institutionId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const total = expenses.reduce((a, e) => a + e.amount, 0);

  const pick = (id: string) => {
    setOppId(id);
    const o = mine.find((x) => x.id === id);
    if (!o) return;
    setPurpose(o.title);
    setDeadline(o.deadline.slice(0, 10));
    setExpenses(o.expenses.map((e) => ({ ...e })));
    setAmount(String(Math.max(o.expenses.reduce((a, e) => a + e.amount, 0) - o.studentFunds - o.priorAssistance, 0)));
    setInstitutionId(o.institutionId);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const amt = Number(amount);
    if (!purpose.trim()) e.purpose = "Describe the educational purpose.";
    if (!(amt > 0)) e.amount = "Enter the exact amount required.";
    else if (total > 0 && amt > total) e.amount = `Can't exceed your expense total of ${aed(total)}.`;
    if (!deadline) e.deadline = "Add the deadline.";
    else if (daysUntil(new Date(`${deadline}T12:00:00`).toISOString()) < 0) e.deadline = "That deadline has passed.";
    if (!expenses.length || expenses.some((x) => !x.label.trim() || !(x.amount > 0))) e.expenses = "List each expense with a description and amount.";
    if (explanation.trim().length < 15) e.explanation = "Add a short explanation (15+ characters). Only your verifying institution sees it.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = (send: boolean) => {
    if (send ? !validate() : !purpose.trim()) {
      if (!send) setErrors({ purpose: "Give the draft a purpose so you can find it later." });
      return;
    }
    dispatch(
      createRequest(
        { opportunityId: oppId === "none" ? null : oppId, purpose: purpose.trim(), amount: Number(amount) || 0, deadline: deadline ? new Date(`${deadline}T12:00:00`).toISOString() : new Date().toISOString(), expenses, explanation: explanation.trim(), documents: docs, institutionId },
        send,
      ),
      send ? { success: "Request submitted for verification" } : { info: "Draft saved" },
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New assistance request</DialogTitle>
          <DialogDescription>Tip: running BridgeEngine first usually lowers the amount you need to request.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="flex items-start gap-2 rounded-lg bg-primary-light/60 p-3 text-xs text-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            Your explanation and documents are visible only to your verifying institution. Sponsors see your educational goal, the verified amount and the deadline — never your personal circumstances.
          </p>
          <div>
            <Label htmlFor="rf-opp">Link to an opportunity (optional)</Label>
            <Select value={oppId} onValueChange={pick}>
              <SelectTrigger id="rf-opp" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">New opportunity</SelectItem>
                {mine.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
            <div>
              <Label htmlFor="rf-purpose">Educational purpose</Label>
              <Input id="rf-purpose" className="mt-1.5" value={purpose} onChange={(e) => setPurpose(e.target.value)} aria-invalid={!!errors.purpose} placeholder="e.g. Chemistry practical exam fee" />
              <FieldError>{errors.purpose}</FieldError>
            </div>
            <div>
              <Label htmlFor="rf-amount">Exact amount (AED)</Label>
              <Input id="rf-amount" className="mt-1.5 tabular" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={!!errors.amount} />
              <FieldError>{errors.amount}</FieldError>
            </div>
            <div>
              <Label htmlFor="rf-deadline">Deadline</Label>
              <Input id="rf-deadline" type="date" className="mt-1.5" value={deadline} onChange={(e) => setDeadline(e.target.value)} aria-invalid={!!errors.deadline} />
              <FieldError>{errors.deadline}</FieldError>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">Financial breakdown {total > 0 && <span className="font-normal text-muted-foreground">· total {aed(total)}</span>}</p>
            <ExpenseEditor expenses={expenses} onChange={setExpenses} idPrefix="rf" />
            <FieldError>{errors.expenses}</FieldError>
          </div>
          <div>
            <Label htmlFor="rf-why">Explanation of need (private)</Label>
            <Textarea id="rf-why" className="mt-1.5" value={explanation} onChange={(e) => setExplanation(e.target.value)} aria-invalid={!!errors.explanation} placeholder="A sentence or two is enough. Share only what you're comfortable with." />
            <FieldError>{errors.explanation}</FieldError>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-sm font-medium">Supporting documents</p>
              <ul className="space-y-1.5">
                {docs.map((d, i) => (
                  <li key={d.name} className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm">
                    <span className="truncate">{d.name}</span>
                    <label className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary hover:underline">
                      <FileUp className="h-3.5 w-3.5" /> {d.attached ? "Attached" : "Attach"}
                      <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && setDocs(docs.map((x, j) => (j === i ? { ...x, attached: true } : x)))} />
                    </label>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-[11px] text-muted-foreground">Demonstration only — files are never uploaded.</p>
            </div>
            <div>
              <Label htmlFor="rf-inst">Verification institution</Label>
              <Select value={institutionId} onValueChange={setInstitutionId}>
                <SelectTrigger id="rf-inst" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {state.institutions.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => submit(false)}>
            Save draft
          </Button>
          <Button onClick={() => submit(true)}>Submit for verification</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
