import { test } from "node:test";
import assert from "node:assert/strict";
import { runBridgeEngine } from "../src/lib/engine.ts";
import { suggestAllocation } from "../src/lib/allocation.ts";
import { WAIVERS, ALTERNATIVES, GRANTS } from "../src/lib/knowledge.ts";

const kb = {
  waivers: WAIVERS,
  alternatives: ALTERNATIVES,
  grants: GRANTS,
  resources: [
    { id: "r-stem-kit", name: "Arduino-compatible STEM kit", type: "engineering" as const, institutionId: "x", total: 6, available: 3, retailValue: 200, loanTerm: "Term", description: "", keywords: ["project materials"] },
  ],
};
const mariam = { lowIncome: true, publicSchool: false, firstGeneration: false, hasSchoolLetter: true };
const base = { country: "United Arab Emirates", emirate: "Abu Dhabi", level: "secondary" as const, priorAssistance: 0, eligibility: mariam };
const demoExpenses = [
  { id: "e1", label: "Project materials", category: "materials" as const, amount: 350, confirmed: true },
  { id: "e2", label: "Transportation", category: "transportation" as const, amount: 100, confirmed: true },
  { id: "e3", label: "Competition-related expenses", category: "other" as const, amount: 150, confirmed: true },
];

test("UAE demo: AED 600 cost, AED 150 funds -> AED 450 gap -> borrow 200 + school 100 -> AED 150 sponsor", () => {
  const plan = runBridgeEngine({ ...base, category: "stem-competition", studentFunds: 150, expenses: demoExpenses }, kb);
  const by = Object.fromEntries(plan.phases.map((p) => [p.kind, p.findings.reduce((s, f) => s + f.amount, 0)]));
  assert.equal(plan.totalCost, 600);
  assert.equal(plan.initialGap, 450);
  assert.equal(by.borrow, 200, "borrowing saves the kit's value, not the whole materials line");
  assert.equal(by.institutional, 100);
  assert.equal(plan.sponsorAmount, 150);
  assert.equal(plan.reductionsTotal + plan.sponsorAmount, plan.initialGap);
  assert.equal(plan.phases.length, 7);
});

test("emirate-specific programmes only apply where they exist", () => {
  const books = [{ id: "e1", label: "Reference books", category: "materials" as const, amount: 120, confirmed: true }];
  const ad = runBridgeEngine({ ...base, category: "workshop", studentFunds: 0, expenses: books }, kb);
  assert.equal(ad.reductionsTotal, 120, "MAKTABA applies in Abu Dhabi");
  const dxb = runBridgeEngine({ ...base, emirate: "Dubai", category: "workshop", studentFunds: 0, expenses: books }, kb);
  assert.equal(dxb.reductionsTotal, 0, "MAKTABA is not offered in Dubai");
});

test("nol student discount: 50% of Dubai fares, only when savings exceed the AED 70 card cost", () => {
  const fares = (amount: number) => [{ id: "e1", label: "Monthly metro and bus fares", category: "transportation" as const, amount, confirmed: true }];
  const dxb = runBridgeEngine({ ...base, emirate: "Dubai", category: "internship", studentFunds: 0, expenses: fares(320) }, kb);
  assert.equal(dxb.phases.find((p) => p.kind === "discount")!.findings[0].amount, 160);
  const small = runBridgeEngine({ ...base, emirate: "Dubai", category: "internship", studentFunds: 0, expenses: fares(60) }, kb);
  assert.equal(small.phases.find((p) => p.kind === "discount")!.findings.length, 0);
  const ad = runBridgeEngine({ ...base, category: "internship", studentFunds: 0, expenses: fares(320) }, kb);
  assert.equal(ad.phases.find((p) => p.kind === "discount")!.findings.length, 0, "nol is Dubai-only");
});

test("allocation completes urgent needs first and reports leftover", () => {
  const today = new Date("2026-01-01T12:00:00Z");
  const d = (n: number) => new Date(today.getTime() + n * 86400000).toISOString();
  const res = suggestAllocation(
    [
      { id: "a", ref: "A", label: "a", amount: 28, funded: 0, deadline: d(4) },
      { id: "b", ref: "B", label: "b", amount: 150, funded: 0, deadline: d(14) },
      { id: "c", ref: "C", label: "c", amount: 60, funded: 20, deadline: d(16) },
    ],
    100,
    today,
  );
  assert.deepEqual(res.items.map((i) => [i.needId, i.amount, i.completes]), [["a", 28, true], ["c", 40, true], ["b", 32, false]]);
  assert.equal(res.fullyCovered, 2);
});
