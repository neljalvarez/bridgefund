/**
 * Pure state transitions. Every UI interaction calls one of these through the
 * store, so the student, sponsor and institution views always stay in sync.
 */
import type {
  AppState,
  CalculatorScenario,
  Contribution,
  Expense,
  FundingRequest,
  Opportunity,
  Reduction,
  RequestStatus,
  Role,
  VerificationMethod,
} from "./types";
import type { EnginePlan } from "./engine";
import { planFindings } from "./engine";
import { uid, usd } from "./format";
import { WAIVERS } from "./knowledge";

export type Action = (s: AppState) => AppState;

const now = () => new Date().toISOString();
const r2 = (n: number) => Math.round(n * 100) / 100;

export const remainingOf = (r: Pick<FundingRequest, "amount" | "funded">) => r2(Math.max(r.amount - r.funded, 0));

function notify(s: AppState, role: Role, title: string, body: string, href?: string): AppState {
  return {
    ...s,
    notifications: [{ id: uid("n"), role, title, body, href, at: now(), read: false }, ...s.notifications].slice(0, 60),
  };
}

function updateRequest(s: AppState, id: string, fn: (r: FundingRequest) => FundingRequest): AppState {
  return { ...s, requests: s.requests.map((r) => (r.id === id ? fn(r) : r)) };
}

function withStatus(r: FundingRequest, status: RequestStatus, note: string, actor: FundingRequest["history"][number]["actor"]): FundingRequest {
  if (r.status === status && !note) return r;
  return { ...r, status, history: [...r.history, { at: now(), status, note, actor }] };
}

function fundingStatus(r: FundingRequest): RequestStatus {
  if (r.amount > 0 && r.funded >= r.amount) return "Fully Funded";
  if (r.amount <= 0) return "Fully Funded";
  if (r.funded > 0) return "Partially Funded";
  return "Verified";
}

function nextRef(s: AppState) {
  const max = Math.max(2054, ...s.requests.map((r) => Number(r.ref.replace(/\D/g, "")) || 0));
  return `BF-${max + 1}`;
}

/* ---------- global ---------- */

export const setRole = (role: Role): Action => (s) => ({ ...s, role });
export const setOnboarded = (): Action => (s) => ({ ...s, onboarded: true });
export const toggleSound = (): Action => (s) => ({ ...s, sound: !s.sound });
export const markRead = (id: string): Action => (s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
export const markAllRead = (role: Role): Action => (s) => ({ ...s, notifications: s.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)) });
export const setDemo = (patch: Partial<AppState["demo"]>): Action => (s) => ({ ...s, demo: { ...s.demo, ...patch } });

export const toggleSavedWaiver = (id: string): Action => (s) => ({
  ...s,
  savedWaivers: s.savedWaivers.includes(id) ? s.savedWaivers.filter((x) => x !== id) : [...s.savedWaivers, id],
});
export const toggleSavedOpportunity = (id: string): Action => (s) => ({
  ...s,
  savedOpportunities: s.savedOpportunities.includes(id) ? s.savedOpportunities.filter((x) => x !== id) : [...s.savedOpportunities, id],
});

/* ---------- student ---------- */

export interface OpportunityDraft {
  title: string;
  provider: string;
  category: Opportunity["category"];
  deadline: string;
  institutionId: string;
  expenses: Expense[];
  studentFunds: number;
  priorAssistance: number;
  outcome: string;
}

export const addOpportunity = (draft: OpportunityDraft, id = uid("o")): Action => (s) => {
  const opp: Opportunity = { ...draft, id, studentId: s.currentStudentId, createdAt: now() };
  return notify(
    { ...s, opportunities: [opp, ...s.opportunities] },
    "student",
    "Opportunity added to your journal",
    `${draft.title} — run BridgeEngine to build your plan.`,
    `/student/engine?opp=${id}`,
  );
};

export const updateOpportunity = (id: string, patch: Partial<Opportunity>): Action => (s) => ({
  ...s,
  opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, ...patch } : o)),
});

