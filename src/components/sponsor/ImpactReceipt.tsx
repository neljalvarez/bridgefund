"use client";

import { BadgeCheck } from "lucide-react";
import type { AppState, Contribution } from "@/lib/types";
import { institutionOf, oppOf, studentOf } from "@/lib/selectors";
import { remainingOf } from "@/lib/actions";
import { fmtDateLong, usd } from "@/lib/format";
import { LogoMark } from "@/components/layout/Logo";

export function receiptData(state: AppState, c: Contribution) {
  const r = state.requests.find((x) => x.id === c.requestId)!;
  const opp = oppOf(state, r.opportunityId);
  const st = studentOf(state, r.studentId);
  const inst = institutionOf(state, st?.institutionId ?? "");
  const others = state.contributions.filter((x) => x.requestId === r.id && x.id !== c.id);
  const number = `IR-${r.ref.replace("BF-", "")}-${c.id.slice(-4).toUpperCase()}`;
  const status = r.status === "Completed" ? "Completed — paid to provider" : r.status === "Fully Funded" ? "Fully funded — awaiting provider payment confirmation" : `${r.status} — ${usd(remainingOf(r))} still needed`;
  const lines = [
    { label: "Total educational cost", amount: r.totalCost, kind: "total" as const },
    { label: "Student's own contribution", amount: -r.studentFunds, kind: "minus" as const },
    ...r.reductions.map((x) => ({ label: x.title, amount: -x.amount, kind: "minus" as const })),
    ...others.map((x) => ({ label: `Other support · ${x.sponsorName}`, amount: -x.amount, kind: "minus" as const })),
    { label: `This contribution · ${c.sponsorName}`, amount: -c.amount, kind: "this" as const },
  ];
  return { r, opp, st, inst, number, status, lines, remaining: remainingOf(r) };
}

export function ImpactReceipt({ state, contribution: c }: { state: AppState; contribution: Contribution }) {
  const d = receiptData(state, c);
  return (
    <article className="panel mx-auto max-w-2xl bg-surface print:shadow-none" aria-label="Impact receipt">
      <header className="flex items-start justify-between gap-4 border-b-2 border-line p-5">
        <div className="flex items-center gap-3">
          <LogoMark size={36} />
          <div>
            <p className="font-pixel text-xl leading-none">BridgeFund</p>
            <p className="text-xs text-muted">Digital impact receipt</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-mono">{d.number}</p>
          <p className="text-muted">{fmtDateLong(c.at)}</p>
        </div>
      </header>

      <div className="grid gap-4 border-b-2 border-dashed border-line/40 p-5 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Educational expense covered</p>
          <p className="font-pixel text-2xl leading-tight">{d.r.purpose}</p>
          <p className="mt-1 text-sm text-muted">{d.r.expenses.map((e) => e.label).join(" · ")}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Amount contributed</p>
          <p className="font-pixel text-4xl text-forest">{usd(c.amount)}</p>
        </div>
      </div>

      <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Verified recipient reference</dt>
          <dd className="flex items-center gap-1.5 font-mono">
            <BadgeCheck size={14} className="text-forest" /> {d.r.ref}-{d.st?.initials}
          </dd>
          <dd className="text-xs text-muted">Verified by {d.inst?.name}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Completion status</dt>
          <dd className="font-semibold">{d.status}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Educational outcome</dt>
          <dd>{d.opp?.outcome ?? d.r.purpose}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">Date of assistance</dt>
          <dd>{fmtDateLong(c.at)}</dd>
        </div>
      </dl>

      <div className="border-t-2 border-line p-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Breakdown of funds</p>
        <table className="w-full text-sm">
          <tbody>
            {d.lines.map((l, i) => (
              <tr key={i} className={`border-b border-line/15 ${l.kind === "this" ? "bg-gold/25 font-semibold" : ""}`}>
                <td className="px-1 py-1.5">{l.label}</td>
                <td className={`px-1 py-1.5 text-right font-mono ${l.kind === "total" ? "font-semibold" : ""}`}>{l.kind === "total" ? usd(l.amount) : `−${usd(-l.amount)}`}</td>
              </tr>
            ))}
            <tr>
              <td className="px-1 py-2 font-semibold">Remaining financial gap</td>
              <td className="px-1 py-2 text-right font-pixel text-xl">{usd(d.remaining)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted">Funds are paid by the verifying institution directly to the provider. No cash is transferred to students.</p>
      </div>

      <footer className="border-t-2 border-line bg-raised/50 px-5 py-3 text-[11px] text-muted">
        Demonstration receipt generated by a competition prototype. All people, institutions and amounts are fictional. Not a tax document.
      </footer>
    </article>
  );
}

export function receiptHtml(state: AppState, c: Contribution) {
  const d = receiptData(state, c);
  const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
  const rows = d.lines
    .map((l) => `<tr${l.kind === "this" ? ' class="this"' : ""}><td>${esc(l.label)}</td><td class="r">${l.kind === "total" ? usd(l.amount) : "−" + usd(-l.amount)}</td></tr>`)
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>BridgeFund impact receipt ${d.number}</title><style>
body{font-family:system-ui,sans-serif;background:#F5F0E1;color:#232824;padding:32px}
.card{max-width:640px;margin:auto;background:#FBF8EF;border:2px solid #232824;box-shadow:4px 4px 0 #232824;padding:24px}
h1{font-size:20px;margin:0}small,.m{color:#5C635A}.big{font-size:32px;color:#294C3D;font-weight:700}
table{width:100%;border-collapse:collapse;margin-top:12px}td{padding:6px 4px;border-bottom:1px solid #ddd}.r{text-align:right;font-family:monospace}.this{background:#f1e2c0;font-weight:600}
dl{display:grid;grid-template-columns:1fr 1fr;gap:12px}dt{font-size:11px;text-transform:uppercase;color:#5C635A}dd{margin:0}
</style></head><body><div class="card">
<h1>BridgeFund — Digital impact receipt</h1><small>${d.number} · ${fmtDateLong(c.at)}</small>
<p class="m">Educational expense covered</p><h2>${esc(d.r.purpose)}</h2>
<p class="m">Amount contributed</p><div class="big">${usd(c.amount)}</div>
<dl><div><dt>Verified recipient reference</dt><dd>${d.r.ref}-${d.st?.initials ?? ""} (verified by ${esc(d.inst?.name ?? "")})</dd></div>
<div><dt>Completion status</dt><dd>${esc(d.status)}</dd></div>
<div><dt>Educational outcome</dt><dd>${esc(d.opp?.outcome ?? d.r.purpose)}</dd></div>
<div><dt>Date of assistance</dt><dd>${fmtDateLong(c.at)}</dd></div></dl>
<table>${rows}<tr><td><b>Remaining financial gap</b></td><td class="r"><b>${usd(d.remaining)}</b></td></tr></table>
<p class="m" style="font-size:11px;margin-top:16px">Demonstration receipt generated by a competition prototype. All people, institutions and amounts are fictional. Not a tax document.</p>
</div></body></html>`;
}
