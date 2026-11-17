/**
 * Pure state transitions. Every screen calls these through the store, so the
 * student, sponsor and institution views always stay in sync.
 */
import type { AppState, CalculatorScenario, Contribution, Expense, FundingRequest, Opportunity, Reduction, RequestStatus, Resource, Role } from "./types";
import type { EnginePlan } from "./engine";
import { planFindings } from "./engine";
import { r2, uid, usd } from "./format";
import { WAIVERS } from "./knowledge";

export type Action = (s: AppState) => AppState;

const now = () => new Date().toISOString();

export const remainingOf = (r: Pick<FundingRequest, "amount" | "funded">) => r2(Math.max(r.amount - r.funded, 0));

function notify(s: AppState, role: Role, title: string, body: string, href?: string): AppState {
  return { ...s, notifications: [{ id: uid("n"), role, title, body, href, at: now(), read: false }, ...s.notifications].slice(0, 80) };
}

function log(s: AppState, role: Role | "system", text: string): AppState {
  return { ...s, activity: [{ id: uid("a"), role, text, at: now() }, ...s.activity].slice(0, 150) };
}

function patchRequest(s: AppState, id: string, fn: (r: FundingRequest) => FundingRequest): AppState {
  return { ...s, requests: s.requests.map((r) => (r.id === id ? fn(r) : r)) };
}

function withStatus(r: FundingRequest, status: RequestStatus, note: string, actor: FundingRequest["history"][number]["actor"]): FundingRequest {
  return { ...r, status, history: [...r.history, { at: now(), status, note, actor }] };
}

function fundingStatus(r: FundingRequest): RequestStatus {
  if (r.amount <= 0 || r.funded >= r.amount) return "Fully Funded";
  return r.funded > 0 ? "Partially Funded" : "Verified";
}

function nextRef(s: AppState) {
  return `BF-${Math.max(2054, ...s.requests.map((r) => Number(r.ref.replace(/\D/g, "")) || 0)) + 1}`;
}

const studentName = (s: AppState, id: string) => s.students.find((x) => x.id === id)?.firstName ?? "Student";
export const currentSponsor = (s: AppState) => s.sponsors.find((x) => x.id === s.currentSponsorId)!;

/* ---------------- global ---------------- */

export const setRole = (role: Role): Action => (s) => ({ ...s, role });
export const setInstitution = (id: string): Action => (s) => ({ ...s, currentInstitutionId: id });
export const setSponsor = (id: string): Action => (s) => ({ ...s, currentSponsorId: id });
export const setOnboarded = (): Action => (s) => ({ ...s, onboarded: true });
export const setDemo = (patch: Partial<AppState["demo"]>): Action => (s) => ({ ...s, demo: { ...s.demo, ...patch } });
export const setProfile = (patch: Partial<AppState["profile"]>): Action => (s) => ({ ...s, profile: { ...s.profile, ...patch } });
export const markRead = (id: string): Action => (s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
export const markAllRead = (role: Role): Action => (s) => ({ ...s, notifications: s.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)) });
export const saveScenarios = (scenarios: CalculatorScenario[]): Action => (s) => ({ ...s, scenarios });

const toggle = (xs: string[], id: string) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]);
export const toggleSavedWaiver = (id: string): Action => (s) => ({ ...s, savedWaivers: toggle(s.savedWaivers, id) });
export const toggleSavedNeed = (id: string): Action => (s) => ({ ...s, savedNeeds: toggle(s.savedNeeds, id) });
export const toggleReminder = (id: string, label: string): Action => (s) => {
  const on = !s.reminders.includes(id);
  const next = { ...s, reminders: toggle(s.reminders, id) };
  return on ? notify(log(next, "student", `Reminder set: ${label}`), "student", "Reminder set", `We'll remind you before: ${label}.`, "/student/tracker") : next;
};

/* ---------------- student ---------------- */

export type OpportunityDraft = Omit<Opportunity, "id" | "studentId" | "createdAt">;

export const addOpportunity = (draft: OpportunityDraft, id = uid("o")): Action => (s0) => {
  let s: AppState = { ...s0, opportunities: [{ ...draft, id, studentId: s0.currentStudentId, createdAt: now() }, ...s0.opportunities] };
  s = log(s, "student", `Added opportunity: ${draft.title}`);
  return notify(s, "student", "Opportunity saved", `${draft.title} — run BridgeEngine to build your plan.`, `/student/engine?opp=${id}`);
};