export const removeOpportunity = (id: string): Action => (s) => ({
  ...s,
  opportunities: s.opportunities.filter((o) => o.id !== id),
  requests: s.requests.filter((r) => r.opportunityId !== id || r.status !== "Draft"),
});

/** Turn a BridgeEngine plan into a funding request (and reserve any borrowed items). */
export const applyEnginePlan = (oppId: string, plan: EnginePlan, submit: boolean): Action => (s0) => {
  let s = s0;
  const opp = s.opportunities.find((o) => o.id === oppId);
  if (!opp) return s;
  const findings = planFindings(plan);
  const reductions: Reduction[] = findings.map((f) => ({
    id: uid("rd"),
    kind: f.kind,
    sourceId: f.sourceId,
    title: f.title,
    amount: f.amount,
    expenseId: f.expenseId,
  }));

  // Reserve borrowed equipment.
  for (const f of findings.filter((f) => f.kind === "borrow")) {
    const already = s.reservations.some((r) => r.resourceId === f.sourceId && r.studentId === opp.studentId);
    if (!already) s = reserveResource(f.sourceId, opp.studentId, opp.deadline, "student")(s);
  }

  const existing = s.requests.find((r) => r.opportunityId === oppId && r.status !== "Declined");
  const status: RequestStatus = plan.sponsorAmount <= 0 ? "Completed" : submit ? "Submitted" : "Draft";
  const base: FundingRequest = existing ?? {
    id: uid("r"),
    ref: nextRef(s),
    studentId: opp.studentId,
    opportunityId: oppId,
    purpose: opp.title,
    totalCost: plan.totalCost,
    studentFunds: plan.studentFunds,
    reductions: [],
    amount: plan.sponsorAmount,
    funded: 0,
    deadline: opp.deadline,
    expenses: opp.expenses,
    reason: "Remaining cost after waivers, alternatives and grants identified by BridgeEngine.",
    documents: [
      { name: "Proof of enrollment", attached: true },
      { name: "Official cost confirmation", attached: opp.expenses.every((e) => e.confirmed) },
    ],
    verification: "school-letter",
    status: "Draft",
    history: [],
    createdAt: now(),
  };
  if (existing && !["Draft", "Submitted", "Under Review"].includes(existing.status)) return s; // already in funding pipeline

  const req: FundingRequest = withStatus(
    { ...base, totalCost: plan.totalCost, studentFunds: plan.studentFunds, reductions, amount: plan.sponsorAmount, expenses: opp.expenses, deadline: opp.deadline },
    status,
    status === "Completed"
      ? "Gap closed entirely through cost reduction — no sponsor funding needed"
      : submit
        ? `BridgeEngine plan applied: ${usd(plan.reductionsTotal)} reduced, ${usd(plan.sponsorAmount)} requested`
        : "Plan saved as draft",
    "student",
  );

  s = { ...s, requests: existing ? s.requests.map((r) => (r.id === existing.id ? req : r)) : [req, ...s.requests] };
  s = {
    ...s,
    distribution: [
      ...reductions.map((rd) => ({ id: uid("d"), at: now(), label: rd.title, amount: rd.amount, requestRef: req.ref, kind: (rd.kind === "borrow" ? "resource" : "waiver") as "resource" | "waiver" })),
      ...s.distribution,
    ],
  };
  if (submit && plan.sponsorAmount > 0) {
    s = notify(s, "institution", `New request ${req.ref} to verify`, `${opp.title} — ${usd(plan.sponsorAmount)} after BridgeEngine reductions.`, "/institution");
    s = notify(s, "student", "Request submitted", `${req.ref} was sent to your institution for verification.`, "/student/requests");
  }
  return s;
};

export interface RequestDraft {
  opportunityId: string | null;
  purpose: string;
  amount: number;
  deadline: string;
  expenses: Expense[];
  reason: string;
  documents: { name: string; attached: boolean }[];
  verification: VerificationMethod;
}

