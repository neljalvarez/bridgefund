"use client";

import { BadgeCheck, CheckCircle2, Clock } from "lucide-react";
import type { AppState, Contribution } from "@/lib/types";
import { remainingOf } from "@/lib/actions";
import { institutionOf, oppOf } from "@/lib/selectors";
import { fmtDateLong, aed } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { LogoMark } from "@/components/shared/Logo";

const anonRef = (requestId: string) => {
  let h = 0;
  for (const ch of requestId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `STU-${h.toString(36).toUpperCase().slice(0, 5).padStart(5, "0")}`;
};

export function receiptData(state: AppState, c: Contribution) {
  const r = state.requests.find((x) => x.id === c.requestId)!;
  const opp = oppOf(state, r.opportunityId);
  const inst = institutionOf(state, r.institutionId);
  const completedAt = r.status === "Completed" ? r.history.findLast((h) => h.status === "Completed")?.at : undefined;
  const verifiedAt = r.history.find((h) => h.status === "Verified")?.at;
  const lines: { label: string; amount: number; kind: "total" | "minus" | "this" }[] = [
    { label: "Total educational cost", amount: r.totalCost, kind: "total" },
    { label: "Student's personal funds", amount: r.studentFunds, kind: "minus" },
    ...r.reductions.map((x) => ({ label: `${x.title}${x.confirmed ? "" : " (estimated)"}`, amount: x.amount, kind: "minus" as const })),
    ...state.contributions.filter((x) => x.requestId === r.id && x.id !== c.id).map((x) => ({ label: `Other assistance · ${x.sourceLabel}`, amount: x.amount, kind: "minus" as const })),
    { label: `This contribution · ${c.sourceLabel}`, amount: c.amount, kind: "this" },
  ];
  return {
    r,
    opp,
    inst,
    number: `IR-${r.ref.replace("BF-", "")}-${c.id.slice(-4).toUpperCase()}`,
    anon: `${r.ref} · ${anonRef(r.id)}`,
    completedAt,
    verifiedAt,
    lines,
    remaining: remainingOf(r),
  };
}

export function ImpactReceipt({ state, contribution: c }: { state: AppState; contribution: Contribution }) {
  const d = receiptData(state, c);
  return (
    <Card className="mx-auto max-w-2xl overflow-hidden print:border-0 print:shadow-none">
      <div className="flex items-start justify-between gap-4 border-b p-6">
        <div className="flex items-center gap-3">
          <LogoMark className="h-9 w-9" />
          <div>
            <p className="text-lg font-semibold tracking-tight">BridgeFund</p>
            <p className="text-xs text-muted-foreground">Digital impact receipt</p>
          </div>
        </div>
        <div className="text-end text-xs text-muted-foreground">
          <p className="font-mono text-foreground">{d.number}</p>
          <p>Issued {fmtDateLong(c.at)}</p>
        </div>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs text-muted-foreground">Educational expense covered</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">{d.r.purpose}</p>
          <p className="mt-1 text-sm text-muted-foreground">{d.r.expenses.map((e) => e.label).join(" · ")}</p>
        </div>
        <div className="sm:text-end">
          <p className="text-xs text-muted-foreground">Contribution amount</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-primary tabular">{aed(c.amount)}</p>
        </div>
      </div>

      <dl className="grid gap-5 border-t p-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Anonymous recipient reference</dt>
          <dd className="mt-1 font-mono">{d.anon}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Verification status</dt>
          <dd className="mt-1 flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-primary" /> Verified by {d.inst?.name}
            {d.verifiedAt && <span className="text-muted-foreground">· {fmtDateLong(d.verifiedAt)}</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Completion date</dt>
          <dd className="mt-1 flex items-center gap-1.5">
            {d.completedAt ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-primary" /> {fmtDateLong(d.completedAt)}
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-warning" /> {d.r.status === "Fully Funded" ? "Awaiting payment to provider" : `${d.r.status} — ${aed(d.remaining)} still needed`}
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Educational outcome</dt>
          <dd className="mt-1">{d.opp?.outcome ?? d.r.purpose}</dd>
        </div>
      </dl>

      <div className="border-t p-6">
        <p className="mb-3 text-xs text-muted-foreground">Breakdown of assistance</p>
        <table className="w-full text-sm">
          <tbody>
            {d.lines.map((l, i) => (
              <tr key={i} className={l.kind === "this" ? "bg-primary-light/60 font-medium" : "border-b"}>
                <td className="px-2 py-2">{l.label}</td>
                <td className="px-2 py-2 text-end tabular">{l.kind === "total" ? aed(l.amount) : `−${aed(l.amount)}`}</td>
              </tr>
            ))}
            <tr>
              <td className="px-2 pt-3 font-semibold">Remaining financial gap</td>
              <td className="px-2 pt-3 text-end text-lg font-semibold tabular">{aed(d.remaining)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs text-muted-foreground">Funds are paid by the verifying institution directly to the provider. No cash is transferred to students.</p>
      </div>
      <div className="border-t bg-muted/40 px-6 py-3 text-[11px] text-muted-foreground">Demonstration receipt from a competition prototype. All people, institutions and amounts are fictional; no real money was transferred. Not a tax document.</div>
    </Card>
  );
}

export function receiptHtml(state: AppState, c: Contribution) {
  const d = receiptData(state, c);
  const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
  const rows = d.lines.map((l) => `<tr${l.kind === "this" ? ' class="this"' : ""}><td>${esc(l.label)}</td><td class="r">${l.kind === "total" ? aed(l.amount) : "−" + aed(l.amount)}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>BridgeFund impact receipt ${d.number}</title><style>
body{font-family:Inter,system-ui,sans-serif;background:#F8FAFC;color:#101828;padding:40px}
.c{max-width:640px;margin:auto;background:#fff;border:1px solid #E4E7EC;border-radius:12px;padding:28px}
.m{color:#667085;font-size:12px}h1{font-size:18px;margin:0}h2{font-size:20px;margin:4px 0}.big{font-size:30px;font-weight:600;color:#126B54}
dl{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}dt{font-size:12px;color:#667085}dd{margin:4px 0 0}
table{width:100%;border-collapse:collapse}td{padding:8px 6px;border-bottom:1px solid #E4E7EC;font-size:14px}.r{text-align:right}.this{background:#E7F4EF;font-weight:600}
</style></head><body><div class="c">
<h1>BridgeFund — Digital impact receipt</h1><p class="m">${d.number} · issued ${fmtDateLong(c.at)}</p>
<p class="m">Educational expense covered</p><h2>${esc(d.r.purpose)}</h2>
<p class="m">Contribution amount</p><div class="big">${aed(c.amount)}</div>
<dl><div><dt>Anonymous recipient reference</dt><dd>${d.anon}</dd></div>
<div><dt>Verification status</dt><dd>Verified by ${esc(d.inst?.name ?? "")}</dd></div>
<div><dt>Completion date</dt><dd>${d.completedAt ? fmtDateLong(d.completedAt) : "Awaiting payment to provider"}</dd></div>
<div><dt>Educational outcome</dt><dd>${esc(d.opp?.outcome ?? d.r.purpose)}</dd></div></dl>
<table>${rows}<tr><td><b>Remaining financial gap</b></td><td class="r"><b>${aed(d.remaining)}</b></td></tr></table>
<p class="m" style="margin-top:20px">Demonstration receipt from a competition prototype. All people, institutions and amounts are fictional; no real money was transferred. Not a tax document.</p>
</div></body></html>`;
}
