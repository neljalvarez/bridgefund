/**
 * Competition reliability: the scripted demo, data integrity of the seed,
 * reservations, persistence and reports. Everything here must hold before a live pitch.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSeedState, DEMO_OPPORTUNITY_ID, DEMO_SPONSOR_ID, STATE_VERSION } from "../src/lib/seed";
import { DEMO_STEPS } from "../src/lib/demo";
import { remainingOf, reserveResource, updateReservation, fundRequest, setDemo } from "../src/lib/actions";
import { requestForOpp } from "../src/lib/selectors";
import { requestImpact, portfolioImpact } from "../src/lib/impact";
import { publicImpact } from "../src/lib/publicImpact";
import { assessDeadline } from "../src/lib/deadline";
import { parseState } from "../src/lib/persist";
import { feedbackRows, pilotRows, toCsv } from "../src/lib/csv";
import type { AppState } from "../src/lib/types";

const fresh = () => createSeedState(new Date());
const run = (s: AppState, n: number) => DEMO_STEPS.slice(0, n).reduce((acc, step) => step(acc), s);

test("demo script: AED 600 → gap 450 → 150 → 0, sponsor 1,000 → 850, 3.00x", () => {
  const s0 = fresh();
  const sp0 = s0.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!;
  assert.equal(sp0.balance, 1000);

  const s1 = run(s0, 1);
  const r1 = requestForOpp(s1, DEMO_OPPORTUNITY_ID)!;
  assert.equal(r1.totalCost, 600);
  assert.equal(r1.studentFunds, 150);
  assert.equal(r1.amount, 150, "sponsors are asked for AED 150, not 450");
  assert.equal(r1.guardianConsent, "Given");
  assert.equal(r1.status, "Submitted");

  const s2 = run(s0, 2);
  const r2 = requestForOpp(s2, DEMO_OPPORTUNITY_ID)!;
  assert.equal(r2.status, "Verified");
  assert.ok(r2.reductions.every((x) => x.confirmed));
  assert.equal(r2.reductions.reduce((a, x) => a + x.amount, 0), 300);

  const s3 = run(s0, 3);
  const r3 = requestForOpp(s3, DEMO_OPPORTUNITY_ID)!;
  assert.equal(r3.status, "Fully Funded");
  assert.equal(remainingOf(r3), 0);
  assert.equal(s3.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!.balance, 850);

  const s4 = run(s0, 4);
  const r4 = requestForOpp(s4, DEMO_OPPORTUNITY_ID)!;
  assert.equal(r4.status, "Completed");
  const imp = requestImpact(r4, s4.contributions);
  assert.equal(imp.resolved, 450);
  assert.equal(imp.sponsor, 150);
  assert.equal(imp.multiplier, 3);
});

test("demo script is idempotent: repeating a step never double-funds or double-submits", () => {
  let s = fresh();
  for (const step of DEMO_STEPS) s = step(step(s));
  const reqs = s.requests.filter((r) => r.opportunityId === DEMO_OPPORTUNITY_ID);
  assert.equal(reqs.length, 1);
  assert.equal(reqs[0].funded, 150);
  assert.equal(s.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!.balance, 850);
});

test("demo reset: a fresh seed is identical in every figure", () => {
  const a = fresh();
  const b = setDemo({ stage: 3 })(run(fresh(), 4));
  const c = fresh();
  const money = (s: AppState) => JSON.stringify({ sp: s.sponsors.map((x) => [x.id, x.balance]), r: s.requests.map((x) => [x.id, x.amount, x.funded, x.status]), pool: s.pool, inst: s.institutions.map((i) => [i.id, i.fund]), res: s.resources.map((r) => [r.id, r.available]) });
  assert.notEqual(money(a), money(b));
  assert.equal(money(a), money(c));
  assert.equal(c.demo.stage, 0);
});

test("seed data is internally consistent in AED", () => {
  const s = fresh();
  for (const r of s.requests) {
    const reductions = r.reductions.reduce((a, x) => a + x.amount, 0);
    assert.equal(r.totalCost, r.expenses.reduce((a, e) => a + e.amount, 0), `${r.ref} total`);
    assert.equal(r.amount, r.totalCost - r.studentFunds - reductions, `${r.ref} amount`);
    assert.ok(r.funded <= r.amount, `${r.ref} over-funded`);
    const contributed = s.contributions.filter((c) => c.requestId === r.id).reduce((a, c) => a + c.amount, 0);
    assert.equal(contributed, r.funded, `${r.ref} contributions match funded`);
    if (["Fully Funded", "Completed"].includes(r.status)) assert.equal(remainingOf(r), 0, `${r.ref} fully funded`);
    if (r.status === "Partially Funded") assert.ok(r.funded > 0 && remainingOf(r) > 0, `${r.ref} partial`);
  }
  for (const sp of s.sponsors) {
    const given = s.contributions.filter((c) => c.sponsorId === sp.id).reduce((a, c) => a + c.amount, 0);
    assert.equal(sp.balance, sp.startingBalance - given, `${sp.name} balance`);
  }
  for (const res of s.resources) assert.ok(res.available >= 0 && res.available <= res.total, res.name);
});

test("seeded impact shows reductions before sponsorship (multiplier above 1)", () => {
  const s = fresh();
  const p = portfolioImpact(s.requests, s.contributions);
  assert.ok(p.reductions > 0);
  assert.ok((p.multiplier ?? 0) > 1);
  const pub = publicImpact(s, { emirate: "all", category: "all" });
  assert.equal(pub.barriersResolved, p.resolved);
  const byEmirate = pub.byEmirate.reduce((a, e) => a + e.amount, 0);
  assert.equal(Math.round(byEmirate), Math.round(p.resolved), "emirate breakdown adds up to the total");
});

test("resource reservations: reserve, last unit, return and cancel keep counts in range", () => {
  let s = fresh();
  const res = s.resources.find((r) => r.available > 0)!;
  const start = res.available;
  for (let i = 0; i < start + 2; i++) s = reserveResource(res.id, "s-mariam", "2026-12-01")(s);
  const after = s.resources.find((r) => r.id === res.id)!;
  assert.equal(after.available, 0, "never below zero");
  assert.equal(s.reservations.filter((r) => r.resourceId === res.id).length, start, "no reservation without stock");

  const [a, b, c] = s.reservations.filter((r) => r.resourceId === res.id);
  s = updateReservation(a.id, "Collected")(s);
  assert.equal(s.resources.find((r) => r.id === res.id)!.available, 0, "collecting doesn't free stock");
  s = updateReservation(a.id, "Returned")(s);
  if (b) s = updateReservation(b.id, "Cancelled")(s);
  if (c) s = updateReservation(c.id, "Returned")(s);
  const final = s.resources.find((r) => r.id === res.id)!;
  assert.ok(final.available <= final.total, "never above total");
  assert.equal(final.available, Math.min(final.total, [a, b, c].filter(Boolean).length));
});

test("partial then complete sponsor contributions move status and balances correctly", () => {
  let s = fresh();
  const r0 = s.requests.find((r) => r.status === "Verified" && r.funded === 0)!;
  const sp = s.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!;
  s = fundRequest(r0.id, 40, "sponsor", sp.id)(s);
  let r = s.requests.find((x) => x.id === r0.id)!;
  assert.equal(r.status, "Partially Funded");
  assert.equal(r.funded, 40);
  s = fundRequest(r0.id, 100000, "sponsor", sp.id)(s);
  r = s.requests.find((x) => x.id === r0.id)!;
  assert.equal(r.status, "Fully Funded");
  assert.equal(r.funded, r.amount, "capped at what's left");
  assert.equal(s.sponsors.find((x) => x.id === sp.id)!.balance, 1000 - r.amount);
});

test("deadline calculations use whole days and flag passed deadlines", () => {
  const s = fresh();
  const opp = s.opportunities.find((o) => o.id === DEMO_OPPORTUNITY_ID)!;
  const a = assessDeadline(s, opp, undefined, new Date());
  assert.equal(a.daysLeft, 21);
  const late = assessDeadline(s, { ...opp, deadline: new Date(Date.now() - 2 * 86400000).toISOString() }, undefined, new Date());
  assert.equal(late.level, "Deadline passed");
});

test("persistence: only valid, current-version data is restored", () => {
  const s = fresh();
  assert.ok(parseState(JSON.stringify(s)));
  assert.equal(parseState(null), null);
  assert.equal(parseState("{not json"), null);
  assert.equal(parseState(JSON.stringify({ ...s, version: STATE_VERSION - 1 })), null);
  assert.equal(parseState(JSON.stringify({ ...s, requests: undefined })), null);
  assert.equal(parseState(JSON.stringify({ ...s, currentStudentId: "missing" })), null);
});

test("reports: CSV exports quote safely and never include names", () => {
  const s: AppState = { ...fresh(), feedback: [{ id: "f1", role: "student", rating: 5, comment: 'Clear, "fast" — شكراً', page: "/demo", at: "2026-11-18T10:00:00.000Z" }] };
  const csv = toCsv(feedbackRows(s));
  assert.match(csv, /"Clear, ""fast"" — شكراً"/);
  assert.ok(!s.students.some((st) => csv.includes(st.firstName)), "feedback export is anonymous");
  const pilot = toCsv(pilotRows(s));
  assert.match(pilot, /"Feedback responses","1"/);
  assert.match(pilot, /"Average feedback rating","5.00"/);
});