export const createRequest = (d: RequestDraft, submit: boolean): Action => (s0) => {
  let s = s0;
  const id = uid("r");
  let oppId = d.opportunityId;
  if (!oppId) {
    oppId = uid("o");
    const student = s.students.find((x) => x.id === s.currentStudentId)!;
    s = {
      ...s,
      opportunities: [
        {
          id: oppId,
          studentId: s.currentStudentId,
          title: d.purpose,
          provider: "—",
          category: "course",
          deadline: d.deadline,
          institutionId: student.institutionId,
          expenses: d.expenses,
          studentFunds: Math.max(0, d.expenses.reduce((a, e) => a + e.amount, 0) - d.amount),
          priorAssistance: 0,
          outcome: d.purpose,
          createdAt: now(),
        },
        ...s.opportunities,
      ],
    };
  }
  const total = r2(d.expenses.reduce((a, e) => a + e.amount, 0));
  const req: FundingRequest = {
    id,
    ref: nextRef(s),
    studentId: s.currentStudentId,
    opportunityId: oppId,
    purpose: d.purpose,
    totalCost: total,
    studentFunds: r2(Math.max(total - d.amount, 0)),
    reductions: [],
    amount: d.amount,
    funded: 0,
    deadline: d.deadline,
    expenses: d.expenses,
    reason: d.reason,
    documents: d.documents,
    verification: d.verification,
    status: submit ? "Submitted" : "Draft",
    history: [{ at: now(), status: submit ? "Submitted" : "Draft", note: submit ? "Request submitted by student" : "Draft created", actor: "student" }],
    createdAt: now(),
  };
  s = { ...s, requests: [req, ...s.requests] };
  if (submit) s = notify(s, "institution", `New request ${req.ref} to verify`, `${d.purpose} — ${usd(d.amount)}.`, "/institution");
  return s;
};

export const submitRequest = (id: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r || r.status !== "Draft") return s;
  const next = updateRequest(s, id, (r) => withStatus(r, "Submitted", "Request submitted by student", "student"));
  return notify(next, "institution", `New request ${r.ref} to verify`, `${r.purpose} — ${usd(r.amount)}.`, "/institution");
};

export const deleteDraft = (id: string): Action => (s) => ({ ...s, requests: s.requests.filter((r) => !(r.id === id && r.status === "Draft")) });

export const respondToInfo = (id: string, note: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r) return s;
  const next = updateRequest(s, id, (r) => ({
    ...r,
    infoRequested: undefined,
    documents: r.documents.map((d) => ({ ...d, attached: true })),
    history: [...r.history, { at: now(), status: r.status, note: `Student responded: ${note || "documents attached"}`, actor: "student" }],
  }));
  return notify(next, "institution", `${r.ref}: information provided`, note || "The student attached the requested documents.", "/institution");
};

/* ---------- institution ---------- */

export const startReview = (id: string): Action => (s) =>
  updateRequest(s, id, (r) => (r.status === "Submitted" ? withStatus(r, "Under Review", "Institution started verification", "institution") : r));

export const approveRequest = (id: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r || !["Submitted", "Under Review"].includes(r.status)) return s;
  let next = updateRequest(s, id, (r) => {
    const reviewed = r.status === "Submitted" ? withStatus(r, "Under Review", "Institution started verification", "institution") : r;
    return withStatus({ ...reviewed, infoRequested: undefined }, "Verified", "Need verified by institution — visible to sponsors", "institution");
  });
  next = notify(next, "student", `${r.ref} verified`, "Your institution verified the request. Sponsors can now support it.", "/student/requests");
  next = notify(next, "sponsor", "New verified need", `${r.purpose} — ${usd(remainingOf(r))} remaining.`, "/sponsor");
  return next;
};

export const declineRequest = (id: string, reason: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r) return s;
  const next = updateRequest(s, id, (r) => withStatus(r, "Declined", reason || "Not eligible for this assistance", "institution"));
  return notify(next, "student", `${r.ref} not approved`, reason || "Your institution could not verify this request. You can contact them for alternatives.", "/student/requests");
};