export const removeOpportunity = (id: string): Action => (s) => ({
  ...s,
  opportunities: s.opportunities.filter((o) => o.id !== id),
  requests: s.requests.filter((r) => r.opportunityId !== id || r.status !== "Draft"),
});

/** Turn a BridgeEngine plan into a funding request. Re-running replaces earlier estimates — never adds to them. */
export const applyEnginePlan = (oppId: string, plan: EnginePlan, submit: boolean): Action => (s0) => {
  let s = s0;
  const opp = s.opportunities.find((o) => o.id === oppId);
  if (!opp) return s;
  const existing = s.requests.find((r) => r.opportunityId === oppId && r.status !== "Rejected");
  if (existing && !["Draft", "Submitted", "Under Review", "Additional Information Required"].includes(existing.status)) return s;

  const findings = planFindings(plan);
  for (const f of findings.filter((f) => f.kind === "borrow")) {
    if (!s.reservations.some((r) => r.resourceId === f.sourceId && r.studentId === opp.studentId && r.status !== "Cancelled")) {
      s = reserveResource(f.sourceId, opp.studentId, opp.deadline)(s);
    }
  }
  const reductions: Reduction[] = findings.map((f) => ({ id: uid("rd"), kind: f.kind as Reduction["kind"], sourceId: f.sourceId, title: f.title, amount: f.amount, expenseId: f.expenseId, confirmed: false }));
  const closed = plan.sponsorAmount <= 0;
  const status: RequestStatus = submit ? "Submitted" : "Draft";
  const base: FundingRequest = existing ?? {
    id: uid("r"),
    ref: nextRef(s),
    studentId: opp.studentId,
    opportunityId: oppId,
    institutionId: opp.institutionId,
    purpose: opp.title,
    totalCost: plan.totalCost,
    studentFunds: plan.studentFunds,
    reductions: [],
    amount: plan.sponsorAmount,
    funded: 0,
    deadline: opp.deadline,
    expenses: opp.expenses,
    explanation: closed ? "Gap closed through cost reduction. Verification of the estimated savings requested." : "Remaining cost after the waivers, alternatives and grants identified by BridgeEngine.",
    documents: [
      { name: "Proof of enrollment", attached: true },
      { name: "Official cost confirmation", attached: opp.expenses.every((e) => e.confirmed) },
    ],
    status: "Draft",
    history: [],
    createdAt: now(),
  };
  const req = withStatus(
    { ...base, totalCost: plan.totalCost, studentFunds: plan.studentFunds, reductions, amount: plan.sponsorAmount, expenses: opp.expenses, deadline: opp.deadline },
    status,
    submit ? `BridgeEngine plan applied: ${usd(plan.reductionsTotal)} in estimated savings, ${usd(plan.sponsorAmount)} requested` : "Plan saved as draft",
    "student",
  );
  s = { ...s, requests: existing ? s.requests.map((r) => (r.id === existing.id ? req : r)) : [req, ...s.requests] };
  s = log(s, "student", `${submit ? "Submitted" : "Saved"} ${req.ref}: ${opp.title} (${usd(plan.sponsorAmount)} requested)`);
  if (submit) {
    s = notify(s, "institution", `New request ${req.ref}`, `${studentName(s, opp.studentId)} · ${opp.title} — ${usd(plan.sponsorAmount)} after ${usd(plan.reductionsTotal)} in estimated savings.`, `/institution?focus=${req.id}`);
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
  explanation: string;
  documents: { name: string; attached: boolean }[];
  institutionId: string;
}

export const createRequest = (d: RequestDraft, submit: boolean): Action => (s0) => {
  let s = s0;
  let oppId = d.opportunityId;
  const total = r2(d.expenses.reduce((a, e) => a + e.amount, 0));
  if (!oppId) {
    oppId = uid("o");
    s = { ...s, opportunities: [{ id: oppId, studentId: s.currentStudentId, title: d.purpose, provider: "—", category: "course", deadline: d.deadline, institutionId: d.institutionId, expenses: d.expenses, studentFunds: r2(Math.max(total - d.amount, 0)), priorAssistance: 0, outcome: d.purpose, createdAt: now() }, ...s.opportunities] };
  }
  const req: FundingRequest = {
    id: uid("r"),
    ref: nextRef(s),
    studentId: s.currentStudentId,
    opportunityId: oppId,
    institutionId: d.institutionId,
    purpose: d.purpose,
    totalCost: total,
    studentFunds: r2(Math.max(total - d.amount, 0)),
    reductions: [],
    amount: d.amount,
    funded: 0,
    deadline: d.deadline,
    expenses: d.expenses,
    explanation: d.explanation,
    documents: d.documents,
    status: submit ? "Submitted" : "Draft",
    history: [{ at: now(), status: submit ? "Submitted" : "Draft", note: submit ? "Request submitted by student" : "Draft created", actor: "student" }],
    createdAt: now(),
  };
  s = log({ ...s, requests: [req, ...s.requests] }, "student", `${submit ? "Submitted" : "Drafted"} ${req.ref}: ${d.purpose}`);
  return submit ? notify(s, "institution", `New request ${req.ref}`, `${d.purpose} — ${usd(d.amount)}.`, `/institution?focus=${req.id}`) : s;
};

export const submitRequest = (id: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r || r.status !== "Draft") return s;
  const next = log(patchRequest(s, id, (r) => withStatus(r, "Submitted", "Request submitted by student", "student")), "student", `Submitted ${r.ref}`);
  return notify(next, "institution", `New request ${r.ref}`, `${r.purpose} — ${usd(r.amount)}.`, `/institution?focus=${r.id}`);
};

