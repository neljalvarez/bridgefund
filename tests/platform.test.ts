import { test } from "node:test";
import assert from "node:assert/strict";
import { createSeedState, DEMO_OPPORTUNITY_ID, DEMO_SPONSOR_ID } from "../src/lib/seed";
import { applyEnginePlan, applyStrategy, approveRequest, confirmCompleted, contributeToPool, createPledges, fundRequest, rejectRequest, remainingOf, reviewPledge, assignMatch, assignWaiver } from "../src/lib/actions";
import { planFor, strategiesFor } from "../src/lib/plan";
import { requestImpact, portfolioImpact } from "../src/lib/impact";
import { assessDeadline } from "../src/lib/deadline";
import { findDuplicates, verificationChecks } from "../src/lib/verification";
import { findMatches } from "../src/lib/matching";
import type { AppState } from "../src/lib/types";

const fresh = () => createSeedState(new Date());
const req = (s: AppState, id: string) => s.requests.find((r) => r.id === id)!;
const demoFlow = () => {
  let s = fresh();
  const opp = s.opportunities.find((o) => o.id === DEMO_OPPORTUNITY_ID)!;
  s = applyEnginePlan(opp.id, planFor(s, opp), true)(s);
  const r = s.requests.find((x) => x.opportunityId === opp.id)!;
  return { s, r };
};

test("BridgeEngine 2.0 produces three strategies for the demo case", () => {
  const s = fresh();
  const cmp = strategiesFor(s, s.opportunities.find((o) => o.id === DEMO_OPPORTUNITY_ID)!);
  const by = Object.fromEntries(cmp.strategies.map((x) => [x.id, x]));
  assert.equal(cmp.recommended, "independent");
  assert.equal(by.independent.studentPays, 70);
  assert.equal(by.independent.costReductions, 50);
  assert.equal(by.independent.sponsorNeeded, 60);
  assert.equal(by.independent.multiplier, 1.83);
  assert.equal(by["lowest-cost"].studentPays, 0); // protects the student's savings
  assert.equal(by.fastest.sponsorNeeded, 0); // uses the emergency fund instead of waiting for sponsors
  for (const st of cmp.strategies) {
    const covered = st.lines.reduce((a, l) => a + l.amount, 0);
    assert.equal(Math.round(covered * 100) / 100, st.totalCost, `${st.id} must reconcile to the total`);
    assert.ok(st.likelihood <= 1);
  }
});

test("optimiser excludes options that cannot process before the deadline and respects conflicts", () => {
  const s = fresh();
  const uni = s.opportunities.find((o) => o.id === "o-amina-uni")!;
  uni.deadline = new Date(Date.now() + 4 * 86400000).toISOString(); // waiver takes ~7 days
  const cmp = strategiesFor(s, uni);
  assert.ok(cmp.excluded.some((x) => x.title.includes("Application Fee Waiver")));
  const rob = strategiesFor(s, s.opportunities.find((o) => o.id === "o-amina-robotics")!);
  for (const st of rob.strategies) {
    const fees = st.options.filter((o) => (o.kind === "waiver" || o.kind === "discount") && o.expenseId === "e1");
    assert.ok(fees.length <= 1, "one fee reduction per expense line");
  }
});

test("impact multiplier excludes student funds: $110 shortfall, $50 waiver, $60 sponsor = 1.83x", () => {
  let { s, r } = demoFlow();
  s = approveRequest(r.id)(s);
  s = fundRequest(r.id, 60, "sponsor", DEMO_SPONSOR_ID)(s);
  const imp = requestImpact(req(s, r.id), s.contributions);
  assert.equal(imp.shortfall, 110);
  assert.equal(imp.resolved, 110);
  assert.equal(imp.sponsor, 60);
  assert.equal(imp.multiplier, 1.83);
  assert.ok(portfolioImpact(s.requests, s.contributions).multiplier! >= 1);
});

test("contributions never exceed the remaining gap (duplicate funding prevented)", () => {
  let { s, r } = demoFlow();
  s = approveRequest(r.id)(s);
  s = fundRequest(r.id, 500, "sponsor", DEMO_SPONSOR_ID)(s);
  assert.equal(req(s, r.id).funded, 60);
  assert.equal(s.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!.balance, 440);
  const before = s.contributions.length;
  s = fundRequest(r.id, 20, "sponsor", DEMO_SPONSOR_ID)(s); // already fully funded
  assert.equal(s.contributions.length, before);
  assert.equal(s.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!.balance, 440);
});

test("partial contributions move the request to Partially Funded", () => {
  let { s, r } = demoFlow();
  s = approveRequest(r.id)(s);
  s = fundRequest(r.id, 25, "sponsor", DEMO_SPONSOR_ID)(s);
  assert.equal(req(s, r.id).status, "Partially Funded");
  assert.equal(remainingOf(req(s, r.id)), 35);
});

test("insufficient sponsor balance caps the contribution", () => {
  let s = fresh();
  s.sponsors = s.sponsors.map((x) => (x.id === DEMO_SPONSOR_ID ? { ...x, balance: 10 } : x));
  s = fundRequest("r-kofi", 150, "sponsor", DEMO_SPONSOR_ID)(s);
  assert.equal(req(s, "r-kofi").funded, 10);
  assert.equal(s.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!.balance, 0);
  s = contributeToPool(50)(s);
  assert.equal(s.pool, 150, "pool unchanged when the balance is empty");
});