export const requestInfo = (id: string, message: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r) return s;
  const next = updateRequest(s, id, (r) => {
    const reviewed = r.status === "Submitted" ? withStatus(r, "Under Review", "Institution started verification", "institution") : r;
    return { ...reviewed, infoRequested: message, history: [...reviewed.history, { at: now(), status: reviewed.status, note: `More information requested: ${message}`, actor: "institution" as const }] };
  });
  return notify(next, "student", `${r.ref}: more information needed`, message, "/student/requests");
};

export const assignWaiver = (id: string, waiverId: string, amount: number): Action => (s) => {
  const w = WAIVERS.find((x) => x.id === waiverId);
  const r = s.requests.find((x) => x.id === id);
  if (!w || !r || amount <= 0) return s;
  const amt = r2(Math.min(amount, remainingOf(r)));
  let next = updateRequest(s, id, (r) => {
    const updated: FundingRequest = {
      ...r,
      amount: r2(r.amount - amt),
      reductions: [...r.reductions, { id: uid("rd"), kind: w.kind === "waiver" ? "waiver" : "discount", sourceId: w.id, title: w.name, amount: amt }],
      history: [...r.history, { at: now(), status: r.status, note: `Institution assigned ${w.name} (−${usd(amt)})`, actor: "institution" }],
    };
    if (["Verified", "Partially Funded", "Fully Funded"].includes(r.status)) {
      const st = fundingStatus(updated);
      return st !== r.status ? withStatus(updated, st, "Funding status updated", "system") : updated;
    }
    return updated;
  });
  next = { ...next, distribution: [{ id: uid("d"), at: now(), label: w.name, amount: amt, requestRef: r.ref, kind: "waiver" }, ...next.distribution] };
  return notify(next, "student", "Fee waiver assigned", `${w.name} reduced ${r.ref} by ${usd(amt)}.`, "/student/requests");
};

/** Add money to a request from sponsor balance, the shared pool, or institution funds. */
export const fundRequest = (id: string, amount: number, source: Contribution["source"]): Action => (s0) => {
  const r = s0.requests.find((x) => x.id === id);
  if (!r) return s0;
  const available = source === "sponsor" ? s0.sponsor.balance : source === "pool" ? s0.pool : s0.institutionFunds;
  const amt = r2(Math.min(amount, remainingOf(r), available));
  if (amt <= 0) return s0;
  let s: AppState = {
    ...s0,
    sponsor: source === "sponsor" ? { ...s0.sponsor, balance: r2(s0.sponsor.balance - amt) } : s0.sponsor,
    pool: source === "pool" ? r2(s0.pool - amt) : s0.pool,
    institutionFunds: source === "institution" ? r2(s0.institutionFunds - amt) : s0.institutionFunds,
  };
  const contribution: Contribution = {
    id: uid("c"),
    sponsorName: source === "sponsor" ? s.sponsor.name : source === "pool" ? "Shared funding pool" : "Institution assistance fund",
    requestId: id,
    amount: amt,
    at: now(),
    source,
  };
  s = { ...s, contributions: [contribution, ...s.contributions] };
  s = updateRequest(s, id, (r) => {
    const updated = { ...r, funded: r2(r.funded + amt) };
    const st = fundingStatus(updated);
    return withStatus(updated, st, `${usd(amt)} received from ${contribution.sponsorName}`, source === "sponsor" ? "sponsor" : "institution");
  });
  s = { ...s, distribution: [{ id: uid("d"), at: now(), label: `${contribution.sponsorName} → ${r.purpose}`, amount: amt, requestRef: r.ref, kind: source === "pool" ? "pool" : "funds" }, ...s.distribution] };
  const after = s.requests.find((x) => x.id === id)!;
  s = notify(s, "student", after.status === "Fully Funded" ? "Opportunity unlocked!" : "New support received", `${usd(amt)} toward ${r.purpose}. Remaining gap: ${usd(remainingOf(after))}.`, "/student");
  if (source !== "institution") s = notify(s, "institution", `${r.ref} received ${usd(amt)}`, after.status === "Fully Funded" ? "Fully funded — confirm disbursement when paid." : "Partially funded.", "/institution");
  if (source === "sponsor") s = notify(s, "sponsor", "Contribution recorded", `Your impact receipt for ${r.ref} is ready.`, `/receipt/${contribution.id}`);
  return s;
};