export const deleteDraft = (id: string): Action => (s) => ({ ...s, requests: s.requests.filter((r) => !(r.id === id && r.status === "Draft")) });

export const respondToInfo = (id: string, note: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r || r.status !== "Additional Information Required") return s;
  let next = patchRequest(s, id, (r) => withStatus({ ...r, infoRequested: undefined, documents: r.documents.map((d) => ({ ...d, attached: true })) }, "Under Review", `Student responded: ${note || "documents attached"}`, "student"));
  next = log(next, "student", `Provided additional information for ${r.ref}`);
  return notify(next, "institution", `${r.ref}: information provided`, note || "The student attached the requested documents.", `/institution?focus=${r.id}`);
};

/* ---------------- institution ---------------- */

export const startReview = (id: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r || r.status !== "Submitted") return s;
  return log(patchRequest(s, id, (r) => withStatus(r, "Under Review", "Institution started verification", "institution")), "institution", `Started reviewing ${r.ref}`);
};

/** Verify the need. Estimated savings found by BridgeEngine become confirmed assistance. */
export const approveRequest = (id: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r || !["Submitted", "Under Review", "Additional Information Required"].includes(r.status)) return s;
  let next = patchRequest(s, id, (r) => {
    const reviewed = r.status === "Submitted" ? withStatus(r, "Under Review", "Institution started verification", "institution") : r;
    const confirmed = { ...reviewed, infoRequested: undefined, reductions: reviewed.reductions.map((x) => ({ ...x, confirmed: true })) };
    const verified = withStatus(confirmed, "Verified", "Need verified by institution — visible to sponsors", "institution");
    return verified.amount <= 0 ? withStatus(verified, "Fully Funded", "Gap fully closed by confirmed savings", "system") : verified;
  });
  next = {
    ...next,
    distribution: [
      ...r.reductions.filter((x) => !x.confirmed).map((x) => ({ id: uid("d"), at: now(), label: `Confirmed: ${x.title}`, amount: x.amount, requestRef: r.ref, institutionId: r.institutionId, kind: (x.kind === "borrow" ? "resource" : "waiver") as "resource" | "waiver" })),
      ...next.distribution,
    ],
  };
  next = log(next, "institution", `Verified ${r.ref} (${studentName(s, r.studentId)})`);
  next = notify(next, "student", `${r.ref} verified`, "Your institution verified the request and confirmed your savings. Sponsors can now support it.", "/student/requests");
  return r.amount > 0 ? notify(next, "sponsor", "New verified need", `${r.purpose} — ${usd(remainingOf(r))} remaining.`, `/sponsor/marketplace/${r.id}`) : next;
};

export const rejectRequest = (id: string, reason: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r) return s;
  const next = log(patchRequest(s, id, (r) => withStatus(r, "Rejected", reason, "institution")), "institution", `Rejected ${r.ref}`);
  return notify(next, "student", `${r.ref} was not approved`, reason, "/student/requests");
};

export const requestInfo = (id: string, message: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r) return s;
  const next = log(patchRequest(s, id, (r) => withStatus({ ...r, infoRequested: message }, "Additional Information Required", `Additional documentation requested: ${message}`, "institution")), "institution", `Requested documents for ${r.ref}`);
  return notify(next, "student", `${r.ref}: additional information required`, message, "/student/requests");
};

