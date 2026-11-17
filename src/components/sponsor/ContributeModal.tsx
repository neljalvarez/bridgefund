"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import type { FundingRequest } from "@/lib/types";
import { useStore } from "@/lib/store";
import { fundRequest, remainingOf } from "@/lib/actions";
import { usd } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { Field, PixelLoader } from "@/components/ui/primitives";

export function ContributeModal({ request: r, open, onClose }: { request: FundingRequest; open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const remaining = remainingOf(r);
  const [amount, setAmount] = useState(String(remaining));
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(String(Math.min(remaining, state.sponsor.balance)));
      setDone(null);
      setProcessing(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = Number(amount);
  const error =
    !amount || isNaN(value) || value <= 0
      ? "Enter an amount greater than $0."
      : value > state.sponsor.balance
        ? `Your demo balance is ${usd(state.sponsor.balance)}.`
        : value > remaining
          ? `Only ${usd(remaining)} is needed — BridgeFund never over-funds a request.`
          : null;

  const submit = () => {
    if (error) return;
    setProcessing(true);
    setTimeout(() => {
      dispatch(fundRequest(r.id, value, "sponsor"), {
        sound: value >= remaining ? "unlock" : "coin",
        toast: { title: `${usd(value)} contributed`, body: value >= remaining ? `${r.ref} is now fully funded.` : `${r.ref} is partially funded.`, tone: "success" },
      });
      setProcessing(false);
      setDone("done");
    }, 900);
  };

  const latest = state.contributions.find((c) => c.requestId === r.id && c.source === "sponsor");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={done ? "Thank you" : `Support ${r.ref}`}
      size="sm"
      footer={
        done ? (
          <>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Close
            </button>
            {latest && (
              <Link href={`/receipt/${latest.id}`} className="btn-primary" onClick={onClose}>
                View impact receipt
              </Link>
            )}
          </>
        ) : (
          <>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={submit} disabled={!!error || processing}>
              {processing ? <PixelLoader label="Processing…" /> : `Contribute ${value > 0 && !isNaN(value) ? usd(value) : ""}`}
            </button>
          </>
        )
      }
    >
      {done ? (
        <div className="space-y-2 text-sm">
          <p className="font-pixel text-xl text-forest">Contribution recorded</p>
          <p>The verifying institution will pay the provider directly and confirm completion. Your impact receipt is ready.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-line bg-raised/50 p-3 text-sm">
            <p className="font-semibold">{r.purpose}</p>
            <p className="text-muted">Remaining verified gap: {usd(remaining)}</p>
          </div>
          <Field label="Amount (USD)" htmlFor="contrib-amount" error={error ?? undefined} hint={`Demo balance: ${usd(state.sponsor.balance)}`}>
            <input id="contrib-amount" inputMode="decimal" className="input font-pixel text-lg" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
          </Field>
          <div className="flex flex-wrap gap-2">
            {[10, 25, remaining].filter((v, i, a) => v <= remaining && a.indexOf(v) === i).map((v) => (
              <button key={v} type="button" className="btn-ghost btn-sm" onClick={() => setAmount(String(Math.min(v, state.sponsor.balance)))}>
                {v === remaining ? `Close the gap (${usd(v)})` : usd(v)}
              </button>
            ))}
          </div>
          <ul className="space-y-1.5 text-xs text-muted">
            <li className="flex gap-2">
              <ShieldCheck size={14} className="shrink-0 text-forest" /> Funds are paid directly to the exam board, school or provider — never as cash.
            </li>
            <li className="flex gap-2">
              <Lock size={14} className="shrink-0 text-forest" /> Simulated payment. No real money moves in this prototype.
            </li>
          </ul>
        </div>
      )}
    </Modal>
  );
}
