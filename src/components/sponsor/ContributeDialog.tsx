"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import type { FundingRequest } from "@/lib/types";
import { useStore } from "@/lib/store";
import { currentSponsor, fundRequest, remainingOf } from "@/lib/actions";
import { aed } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldError } from "@/components/shared/kit";

export function ContributeDialog({ request: r, open, onOpenChange }: { request: FundingRequest; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state, dispatch } = useStore();
  const sponsor = currentSponsor(state);
  const remaining = remainingOf(r);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(String(Math.min(remaining, sponsor.balance)));
      setReceiptId(null);
      setBusy(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (busy) return;
    if (receiptId === "pending") {
      const c = state.contributions.find((x) => x.requestId === r.id && x.sponsorId === sponsor.id);
      if (c) setReceiptId(c.id);
    }
  }, [state.contributions, receiptId, busy, r.id, sponsor.id]);

  const v = Number(amount);
  const err = !(v > 0) ? "Enter an amount greater than AED 0." : v > remaining ? `Only ${aed(remaining)} is needed — contributions can't exceed the remaining gap.` : v > sponsor.balance ? `Your available balance is ${aed(sponsor.balance)}.` : null;

  const submit = () => {
    if (err) return;
    setBusy(true);
    setTimeout(() => {
      dispatch(fundRequest(r.id, v, "sponsor"), { success: `${aed(v)} contributed to ${r.ref}`, description: v >= remaining ? "The request is now fully funded." : undefined });
      setBusy(false);
      setReceiptId("pending");
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {receiptId ? (
          <>
            <DialogHeader>
              <CheckCircle2 className="mb-2 h-8 w-8 text-primary" />
              <DialogTitle>Contribution recorded</DialogTitle>
              <DialogDescription>The verifying institution pays the provider directly and confirms completion. Your impact receipt is ready.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {receiptId !== "pending" && (
                <Button asChild>
                  <Link href={`/receipt/${receiptId}`}>View impact receipt</Link>
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Support {r.ref}</DialogTitle>
              <DialogDescription>{r.purpose}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Remaining verified gap</p>
                <p className="font-semibold tabular">{aed(remaining)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{sponsor.name} balance</p>
                <p className="font-semibold tabular">{aed(sponsor.balance)}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="contrib">Contribution (AED)</Label>
              <Input id="contrib" className="mt-1.5 text-base tabular" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={!!err} />
              <FieldError>{amount ? err : null}</FieldError>
              <div className="mt-2 flex flex-wrap gap-2">
                {[...new Set([10, 25, remaining])].filter((x) => x <= remaining).map((x) => (
                  <Button key={x} type="button" variant="outline" size="sm" onClick={() => setAmount(String(Math.min(x, sponsor.balance)))}>
                    {x === remaining ? `Close the gap · ${aed(x)}` : aed(x)}
                  </Button>
                ))}
              </div>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" /> Paid directly to the exam board, school or provider — never as cash.
              </li>
              <li className="flex gap-2">
                <Lock className="h-3.5 w-3.5 shrink-0 text-primary" /> Simulated transaction. No real money is transferred.
              </li>
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={!!err || busy}>
                {busy ? <Loader2 className="animate-spin" /> : null}
                {busy ? "Processing…" : `Contribute ${v > 0 ? aed(v) : ""}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