/** Assign a waiver to a request. Each waiver applies once; it can never reduce below the remaining need. */
export const assignWaiver = (id: string, waiverId: string, amount: number): Action => (s) => {
  const w = WAIVERS.find((x) => x.id === waiverId);
  const r = s.requests.find((x) => x.id === id);
  if (!w || !r || r.reductions.some((x) => x.sourceId === waiverId)) return s;
  const amt = r2(Math.min(amount, remainingOf(r)));
  if (amt <= 0) return s;
  let next = patchRequest(s, id, (r) => {
    const updated: FundingRequest = {
      ...r,
      amount: r2(r.amount - amt),
      reductions: [...r.reductions, { id: uid("rd"), kind: w.kind === "institutional" ? "institutional" : w.kind, sourceId: w.id, title: w.name, amount: amt, confirmed: true }],
      history: [...r.history, { at: now(), status: r.status, note: `Institution assigned ${w.name} (−${usd(amt)})`, actor: "institution" }],
    };
    if (["Verified", "Partially Funded"].includes(r.status)) {
      const st = fundingStatus(updated);
      return st !== r.status ? withStatus(updated, st, "Funding status updated", "system") : updated;
    }
    return updated;
  });
  next = { ...next, distribution: [{ id: uid("d"), at: now(), label: w.name, amount: amt, requestRef: r.ref, institutionId: r.institutionId, kind: "waiver" }, ...next.distribution] };
  next = log(next, "institution", `Assigned ${w.name} to ${r.ref} (−${usd(amt)})`);
  return notify(next, "student", "Fee waiver assigned", `${w.name} reduced ${r.ref} by ${usd(amt)}.`, "/student/requests");
};

/** Fund a request from the active sponsor, the shared pool, or the verifying institution's fund. Never exceeds the remaining gap. */
export const fundRequest = (id: string, amount: number, source: Contribution["source"]): Action => (s0) => {
  const r = s0.requests.find((x) => x.id === id);
  if (!r || !["Verified", "Partially Funded"].includes(r.status)) return s0;
  const sponsor = currentSponsor(s0);
  const inst = s0.institutions.find((i) => i.id === r.institutionId);
  const available = source === "sponsor" ? sponsor.balance : source === "pool" ? s0.pool : inst?.fund ?? 0;
  const amt = r2(Math.min(amount, remainingOf(r), available));
  if (amt <= 0) return s0;
  const label = source === "sponsor" ? sponsor.name : source === "pool" ? "Shared opportunity pool" : `${inst?.name} assistance fund`;
  let s: AppState = {
    ...s0,
    sponsors: source === "sponsor" ? s0.sponsors.map((x) => (x.id === sponsor.id ? { ...x, balance: r2(x.balance - amt) } : x)) : s0.sponsors,
    pool: source === "pool" ? r2(s0.pool - amt) : s0.pool,
    institutions: source === "institution" ? s0.institutions.map((i) => (i.id === r.institutionId ? { ...i, fund: r2(i.fund - amt) } : i)) : s0.institutions,
  };
  const c: Contribution = { id: uid("c"), sponsorId: source === "sponsor" ? sponsor.id : null, sourceLabel: label, requestId: id, amount: amt, at: now(), source };
  s = { ...s, contributions: [c, ...s.contributions] };
  s = patchRequest(s, id, (r) => {
    const updated = { ...r, funded: r2(r.funded + amt) };
    return withStatus(updated, fundingStatus(updated), `${usd(amt)} received from ${label}`, source === "sponsor" ? "sponsor" : "institution");
  });
  s = { ...s, distribution: [{ id: uid("d"), at: now(), label: `${label} → ${r.purpose}`, amount: amt, requestRef: r.ref, institutionId: r.institutionId, kind: source === "pool" ? "pool" : "funds" }, ...s.distribution] };
  const after = s.requests.find((x) => x.id === id)!;
  s = log(s, source === "sponsor" ? "sponsor" : "institution", `${label} contributed ${usd(amt)} to ${r.ref}`);
  s = notify(s, "student", after.status === "Fully Funded" ? "Your opportunity is fully funded" : "New assistance received", `${usd(amt)} toward ${r.purpose}. Remaining gap: ${usd(remainingOf(after))}.`, "/student");
  s = notify(s, "institution", `${r.ref} received ${usd(amt)}`, after.status === "Fully Funded" ? "Fully funded — confirm completion once the provider is paid." : "Partially funded.", `/institution?focus=${r.id}`);
  if (source === "sponsor") s = notify(s, "sponsor", "Contribution recorded", `Your impact receipt for ${r.ref} is ready.`, `/receipt/${c.id}`);
  return s;
};

