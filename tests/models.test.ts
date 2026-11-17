import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate } from "../src/lib/simulator";
import { project, summary } from "../src/lib/business";

test("simulator: UAE demo case reproduces the AED 450 → AED 150 rescue", () => {
  const r = simulate({ cost: 600, studentFunds: 150, waivers: 0, borrowing: 200, institutional: 100, sponsorBudget: 1000, crowdFee: 0 });
  assert.equal(r.shortfall, 450);
  assert.equal(r.bridgeSponsorNeeded, 150);
  assert.equal(r.sponsorConserved, 300);
  assert.equal(r.opportunitiesA, 2); // 1000 / 450
  assert.equal(r.opportunitiesB, 6); // 1000 / 150
  assert.equal(r.extraOpportunities, 4);
  assert.equal(r.multiplier, 3);
});

test("simulator: reductions and institutional aid are capped at the shortfall", () => {
  const r = simulate({ cost: 100, studentFunds: 40, waivers: 50, borrowing: 30, institutional: 20, sponsorBudget: 100, crowdFee: 0.05 });
  assert.equal(r.shortfall, 60);
  assert.equal(r.reductions, 60);
  assert.equal(r.institutional, 0);
  assert.equal(r.bridgeSponsorNeeded, 0);
  assert.equal(r.multiplier, null);
  assert.equal(r.crowdDonorsNeeded, 63.16);
});

test("simulator: student funds above cost produce no shortfall", () => {
  const r = simulate({ cost: 50, studentFunds: 80, waivers: 10, borrowing: 0, institutional: 0, sponsorBudget: 100, crowdFee: 0.05 });
  assert.equal(r.shortfall, 0);
  assert.equal(r.crowdDonorsNeeded, 0);
  assert.equal(r.bridgeSponsorNeeded, 0);
});

test("business: licence revenue is included in MRR and break-even (AED)", () => {
  const s = summary({ clients: 10, price: 950, programs: 2, programFee: 1500, opex: 30000, requestsPerClient: 15, verificationCost: 9, cac: 3000, licences: 1, licenceFee: 2500 }, "moderate");
  assert.equal(s.mrr, 15000); // 9,500 + 3,000 + 2,500
  assert.equal(s.contribution, 815); // 950 − 15 × 9
  assert.equal(s.breakEvenClients, 31); // (30,000 − 3,000 − 2,500) ÷ 815 = 30.06, rounded up
});

test("business: summary and break-even", () => {
  const s = summary({ clients: 10, price: 300, programs: 2, programFee: 500, opex: 6000, requestsPerClient: 10, verificationCost: 2, cac: 900 }, "moderate");
  assert.equal(s.mrr, 4000);
  assert.equal(s.arr, 48000);
  assert.equal(s.contribution, 280);
  assert.equal(s.breakEvenClients, 18); // (6000 − 1000) / 280 = 17.9
  assert.equal(s.rows.length, 24);
  const rows = project({ clients: 10, price: 300, programs: 2, programFee: 500, opex: 6000, requestsPerClient: 10, verificationCost: 2, cac: 900 }, "optimistic");
  assert.ok(rows[23].clients > rows[0].clients);
});
