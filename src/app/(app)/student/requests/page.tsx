"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ChevronDown, FileCheck2, FileX2, Lock, Plus, Receipt, Send, Trash2 } from "lucide-react";
import type { FundingRequest } from "@/lib/types";
import { useStore } from "@/lib/store";
import { deleteDraft, remainingOf, respondToInfo, submitRequest } from "@/lib/actions";
import { institutionOf } from "@/lib/selectors";
import { fmtDate, fmtDateTime, usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { EmptyState, PageHeader, StatusBadge } from "@/components/shared/kit";
import { RequestBreakdown, StatusTrack } from "@/components/shared/RequestBreakdown";
import { RequestForm } from "@/components/student/RequestForm";

function RequestCard({ r }: { r: FundingRequest }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(r.status === "Draft" || r.status === "Additional Information Required" || r.status === "Fully Funded");
  const [reply, setReply] = useState("");
  const inst = institutionOf(state, r.institutionId);
  const receipt = state.contributions.find((c) => c.requestId === r.id && c.source === "sponsor");

  return (
    <Card>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full flex-col gap-3 p-5 text-left sm:flex-row sm:items-center" aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            {r.ref} · due {fmtDate(r.deadline)} · {inst?.name}
          </p>
          <p className="mt-0.5 font-medium">{r.purpose}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="font-semibold tabular">{usd(remainingOf(r))}</p>
          </div>
          <StatusBadge status={r.status} />
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>
      {open && (
        <CardContent className="space-y-5 border-t pt-5">
          {r.status === "Additional Information Required" && (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40" role="alert">
              <p className="flex items-start gap-2 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <span>
                  <strong>Additional information required.</strong> {r.infoRequested}
                </span>
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input aria-label="Your response" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Add a note or describe the document you attached" />
                <Button className="shrink-0" onClick={() => dispatch(respondToInfo(r.id, reply.trim()), { success: "Information sent to your institution" })}>
                  Send and attach documents
                </Button>
              </div>
            </div>
          )}
          <StatusTrack status={r.status} />
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-[13px] font-medium">Financial breakdown</p>
              <RequestBreakdown r={r} state={state} />
            </div>
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-[13px] font-medium">Funding progress</p>
                <Progress value={r.amount ? (r.funded / r.amount) * 100 : 100} />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {usd(r.funded)} of {usd(r.amount)} requested
                </p>
              </div>
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Private to your verifier
                </p>
                <p className="text-sm text-muted-foreground">{r.explanation}</p>
                <ul className="mt-2 space-y-1 text-xs">
                  {r.documents.map((d) => (
                    <li key={d.name} className="flex items-center gap-1.5">
                      {d.attached ? <FileCheck2 className="h-3.5 w-3.5 text-primary" /> : <FileX2 className="h-3.5 w-3.5 text-muted-foreground" />} {d.name}
                    </li>
                  ))}
                </ul>
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer text-[13px] font-medium">Status history ({r.history.length})</summary>
                <ol className="mt-2 space-y-1.5 border-l pl-3">
                  {[...r.history].reverse().map((h, i) => (
                    <li key={i} className="text-xs">
                      <span className="text-muted-foreground">{fmtDateTime(h.at)}</span> — {h.note}
                    </li>
                  ))}
                </ol>
              </details>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {r.status === "Draft" && (
              <>
                <Button size="sm" onClick={() => dispatch(submitRequest(r.id), { success: `${r.ref} submitted for verification` })}>
                  <Send /> Submit for verification
                </Button>
                <Button size="sm" variant="outline" onClick={() => dispatch(deleteDraft(r.id), { info: "Draft deleted" })}>
                  <Trash2 /> Delete draft
                </Button>
              </>
            )}
            {receipt && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/receipt/${receipt.id}`}>
                  <Receipt /> Impact receipt
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function RequestsPage() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  const mine = state.requests.filter((r) => r.studentId === state.currentStudentId);
  return (
    <>
      <PageHeader
        title="Assistance requests"
        description="Targeted, verified and private. Each request shows exactly how personal funds, savings and assistance add up."
        actions={
          <Button
            onClick={() => {
              setKey((k) => k + 1);
              setOpen(true);
            }}
          >
            <Plus /> New request
          </Button>
        }
      />
      {mine.length === 0 ? (
        <EmptyState title="No requests yet" description="Most students start with BridgeEngine — it often closes much of the gap before any request is needed." action={<Button asChild><Link href="/student/engine">Open BridgeEngine</Link></Button>} />
      ) : (
        <div className="space-y-4">
          {mine.map((r) => (
            <RequestCard key={r.id} r={r} />
          ))}
        </div>
      )}
      <RequestForm key={key} open={open} onOpenChange={setOpen} />
    </>
  );
}