export const contributeToPool = (amount: number): Action => (s) => {
  const amt = r2(Math.min(amount, s.sponsor.balance));
  if (amt <= 0) return s;
  const c: Contribution = { id: uid("c"), sponsorName: s.sponsor.name, requestId: null, amount: amt, at: now(), source: "sponsor" };
  const next: AppState = {
    ...s,
    sponsor: { ...s.sponsor, balance: r2(s.sponsor.balance - amt) },
    pool: r2(s.pool + amt),
    contributions: [c, ...s.contributions],
    distribution: [{ id: uid("d"), at: now(), label: `${s.sponsor.name} → shared funding pool`, amount: amt, kind: "pool" }, ...s.distribution],
  };
  return notify(next, "institution", "Shared pool topped up", `${usd(amt)} added by ${s.sponsor.name}. Allocate it to verified needs.`, "/institution");
};

export const confirmCompleted = (id: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r || r.status !== "Fully Funded") return s;
  let next = updateRequest(s, id, (r) => withStatus(r, "Completed", "Assistance paid directly to the provider and confirmed", "institution"));
  next = { ...next, distribution: [{ id: uid("d"), at: now(), label: `Paid ${r.purpose.toLowerCase()} directly to provider`, amount: r.funded, requestRef: r.ref, kind: "completion" }, ...next.distribution] };
  next = notify(next, "student", "Assistance completed", `${r.purpose} is paid. Good luck!`, "/student/passport");
  return notify(next, "sponsor", "Outcome confirmed", `${r.ref} was completed by the institution.`, "/sponsor/contributions");
};

/* ---------- resources ---------- */

export const reserveResource = (resourceId: string, studentId: string, pickupDate: string, by: Role): Action => (s) => {
  const res = s.resources.find((r) => r.id === resourceId);
  if (!res || res.available <= 0) return s;
  const next: AppState = {
    ...s,
    resources: s.resources.map((r) => (r.id === resourceId && r.type !== "free-resource" ? { ...r, available: r.available - 1 } : r)),
    reservations: [{ id: uid("rv"), resourceId, studentId, pickupDate, status: "Reserved", createdAt: now(), by }, ...s.reservations],
  };
  return notify(
    next,
    "student",
    "Item reserved",
    `${res.name} is reserved for pickup ${new Date(pickupDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Saves about ${usd(res.retailValue)}.`,
    "/student/resources",
  );
};

export const updateReservation = (id: string, status: "Collected" | "Returned"): Action => (s) => {
  const rv = s.reservations.find((r) => r.id === id);
  if (!rv) return s;
  return {
    ...s,
    reservations: s.reservations.map((r) => (r.id === id ? { ...r, status } : r)),
    resources: status === "Returned" ? s.resources.map((r) => (r.id === rv.resourceId && r.type !== "free-resource" ? { ...r, available: Math.min(r.total, r.available + 1) } : r)) : s.resources,
  };
};

export const cancelReservation = (id: string): Action => (s) => {
  const rv = s.reservations.find((r) => r.id === id);
  if (!rv) return s;
  return {
    ...s,
    reservations: s.reservations.filter((r) => r.id !== id),
    resources: s.resources.map((r) => (r.id === rv.resourceId && r.type !== "free-resource" ? { ...r, available: Math.min(r.total, r.available + 1) } : r)),
  };
};

/* ---------- calculator ---------- */

export const saveScenarios = (scenarios: CalculatorScenario[]): Action => (s) => ({ ...s, scenarios });
