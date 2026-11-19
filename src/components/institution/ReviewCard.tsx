"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, FileCheck2, FileX2, HandCoins, Lock, MessageSquareWarning, Package, Ticket, XCircle } from "lucide-react";
import type { FundingRequest } from "@/lib/types";
import { useStore } from "@/lib/store";
import { approveRequest, assignWaiver, confirmCompleted, fundRequest, recordOutcome, rejectRequest, remainingOf, requestInfo, reserveResource, setPriority, startReview } from "@/lib/actions";
import { verificationChecks } from "@/lib/verification";
import { VerificationPanel } from "./VerificationPanel";
import { institutionOf, oppOf, studentOf } from "@/lib/selectors";
import { WAIVERS } from "@/lib/knowledge";
import { waiverValue } from "@/lib/engine";
import { LEVEL_LABEL, fmtDate, isoDaysFromNow, relDays, urgencyOf, aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError, StatusBadge, UrgencyBadge } from "@/components/shared/kit";
import { RequestBreakdown } from "@/components/shared/RequestBreakdown";

type DialogKind = null | "info" | "reject" | "waiver" | "resource" | "funds" | "approve";
const PENDING = ["Submitted", "Under Review", "Additional Information Required"];

export function ReviewCard({ r, defaultOpen, highlight }: { r: FundingRequest; defaultOpen?: boolean; highlight?: boolean }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(!!defaultOpen || !!highlight);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [text, setText] = useState("");
  const [waiverId, setWaiverId] = useState("");
  const [resId, setResId] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<"institution" | "pool">("institution");

  const st = studentOf(state, r.studentId)!;
  const inst = institutionOf(state, r.institutionId);
  const opp = oppOf(state, r.opportunityId);
  const remaining = remainingOf(r);
  const pending = PENDING.includes(r.status);
  const funding = ["Verified", "Partially Funded"].includes(r.status);
  const waivers = WAIVERS.filter((w) => (!opp || w.categories.includes(opp.category)) && (w.countries.includes("Global") || w.countries.includes(st.country)) && !r.reductions.some((x) => x.sourceId === w.id));
  const resources = state.resources.filter((x) => x.available > 0);
  const waiver = WAIVERS.find((w) => w.id === waiverId);
  const base = r.expenses.filter((e) => waiver?.expenseCategories.includes(e.category)).reduce((a, e) => a + e.amount, 0);
  const suggested = waiver ? Math.min(waiverValue(waiver, base || remaining), remaining) : 0;
  const fundsAvail = source === "pool" ? state.pool : inst?.fund ?? 0;
  const fundAmt = Number(amount);
  const fundErr = !(fundAmt > 0) ? "Enter an amount." : fundAmt > remaining ? `Only ${aed(remaining)} remains — contributions can't exceed the gap.` : fundAmt > fundsAvail ? "Not enough in this fund." : null;

  const checks = verificationChecks(state, r);
  const openIssues = checks.filter((c) => c.status !== "pass").length + (r.flags ?? []).filter((f) => !f.resolved).length;
  const approve = () => dispatch(approveRequest(r.id), { success: `${r.ref} verified`, description: r.amount > 0 ? "Savings confirmed and the need is now visible to sponsors." : "Savings confirmed — the gap is closed." });

  const close = () => {
    setDialog(null);
    setText("");
    setAmount("");
  };

  return (
    <Card id={`req-${r.id}`} className={cn("overflow-hidden", highlight && "ring-2 ring-primary/50")}>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full flex-col gap-3 p-4 text-start transition-colors hover:bg-muted/30 sm:flex-row sm:items-center" aria-expanded={open}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar>
            <AvatarFallback>{st.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{r.purpose}</p>
            <p className="truncate text-xs text-muted-foreground">
              {r.ref} · {st.firstName} · {st.grade} · {inst?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {r.priority && <span className="rounded-md bg-destructive-soft px-1.5 py-0.5 text-[11px] font-medium text-destructive">Priority</span>}
          {openIssues > 0 && PENDING.includes(r.status) && <span className="rounded-md bg-warning-soft px-1.5 py-0.5 text-[11px] font-medium text-warning">{openIssues} check{openIssues === 1 ? "" : "s"} open</span>}
          <UrgencyBadge label={urgencyOf(r.deadline).label} />
          <span className="min-w-[5.5rem] text-end font-semibold tabular">{aed(remaining)}</span>
          <StatusBadge status={r.status} />
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>
      {open && (
        <div className="space-y-5 border-t p-4">
          {r.status === "Additional Information Required" && <p className="rounded-md border-s-2 border-warning bg-warning-soft px-3 py-2 text-sm text-warning">Waiting for the student: “{r.infoRequested}”</p>}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <p className="mb-2 text-[13px] font-medium">Financial breakdown</p>
              <RequestBreakdown r={r} state={state} />
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Confidential — verifier only
              </p>
              <p className="text-sm text-muted-foreground">{r.explanation}</p>
              <ul className="mt-3 space-y-1 text-xs">
                {r.documents.map((d) => (
                  <li key={d.name} className="flex items-center gap-1.5">
                    {d.attached ? <FileCheck2 className="h-3.5 w-3.5 text-primary" /> : <FileX2 className="h-3.5 w-3.5 text-destructive" />} {d.name} {!d.attached && <span className="text-muted-foreground">(missing)</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                {LEVEL_LABEL[st.level]} · {st.city}, {st.emirate} · {st.residency} · age {st.age}
              </p>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium">Funding</p>
              <Progress aria-label="Share of the need funded" value={r.amount ? (r.funded / r.amount) * 100 : 100} />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {aed(r.funded)} of {aed(r.amount)} · due {fmtDate(r.deadline)} ({relDays(r.deadline)})
              </p>
              {opp && <p className="mt-3 text-xs text-muted-foreground">Expected outcome: {opp.outcome}</p>}
            </div>
          </div>
          <VerificationPanel r={r} />
          {r.status === "Completed" && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3 text-sm">
              <span className="text-muted-foreground">Educational outcome:</span>
              {(["Participated", "Completed opportunity", "Did not participate"] as const).map((o) => (
                <Button key={o} size="sm" variant={r.outcome === o ? "default" : "outline"} onClick={() => dispatch(recordOutcome(r.id, o), { success: "Outcome recorded" })}>
                  {o}
                </Button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {!["Completed", "Rejected"].includes(r.status) && (
              <Button size="sm" variant="ghost" onClick={() => dispatch(setPriority(r.id, !r.priority), { info: r.priority ? "Priority review removed" : "Marked for priority review" })}>
                {r.priority ? "Remove priority" : "Mark priority review"}
              </Button>
            )}
            {r.status === "Submitted" && (
              <Button size="sm" variant="outline" onClick={() => dispatch(startReview(r.id), { info: `Reviewing ${r.ref}` })}>
                Start review
              </Button>
            )}
            {pending && (
              <>
                <Button size="sm" onClick={() => (openIssues > 0 ? setDialog("approve") : approve())}>
                  <CheckCircle2 /> Approve and verify
                </Button>
                {r.status !== "Additional Information Required" && (
                  <Button size="sm" variant="outline" onClick={() => setDialog("info")}>
                    <MessageSquareWarning /> Request documents
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setDialog("reject")}>
                  <XCircle /> Reject
                </Button>
              </>
            )}
            {(pending || funding) && (
              <>
                <Button size="sm" variant="outline" onClick={() => setDialog("waiver")}>
                  <Ticket /> Assign fee waiver
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDialog("resource")}>
                  <Package /> Reserve equipment
                </Button>
              </>
            )}
            {funding && (
              <Button
                size="sm"
                variant="soft"
                onClick={() => {
                  setAmount(String(Math.min(remaining, inst?.fund ?? 0)));
                  setDialog("funds");
                }}
              >
                <HandCoins /> Allocate funding
              </Button>
            )}
            {r.status === "Fully Funded" && (
              <Button size="sm" onClick={() => dispatch(confirmCompleted(r.id), { success: `${r.ref} completed`, description: "Provider paid. Student and sponsors notified." })}>
                <CheckCircle2 /> Confirm assistance completed
              </Button>
            )}
          </div>
        </div>
      )}

      <Dialog open={dialog === "info"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request additional documentation</DialogTitle>
            <DialogDescription>The student is notified privately and the request moves to “Additional Information Required”.</DialogDescription>
          </DialogHeader>
          <Label htmlFor={`info-${r.id}`}>What do you need?</Label>
          <Textarea id={`info-${r.id}`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Please attach the exam board's fee confirmation email." />
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              disabled={text.trim().length < 5}
              onClick={() => {
                dispatch(requestInfo(r.id, text.trim()), { info: "Student notified" });
                close();
              }}
            >
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "approve"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve with open items?</DialogTitle>
            <DialogDescription>{openIssues} verification item(s) are incomplete or flagged. Automated checks only advise — the decision is yours.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-1 text-sm">
            {checks.filter((c) => c.status !== "pass").map((c) => (
              <li key={c.key}>
                <strong>{c.label}:</strong> <span className="text-muted-foreground">{c.detail}</span>
              </li>
            ))}
            {(r.flags ?? []).filter((f) => !f.resolved).map((f) => (
              <li key={f.id}>
                <strong>Flag:</strong> <span className="text-muted-foreground">{f.note}</span>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Keep reviewing
            </Button>
            <Button
              onClick={() => {
                approve();
                close();
              }}
            >
              Approve anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "reject"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {r.ref}</DialogTitle>
            <DialogDescription>Share the reason privately with the student and suggest an alternative where possible.</DialogDescription>
          </DialogHeader>
          <Label htmlFor={`rej-${r.id}`}>Reason</Label>
          <Textarea id={`rej-${r.id}`} value={text} onChange={(e) => setText(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={text.trim().length < 5}
              onClick={() => {
                dispatch(rejectRequest(r.id, text.trim()), { info: `${r.ref} rejected` });
                close();
              }}
            >
              Reject request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "waiver"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign a fee waiver</DialogTitle>
            <DialogDescription>Waivers are confirmed savings. Each waiver can be applied once and never beyond the remaining gap.</DialogDescription>
          </DialogHeader>
          {waivers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No further waivers in the directory apply to this request.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Waiver or programme</Label>
                <Select
                  value={waiverId}
                  onValueChange={(v) => {
                    setWaiverId(v);
                    setAmount("");
                  }}
                >
                  <SelectTrigger className="mt-1.5" aria-label="Waiver">
                    <SelectValue placeholder="Select a waiver" />
                  </SelectTrigger>
                  <SelectContent>
                    {waivers.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {waiver && (
                <div>
                  <Label htmlFor={`wa-${r.id}`}>Reduction (AED)</Label>
                  <Input id={`wa-${r.id}`} className="mt-1.5 tabular" inputMode="decimal" placeholder={String(suggested)} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
                  <p className="mt-1 text-xs text-muted-foreground">Suggested {aed(suggested)} · capped at the remaining {aed(remaining)}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              disabled={!waiver || !(Number(amount || suggested) > 0)}
              onClick={() => {
                dispatch(assignWaiver(r.id, waiverId, Number(amount) || suggested), { success: "Waiver assigned" });
                setWaiverId("");
                close();
              }}
            >
              Assign waiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "resource"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve equipment for {st.firstName}</DialogTitle>
            <DialogDescription>The item is held for pickup in two days and appears in the student&apos;s Resource Rescue.</DialogDescription>
          </DialogHeader>
          <Select value={resId} onValueChange={setResId}>
            <SelectTrigger aria-label="Resource">
              <SelectValue placeholder="Select an available item" />
            </SelectTrigger>
            <SelectContent>
              {resources.map((x) => (
                <SelectItem key={x.id} value={x.id}>
                  {x.name} — {x.available} left · saves {aed(x.retailValue)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              disabled={!resId}
              onClick={() => {
                dispatch(reserveResource(resId, r.studentId, isoDaysFromNow(2)), { success: "Equipment reserved for the student" });
                setResId("");
                close();
              }}
            >
              Reserve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "funds"} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate funding to {r.ref}</DialogTitle>
            <DialogDescription>Funds are paid directly to the provider when you confirm completion.</DialogDescription>
          </DialogHeader>
          <RadioGroup value={source} onValueChange={(v) => setSource(v as typeof source)}>
            {(
              [
                ["institution", `${inst?.name} assistance fund`, inst?.fund ?? 0],
                ["pool", "Shared opportunity pool", state.pool],
              ] as const
            ).map(([k, l, v]) => (
              <label key={k} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm has-[:checked]:border-primary">
                <RadioGroupItem value={k} />
                <span className="flex-1">{l}</span>
                <span className="font-medium tabular">{aed(v)}</span>
              </label>
            ))}
          </RadioGroup>
          <div>
            <Label htmlFor={`fa-${r.id}`}>Amount (AED)</Label>
            <Input id={`fa-${r.id}`} className="mt-1.5 tabular" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={!!fundErr} />
            <FieldError>{amount && fundErr}</FieldError>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              disabled={!!fundErr}
              onClick={() => {
                dispatch(fundRequest(r.id, fundAmt, source), { success: `${aed(fundAmt)} allocated to ${r.ref}` });
                close();
              }}
            >
              Allocate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