test("rejected requests cannot be funded", () => {
  let s = rejectRequest("r-hana", "Could not verify the fee.")(fresh());
  s = approveRequest("r-hana")(s);
  assert.equal(req(s, "r-hana").status, "Rejected");
  const before = s.contributions.length;
  s = fundRequest("r-hana", 10, "sponsor")(s);
  assert.equal(s.contributions.length, before);
});

test("pledges hold sponsor funds until an institution reviews them", () => {
  let s = fresh();
  s = createPledges([{ requestId: "r-diego", amount: 28 }, { requestId: "r-joshua", amount: 58 }], "Most needs")(s);
  assert.equal(s.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!.balance, 414);
  assert.equal(req(s, "r-diego").funded, 0);
  const [p1, p2] = s.pledges;
  s = reviewPledge(p1.id, true)(s);
  s = reviewPledge(p2.id, false)(s);
  assert.equal(req(s, "r-diego").funded, 28, "approved pledge applied");
  assert.equal(req(s, "r-joshua").funded, 0, "declined pledge not applied");
  assert.equal(s.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!.balance, 472, "declined amount returned to the sponsor");
  assert.equal(s.pledges.filter((p) => p.status === "Pending review").length, 0);
});

test("completion records a simulated direct payment to the provider", () => {
  let s = fresh();
  s = confirmCompleted("r-linh")(s);
  assert.equal(req(s, "r-linh").status, "Completed");
  assert.equal(s.payments[0].requestId, "r-linh");
  assert.equal(s.payments[0].amount, 35);
});

test("deadline rescue classifies expired and at-risk cases without deciding anything", () => {
  const s = fresh();
  const opp = s.opportunities.find((o) => o.id === "o-r-diego")!;
  const a = assessDeadline(s, opp, req(s, "r-diego"));
  assert.ok(["Critical", "At risk"].includes(a.level));
  assert.ok(a.alternatives.length > 0);
  const old = assessDeadline(s, { ...opp, deadline: new Date(Date.now() - 3 * 86400000).toISOString() }, req(s, "r-diego"));
  assert.equal(old.level, "Deadline passed");
});

test("verification flags duplicates and inconsistent requests", () => {
  const s = fresh();
  assert.ok(findDuplicates(s, req(s, "r-diego-2")).some((d) => d.id === "r-diego"));
  const checks = verificationChecks(s, req(s, "r-mateus-2"));
  assert.equal(checks.find((c) => c.key === "enrollment")!.status, "warn");
  assert.equal(checks.find((c) => c.key === "expenses")!.status, "warn");
});

test("matching never assigns the same resource or waiver twice", () => {
  let s = fresh();
  const m = findMatches(s).find((x) => x.kind === "resource")!;
  assert.ok(m);
  const avail = s.resources.find((r) => r.id === m.sourceId)!.available;
  s = assignMatch(m)(s);
  s = assignMatch(m)(s);
  assert.equal(s.resources.find((r) => r.id === m.sourceId)!.available, avail - 1);
  assert.ok(!findMatches(s).some((x) => x.key === m.key));
  let t = fresh();
  t = assignWaiver("r-hana", "w-lang-test", 30)(t);
  assert.equal(req(t, "r-hana").reductions.filter((x) => x.sourceId === "w-lang-test").length, 1, "waiver already applied is not duplicated");
});

test("applying a strategy reconciles cost, savings and request amount", () => {
  let s = fresh();
  const opp = s.opportunities.find((o) => o.id === "o-amina-robotics")!;
  const cmp = strategiesFor(s, opp);
  for (const st of cmp.strategies) {
    const t = applyStrategy(opp.id, st, true)(s);
    const r = t.requests.find((x) => x.opportunityId === opp.id)!;
    const reductions = r.reductions.reduce((a, x) => a + x.amount, 0);
    assert.equal(Math.round((r.totalCost - r.studentFunds - reductions - r.amount) * 100) / 100, 0, st.id);
    assert.equal(r.amount, st.sponsorNeeded, st.id);
  }
  s = applyStrategy(opp.id, cmp.strategies[0], true)(s);
  s = applyStrategy(opp.id, cmp.strategies[0], true)(s);
  assert.equal(s.requests.filter((x) => x.opportunityId === opp.id).length, 1, "re-applying replaces, never duplicates");
});

test("sponsors cannot fund a request whose deadline has passed; the institution still can", () => {
  let { s, r } = demoFlow();
  s = approveRequest(r.id)(s);
  const past = new Date(Date.now() - 3 * 86_400_000).toISOString();
  s = { ...s, requests: s.requests.map((x) => (x.id === r.id ? { ...x, deadline: past } : x)) };
  const before = s.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!.balance;
  s = fundRequest(r.id, 60, "sponsor")(s);
  assert.equal(req(s, r.id).funded, 0);
  assert.equal(s.sponsors.find((x) => x.id === DEMO_SPONSOR_ID)!.balance, before);
  s = fundRequest(r.id, 60, "institution")(s);
  assert.equal(req(s, r.id).funded, 60);
});
