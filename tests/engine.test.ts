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
    { id: "r-robot-kit", name: "Robotics starter kit", type: "engineering" as const, institutionId: "x", total: 6, available: 3, retailValue: 85, loanTerm: "Term", description: "", keywords: ["robot"] },
  ],
};
const amina = { lowIncome: true, publicSchool: true, firstGeneration: true, hasSchoolLetter: true };
const base = { country: "Kenya", level: "secondary" as const, priorAssistance: 0, eligibility: amina };

test("demo: $180 exam, $70 funds, $50 waiver -> $60 sponsor", () => {
  const plan = runBridgeEngine({ ...base, category: "certification", studentFunds: 70, expenses: [{ id: "e1", label: "Certification exam fee", category: "examination", amount: 180, confirmed: true }] }, kb);
  assert.equal(plan.initialGap, 110);
  assert.equal(plan.phases[0].findings[0].amount, 50);
  assert.equal(plan.sponsorAmount, 60);
  assert.equal(plan.phases.length, 7);
});

test("robotics: priorities apply in order without double counting", () => {
  const plan = runBridgeEngine(
    {
      ...base,
      category: "competition",
      studentFunds: 20,
      expenses: [
        { id: "e1", label: "Team registration", category: "registration", amount: 40, confirmed: true },
        { id: "e2", label: "Bus fare to venue", category: "transportation", amount: 35, confirmed: true },
        { id: "e3", label: "Robotics starter kit", category: "materials", amount: 85, confirmed: false },
        { id: "e4", label: "Lunch on competition day", category: "food", amount: 15, confirmed: false },
      ],
    },
    kb,
  );
  const by = Object.fromEntries(plan.phases.map((p) => [p.kind, p.findings.reduce((s, f) => s + f.amount, 0)]));
  assert.deepEqual([by.waiver, by.alternative, by.discount, by.borrow, by.institutional, by.grant, plan.sponsorAmount], [0, 15, 10, 85, 25, 10, 10]);
  // no expense is ever reduced below zero
  assert.ok(Object.values(plan.remainingByExpense).every((v) => v >= 0));
  assert.equal(plan.reductionsTotal + plan.sponsorAmount, plan.initialGap);
});

test("university application closes without sponsors", () => {
  const plan = runBridgeEngine(
    { ...base, category: "university-application", studentFunds: 0, expenses: [{ id: "e1", label: "Application fee", category: "registration", amount: 45, confirmed: true }, { id: "e2", label: "Certified transcript copy", category: "documentation", amount: 12, confirmed: true }] },
    kb,
  );
  assert.equal(plan.sponsorAmount, 0);
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
