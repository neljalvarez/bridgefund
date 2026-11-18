"use client";

import { useState } from "react";
import { CheckCircle2, CircleDashed, Flag, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import type { FundingRequest } from "@/lib/types";
import { useStore } from "@/lib/store";
import { addFlag, resolveFlag, reviewDocument, setCheck } from "@/lib/actions";
import { verificationChecks, type CheckStatus } from "@/lib/verification";
import { fmtDateTime, aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const ICON: Record<CheckStatus, { icon: typeof CheckCircle2; cls: string }> = {
  pass: { icon: CheckCircle2, cls: "text-primary" },
  warn: { icon: ShieldAlert, cls: "text-warning" },
  fail: { icon: XCircle, cls: "text-destructive" },
  pending: { icon: CircleDashed, cls: "text-muted-foreground" },
};

export function VerificationPanel({ r }: { r: FundingRequest }) {
  const { state, dispatch } = useStore();
  const [note, setNote] = useState("");
  const checks = verificationChecks(state, r);
  const editable = !["Completed", "Rejected"].includes(r.status);
  const toggleable: Record<string, "enrollment" | "opportunity" | "expenses"> = { enrollment: "enrollment", opportunity: "opportunity", expenses: "expenses" };
  const openFlags = (r.flags ?? []).filter((f) => !f.resolved);
  const contributions = state.contributions.filter((c) => c.requestId === r.id);
  const payments = state.payments.filter((p) => p.requestId === r.id);

  return (
    <div className="grid grid-cols-1 gap-5 rounded-lg border bg-muted/20 p-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium">
          <ShieldCheck className="h-4 w-4 text-primary" /> Verification checklist
        </p>
        <ul className="space-y-2">
          {checks.map((c) => {
            const I = ICON[c.status];
            const key = toggleable[c.key];
            return (
              <li key={c.key} className="flex items-start gap-2.5 text-sm">
                <I.icon className={cn("mt-0.5 h-4 w-4 shrink-0", I.cls)} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{c.label}</span>
                  <span className="block text-xs text-muted-foreground">{c.detail}</span>
                </span>
                {key && editable && (
                  <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    Verified
                    <Switch checked={!!r.checks?.[key]} onCheckedChange={(v) => dispatch(setCheck(r.id, key, v))} aria-label={`${c.label} verified`} />
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[13px] font-medium">Document review</p>
          <ul className="space-y-1.5">
            {r.documents.map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">
                  {d.name} {!d.attached && <span className="text-xs text-destructive">(not uploaded)</span>}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <Badge variant={d.review === "Accepted" ? "success" : d.review === "Rejected" ? "danger" : "neutral"}>{d.review ?? "Pending"}</Badge>
                  {editable && d.attached && d.review !== "Accepted" && (
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => dispatch(reviewDocument(r.id, d.name, "Accepted"), { info: `${d.name} accepted` })}>
                      Accept
                    </Button>
                  )}
                  {editable && d.attached && d.review !== "Rejected" && (
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => dispatch(reviewDocument(r.id, d.name, "Rejected"), { info: `${d.name} rejected — student notified` })}>
                      Reject
                    </Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium">
            <Flag className="h-3.5 w-3.5" /> Manual review flags
          </p>
          {(r.flags ?? []).length === 0 && <p className="text-xs text-muted-foreground">No flags raised.</p>}
          <ul className="space-y-1.5">
            {(r.flags ?? []).map((f) => (
              <li key={f.id} className={cn("flex items-start justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs", f.resolved ? "bg-muted text-muted-foreground line-through" : "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200")}>
                <span>
                  {f.note} <span className="opacity-70">· {f.by === "system" ? "automatic check" : "staff"}</span>
                </span>
                {!f.resolved && editable && (
                  <button type="button" className="shrink-0 font-medium underline" onClick={() => dispatch(resolveFlag(r.id, f.id), { info: "Flag resolved" })}>
                    Resolve
                  </button>
                )}
              </li>
            ))}
          </ul>
          {editable && (
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (note.trim().length < 4) return;
                dispatch(addFlag(r.id, note.trim()), { info: "Flagged for manual review" });
                setNote("");
              }}
            >
              <Input aria-label="Flag note" className="h-8 text-xs" placeholder="Reason for manual review…" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button type="submit" size="sm" variant="outline" disabled={note.trim().length < 4}>
                Flag
              </Button>
            </form>
          )}
          {openFlags.length > 0 && <p className="mt-1.5 text-[11px] text-muted-foreground">Flags never block or approve a request on their own — a staff member decides.</p>}
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium">Funding history</p>
          {contributions.length === 0 && payments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No funds received yet.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {contributions.map((c) => (
                <li key={c.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {fmtDateTime(c.at)} · {c.sourceLabel}
                  </span>
                  <span className="tabular">+{aed(c.amount)}</span>
                </li>
              ))}
              {payments.map((p) => (
                <li key={p.id} className="flex justify-between gap-2 font-medium">
                  <span>
                    Paid to {p.provider} · {p.reference} <Badge variant="outline" className="ms-1 border-dashed">Simulated</Badge>
                  </span>
                  <span className="tabular">{aed(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