export const contributeToPool = (amount: number): Action => (s) => {
  const sp = currentSponsor(s);
  const amt = r2(Math.min(amount, sp.balance));
  if (amt <= 0) return s;
  let next: AppState = {
    ...s,
    sponsors: s.sponsors.map((x) => (x.id === sp.id ? { ...x, balance: r2(x.balance - amt) } : x)),
    pool: r2(s.pool + amt),
    contributions: [{ id: uid("c"), sponsorId: sp.id, sourceLabel: sp.name, requestId: null, amount: amt, at: now(), source: "sponsor" }, ...s.contributions],
    distribution: [{ id: uid("d"), at: now(), label: `${sp.name} → shared opportunity pool`, amount: amt, kind: "pool" }, ...s.distribution],
  };
  next = log(next, "sponsor", `${sp.name} added ${usd(amt)} to the shared pool`);
  return notify(next, "institution", "Shared pool topped up", `${usd(amt)} added by ${sp.name}.`, "/institution");
};

export const confirmCompleted = (id: string): Action => (s) => {
  const r = s.requests.find((x) => x.id === id);
  if (!r || r.status !== "Fully Funded") return s;
  let next = patchRequest(s, id, (r) => withStatus(r, "Completed", "Provider paid directly and completion confirmed", "institution"));
  next = { ...next, distribution: [{ id: uid("d"), at: now(), label: `Paid ${r.purpose.toLowerCase()} to provider`, amount: r.funded, requestRef: r.ref, institutionId: r.institutionId, kind: "completion" }, ...next.distribution] };
  next = log(next, "institution", `Confirmed completion of ${r.ref}`);
  next = notify(next, "student", "Assistance completed", `${r.purpose} has been paid. Good luck!`, "/student/tracker");
  return notify(next, "sponsor", "Outcome confirmed", `${r.ref} was completed. Your receipt now shows the final status.`, "/sponsor");
};

/* ---------------- resources ---------------- */

export const reserveResource = (resourceId: string, studentId: string, pickupDate: string): Action => (s) => {
  const res = s.resources.find((r) => r.id === resourceId);
  if (!res || res.available <= 0) return s;
  let next: AppState = {
    ...s,
    resources: s.resources.map((r) => (r.id === resourceId ? { ...r, available: r.available - 1 } : r)),
    reservations: [{ id: uid("rv"), resourceId, studentId, pickupDate, status: "Reserved", createdAt: now() }, ...s.reservations],
  };
  next = log(next, "student", `Reserved ${res.name} for ${studentName(s, studentId)}`);
  return notify(next, "student", "Item reserved", `${res.name} — saves about ${usd(res.retailValue)}.`, "/student/resources");
};

export const updateReservation = (id: string, status: "Collected" | "Returned" | "Cancelled"): Action => (s) => {
  const rv = s.reservations.find((r) => r.id === id);
  if (!rv) return s;
  const frees = status === "Returned" || status === "Cancelled";
  return log(
    {
      ...s,
      reservations: s.reservations.map((r) => (r.id === id ? { ...r, status } : r)),
      resources: frees ? s.resources.map((r) => (r.id === rv.resourceId ? { ...r, available: Math.min(r.total, r.available + 1) } : r)) : s.resources,
    },
    "institution",
    `Reservation marked ${status.toLowerCase()}`,
  );
};

export const addResource = (r: Omit<Resource, "id">): Action => (s) => log({ ...s, resources: [{ ...r, id: uid("res") }, ...s.resources] }, "institution", `Added ${r.total} × ${r.name} to the lending inventory`);

export const adjustInventory = (id: string, delta: number): Action => (s) => ({
  ...s,
  resources: s.resources.map((r) => {
    if (r.id !== id) return r;
    const total = Math.max(r.total - r.available, r.total + delta); // never below items on loan
    return { ...r, total, available: Math.max(0, r.available + (total - r.total)) };
  }),
});

export const setEligibility = (patch: Partial<import("./types").EligibilityProfile>): Action => (s) => ({
  ...s,
  students: s.students.map((st) => (st.id === s.currentStudentId ? { ...st, eligibility: { ...st.eligibility, ...patch } } : st)),
});

export const addMilestone = (label: string): Action => (s) => log({ ...s, milestones: [...s.milestones, { id: uid("m"), at: now(), label }] }, "student", `Milestone added: ${label}`);
