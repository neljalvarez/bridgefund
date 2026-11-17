"use client";

import { useMemo, useState } from "react";
import { Bus, Check, Gift, Package, Ticket } from "lucide-react";
import { useStore } from "@/lib/store";
import { assignMatch } from "@/lib/actions";
import { findMatches, type MatchKind, type MatchSuggestion } from "@/lib/matching";
import { studentOf } from "@/lib/selectors";
import { fmtDateTime, usd } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState, PageHeader } from "@/components/shared/kit";

const KIND: Record<MatchKind, { label: string; icon: typeof Package }> = {
  resource: { label: "Lending inventory", icon: Package },
  waiver: { label: "Fee reduction", icon: Ticket },
  transport: { label: "Transport assistance", icon: Bus },
  grant: { label: "Grant programme", icon: Gift },
};

export default function MatchingPage() {
  const { state, dispatch } = useStore();
  const [kind, setKind] = useState<"all" | MatchKind>("all");
  const [confirming, setConfirming] = useState<MatchSuggestion | null>(null);
  const [checked, setChecked] = useState(false);
  const matches = useMemo(() => findMatches(state).filter((m) => state.currentInstitutionId === "all" || state.opportunities.find((o) => o.id === m.opportunityId)?.institutionId === state.currentInstitutionId), [state]);
  const list = matches.filter((m) => kind === "all" || m.kind === kind);

  return (
    <>
      <PageHeader
        title="Needs matching"
        description="Needs paired with resources and programmes. Confirm, then assign — once."
      />
      <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)} className="mb-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="all">All ({matches.length})</TabsTrigger>
          {(Object.keys(KIND) as MatchKind[]).map((k) => (
            <TabsTrigger key={k} value={k}>
              {KIND[k].label} ({matches.filter((m) => m.kind === k).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {list.length === 0 ? (
          <EmptyState title="No open matches" description="Every current need is either covered or has no matching resource." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((m) => {
              const st = studentOf(state, m.studentId);
              const K = KIND[m.kind];
              const req = state.requests.find((r) => r.id === m.requestId);
              return (
                <Card key={m.key} className="flex flex-col">
                  <CardContent className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="accent">
                        <K.icon /> {K.label}
                      </Badge>
                      <span className="text-sm font-semibold text-primary tabular">−{usd(m.amount)}</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Need · {st?.firstName}, {st?.city} {req ? `· ${req.ref}` : "· no request yet"}
                      </p>
                      <p className="font-medium">{m.expense.label}</p>
                      <p className="mt-1 text-sm">
                        <span className="text-muted-foreground">Match:</span> {m.sourceName}
                      </p>
                    </div>
                    <ul className="space-y-0.5 text-xs text-muted-foreground">
                      {m.reasons.map((x) => (
                        <li key={x} className="flex gap-1.5">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {x}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
                      <span className={`text-xs ${m.available ? "text-muted-foreground" : "text-warning"}`}>{m.availability}</span>
                      <Button
                        size="sm"
                        disabled={!m.available}
                        onClick={() => {
                          setChecked(false);
                          setConfirming(m);
                        }}
                      >
                        {req || m.kind === "resource" ? "Confirm and assign" : "Suggest to student"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Assigned matches</CardTitle>
          </CardHeader>
          <CardContent>
            {state.matches.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing assigned yet.</p>
            ) : (
              <ul className="space-y-2.5 text-sm">
                {state.matches.map((m) => (
                  <li key={m.key}>
                    <p>{m.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {studentOf(state, m.studentId)?.firstName} · {m.status} · {fmtDateTime(m.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!confirming} onOpenChange={(o) => !o && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm availability</DialogTitle>
            <DialogDescription>
              {confirming?.sourceName} for {studentOf(state, confirming?.studentId ?? "")?.firstName}&apos;s “{confirming?.expense.label}”.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} className="mt-0.5" />
            {confirming?.kind === "resource" ? "I have confirmed the item is physically available and in working condition." : "I have confirmed the programme has capacity and the student meets its eligibility rules."}
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
            <Button
              disabled={!checked}
              onClick={() => {
                if (confirming) dispatch(assignMatch(confirming), { success: "Match assigned", description: "The student has been notified." });
                setConfirming(null);
              }}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
