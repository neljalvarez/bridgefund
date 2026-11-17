# BridgeFund

**Small gaps. Big futures.**

Students who qualify for an opportunity are often stopped by something small: an exam fee, a university application fee, a competition registration, a bus ticket or a calculator. BridgeFund finds those barriers and **reduces them before anyone is asked for money**. It checks fee waivers, free alternatives, discounts, equipment the student can borrow, institutional assistance and grants. Only after all of that does it connect the student with verified sponsors, and only for the amount still left.

BridgeFund is not a scholarship directory, a crowdfunding site, a budgeting app or a lender.

> ⚠️ **Competition prototype.** Every student, institution, sponsor, programme, waiver, amount and outcome in this repository is fictional demonstration data. Sign-in, verification and transactions are simulated, and no real money moves. BridgeFund has not run a pilot and has no partners, customers or users. Final eligibility for any real waiver is always decided by the organisation that offers it.

---

## What's new in this version

| Area | Where | What it does |
| --- | --- | --- |
| **BridgeEngine 2.0** | `/student/engine`, `src/lib/optimizer.ts` | Calculates three alternative assistance strategies (lowest out-of-pocket, fastest, lowest external dependency) under real constraints, compares their trade-offs and labels every source *Confirmed*, *Estimated* or *Pending*. |
| **Opportunity Rescue Simulator** | `/simulator` | Crowdfunding vs. BridgeFund for any opportunity, with live charts. |
| **Impact Multiplier** | Sponsor dashboard, institution analytics, demo, presentation | Barriers resolved ÷ sponsor funding used. |
| **Financial Deadline Rescue** | Student dashboard, `/institution/urgent` | Countdown, gap, processing estimate, urgency, next action and alternatives; emergency-fund and priority review for staff. |
| **Verification & fraud prevention** | Institution review cards, `/institution/audit` | Checklist, document review, duplicate detection, manual flags, funding history, simulated direct provider payments, CSV audit export. |
| **Supply & demand matching** | `/institution/matching` | Matches needs to lending inventory, fee reductions, transport assistance and grants, with staff availability confirmation and no double assignment. |
| **Social Impact Dashboard** | `/impact` | Public demonstration metrics with country and category filters, separating barriers resolved, participation and confirmed outcomes. |
| **Sponsor Impact Planner** | `/sponsor/allocate` | Compares three allocation approaches for a budget; sponsors adjust, institutions approve the final allocation. |
| **Business Model Simulator** | `/business#simulator` | MRR, ARR, costs, profit, break-even and 24-month projections under three scenarios. |
| **Why BridgeFund?** | `/why` | Fair comparison with five alternative approaches and a research and evidence section with source links. |
| **Global scalability** | `/scale`, Settings | Market registry, country-scoped programmes, display currencies and a navigation translation preview. |
| **Pilot programme** | `/pilot` | Proposed pilot design and an empty dashboard for real, verified results. |
| **Presentation Mode** | `/present` (“Present” in the main navigation and app header) | Fullscreen 8-section, ~3-minute pitch built from live components. |

## Quick start

```bash
git clone https://github.com/neljalvarez/bridgefund.git
cd bridgefund
npm install
npm run dev            # → http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (all pages prerender) |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript check |
| `npm test` | 22 unit tests: BridgeEngine, optimiser, allocation, funding rules, verification, matching, simulator and business model (Node ≥ 22.6) |

You need Node.js 18.18 or newer; Node 22 is recommended. The app needs no API keys, database or paid services. Demo data lives in the browser's `localStorage` under `bridgefund-state` (schema version 5; older saved data is replaced automatically).

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import `neljalvarez/bridgefund`.
2. Keep the defaults: framework **Next.js**, build command `next build`.
3. Click **Deploy**. You don't need to set any environment variables.

Or use the CLI: `npx vercel --prod`.

## Demonstration instructions

### Option A — Presentation Mode (about 3 minutes)

Open `/present` or click **Present**. Use ← → (or Space, PageUp/PageDown), number keys **1–8**, or the section tabs. **F** toggles fullscreen. A timer tracks progress against the 3:00 target and can be paused by clicking it. The live journey runs in a sandbox, so presenting never changes the demo data.

| # | Section | ~Time | Show |
| --- | --- | --- | --- |
| 1 | The problem | 20s | Amina's $110 gap and three sourced statistics |
| 2 | Existing solution limitations | 20s | Five alternative approaches and the missing piece |
| 3 | Introducing BridgeFund | 20s | Identify → Reduce → Verify → Fund, with the interactive gap example |
| 4 | BridgeEngine demonstration | 30s | The animated seven-step analysis, then the **Strategy comparison** tab |
| 5 | Live student journey | 35s | Press the four steps: submit, verify, fund, pay provider. The record ends with a **1.83x** multiplier. |
| 6 | Measurable social impact | 25s | $110 ÷ $60 = 1.83x; 8 vs 4 opportunities from a $500 budget |
| 7 | Business model and scalability | 20s | Revenue streams, break-even, markets |
| 8 | Future vision | 10s | Pilot → year one → beyond |

### Option B — 90-second demo

Click **See how it works** on the landing page, **Launch Interactive Demo** in the app, or go to `/demo`. One fictional student, five steps, one button per step (→ also works). Every step performs the real action, so the student, school and sponsor dashboards update too.

| # | Step | Big number | Button |
| --- | --- | --- | --- |
| 1 | The barrier | **$110** missing ($180 exam, $70 saved) | Run BridgeEngine |
| 2 | BridgeEngine | **$60** left after a $50 fee waiver | Verify as her school |
| 3 | Verified | **$60** verified need | Fund as a sponsor |
| 4 | Funded | **$0** — sponsor balance $500 → $440 | See the impact (pays the provider) |
| 5 | Impact | **1.83x** impact multiplier | Replay (resets the data) |

### Option C — Explore the features

1. **Student → Get assistance**: costs, BridgeEngine, choose a plan, submit, track — all on one page.
2. **Student → Dashboard**: the *Financial deadline rescue* card lists at-risk opportunities.
3. **Institution → Urgent cases**: deadline-risk cases, requests flagged for manual review (try BF-2056, a possible duplicate, and BF-2057, an institution mismatch with missing documents), and sponsor allocations awaiting approval.
4. **Institution → Requests**: expand a request to see the verification checklist, accept or reject documents, raise or resolve flags, and approve (a confirmation lists any open items).
5. **Institution → Needs matching**: confirm availability and assign a match; it disappears from the list.
6. **Sponsor → Budget planner**: compare approaches, adjust amounts, submit for review — then approve or decline it under Institution → Urgent cases.
7. **Institution → Audit log**: every action, plus the simulated provider-payment ledger, exportable to CSV.
8. Public pages: `/simulator`, `/impact`, `/business#simulator`, `/why`, `/scale`, `/pilot`.
9. **Settings**: switch the display currency (e.g. KES) and preview French or Spanish navigation.

## Features

**Navigation.** Every role has the same five sections — **Overview, Find Assistance, My Opportunities, Resources, Impact** — with role-specific pages inside each:

| Section | Student | Sponsor | Institution |
| --- | --- | --- | --- |
| Overview | Dashboard | Dashboard | Dashboard |
| Find Assistance | Get assistance (BridgeEngine), Fee waivers | Verified needs | Needs matching, Urgent cases |
| My Opportunities | My requests | My contributions | Requests (verification queue) |
| Resources | Borrow equipment, Cost calculator | Budget planner | Lending inventory |
| Impact | My progress | My impact | Analytics, Audit log |

**Dashboards.** Each dashboard leads with three numbers (remaining gap, available assistance, next deadline) and one **Next step** with a single primary button. Secondary statistics, timelines and activity sit in a collapsed **More details** section.

**One assistance journey.** *Get assistance* (`/student/engine`) walks students through five steps on one page: **Costs → Solutions (BridgeEngine's seven checks) → Savings (choose one of three plans) → Request → Track**. *Add opportunity* (`/student/scanner`) feeds straight into it.

### Student
- **Dashboard** (`/student`). Remaining gap, assistance found, next deadline, one recommended next step, and a progress list of opportunities.
- **Add opportunity** (`/student/scanner`). A six-step questionnaire covering opportunity type, institution, deadline, expenses (added one by one), funds and existing assistance, and eligibility. It produces a professional barrier report with a live preview from BridgeEngine.
- **Get assistance** (`/student/engine`). The five-step journey above, with BridgeEngine at its centre.
- **Assistance requests** (`/student/requests`). Each request has a purpose, exact amount, deadline, breakdown, private explanation, document placeholders and a verifying institution. Requests move through **Draft → Submitted → Under Review → Additional Information Required → Verified → Partially Funded → Fully Funded → Completed**.
- **Opportunity cost calculator** (`/student/calculator`). Compares up to three opportunities across eight cost categories and shows total cost, available assistance, out-of-pocket cost, remaining gap and an affordability chart.
- **Fee waiver finder** (`/student/waivers`). Filter by country, opportunity type, education level, eligibility, deadline and estimated savings, and save waivers. A personalised eligibility assessment labels each result *likely*, *check requirements* or *not available*, and never guarantees eligibility.
- **Borrow equipment** (`/student/resources`). Search and filter by category and location, then reserve an item and track it from Reserved to Collected to Returned. Each item shows how much borrowing saves.
- **My progress** (`/student/tracker`). A calendar view, per-deadline reminders, documents still required, money saved and personal milestones.

### Sponsor
- **Dashboard** (`/sponsor`). Balance, open verified needs, next deadline, and the need to fund next.
- **My contributions** (`/sponsor/contributions`). Filterable history, receipts and the shared pool.
- **My impact** (`/sponsor/impact`). Impact Multiplier and charts by category and status.
- **Verified needs** (`/sponsor/marketplace`). Filter by category, financial gap, location, deadline, institution and urgency, and save needs. Each need has its own detail page at `/sponsor/marketplace/[id]`. Needs are **never ranked by popularity**.
- **Budget planner** (`/sponsor/allocate`). Enter a budget and compare three approaches side by side — *support the most verified needs*, *prioritise urgent deadlines*, or *focus on one category* — with needs covered, students reached, urgent needs covered, money left unallocated and each approach's trade-off. Every amount can be edited. Submitting **holds** the amount from the sponsor balance as pending allocations; institutions approve (applied, capped at the remaining gap) or decline (returned) each one.
- **Impact Multiplier** on the dashboard for the requests the sponsor supported.
- **Impact receipts** (`/receipt/[id]`). Show the contribution, the expense it covered, an anonymous recipient reference, verification status, completion date, a breakdown and the educational outcome. They can be printed or downloaded as HTML.

### Institution
- **Dashboard** (`/institution`). Unresolved gaps, available assistance, next deadline, the request to review next, and cases needing attention.
- **Requests** (`/institution/requests`). The verification queue, approved, completed and history tabs. Approve or reject, request documents, confirm savings, assign waivers, reserve equipment, allocate funds and confirm completion.
- **Urgent cases** (`/institution/urgent`). Deadline-risk cases sorted by severity, with countdown, gap, processing estimate, next action and alternatives; *mark priority review* and *cover from emergency fund* (with confirmation). Also lists requests needing manual review and sponsor allocations awaiting approval.
- **Verification panel** on every request: institutional, opportunity and expense checks; document Accept/Reject; duplicate detection; amount consistency; manual flags; funding history with simulated provider payments; outcome recording (participated / completed / did not participate).
- **Needs matching** (`/institution/matching`). See below.
- **Audit log** (`/institution/audit`). Searchable, filterable by actor, CSV export, and a provider-payment ledger.
- **Lending inventory** (`/institution/resources`). Add items, adjust quantities and manage active loans.
- **Barrier analytics** (`/institution/analytics`). Aggregated charts with date and category filters, including the Impact Multiplier and barriers resolved vs. sponsor funding by category. Analytics never expose an individual student.

### Across the app
Global search (`⌘K` / `Ctrl+K`), a notification center for each role, deadline reminders, saved items, activity history (`/activity`), profile settings (`/settings`) with display currency and language preview, presentation mode, and dark mode. Pages load with skeleton screens and fade in on navigation. Dialogs trap keyboard focus and there is a skip-to-content link. Layouts are responsive, and **Reset demo** is in the account menu and in settings.

## Calculation methods

All calculations run in USD in pure, unit-tested functions. Display currency conversion uses fixed illustrative rates and happens only at formatting time.

### BridgeEngine 2.0 — strategy optimisation (`src/lib/optimizer.ts`)

The optimiser enumerates every candidate option (waivers, discounts, free alternatives, borrowing, institutional programmes, grants) for each expense line, then builds three strategies from the same option set:

| Strategy | Selection rule |
| --- | --- |
| **Lowest external dependency** (default recommendation) | Non-cash options first (reductions, borrowing), the student's own funds next, outside cash last. |
| **Lowest out-of-pocket cost** | Options by expected value (amount × likelihood); the student's funds are used last. |
| **Fastest available solution** | Only options that are confirmed or process within 5 days; the institution's emergency fund covers the rest if it can (fast-track). |

Constraints applied to every strategy:
- **Eligibility** — options whose eligibility signals the student lacks are excluded, with the reason shown.
- **Deadlines and processing time** — an option is excluded if `processing days + 1 > days left`, or if its own programme window has closed.
- **Funds and availability** — institution fund balances, grant programme budgets and lending inventory are hard caps.
- **Conflicts** — one fee reduction per expense line, explicit `conflictsWith` rules, and grants are never applied to an item that is being borrowed.
- **Confirmed assistance** — already-confirmed sources stay in every strategy with likelihood 1 and are never counted twice.
- **Likelihood** — each estimated option has a base likelihood by type (e.g. waivers and grants lower than borrowing), multiplied by 0.75 when processing time is tight against the deadline. A strategy's likelihood is the amount-weighted average of its outside sources, including sponsor funding.

The *independent* strategy is recommended unless it cannot meet the deadline and the fastest one can. Each strategy reports student pays, sponsors asked, cost reductions, days to secure, likelihood, external dependency (outside cash ÷ shortfall) and its own Impact Multiplier. Nothing is ever described as guaranteed.

### Impact Multiplier (`src/lib/impact.ts`)

```
multiplier = financial barriers resolved ÷ sponsor funding used
barriers resolved = confirmed cost reductions + institutional assistance + sponsor money (incl. shared pool)
```
Only fully funded or completed requests count. **The student's own funds are never counted.** Demo case: shortfall $110 (=$180 − $70), waiver $50, sponsor $60 → $110 ÷ $60 = **1.83x**. Requests resolved without any sponsor money have no multiplier (shown as “—”).

### Financial Deadline Rescue (`src/lib/deadline.ts`)

Estimated time to secure = sum of the remaining steps: run engine and submit (1 day), verification (2), information re-review (3), pending savings (5), sponsor funding (4), provider payment (1). Urgency: **Deadline passed**; **Critical** if the estimate exceeds the days left; **At risk** if it uses more than 60% of the days left or ≤ 7 days remain; **Watch** if ≤ 21 days; otherwise **On track**. The next action and alternatives (emergency fund, payment extension, reimbursement of a pending waiver, borrowing) are recommendations only — staff decide.

### Verification checks (`src/lib/verification.ts`)

Institutional verification (student enrolled at the verifying institution), opportunity verification, expense documentation (all required documents uploaded and none rejected), duplicate detection (another active request from the same student with the same purpose or overlapping expenses/assistance), and amount consistency (cost − personal funds − savings = requested amount). Checks only raise warnings and flags; approval with open items requires an explicit confirmation by staff.

### Needs matching (`src/lib/matching.ts`)

For each open expense: lending inventory by keyword and category, fee reductions valid for the student's country, level and eligibility, the institution's travel programme for transport, and grant programmes with budget left. Each match lists its reasons and availability. A key (`opportunity:expense:source`) can only be assigned or suggested once; resources reserve a unit, grants and transport debit their budgets, and a match attached to an open request becomes a *Confirmed* reduction.

### Sponsor Impact Planner (`src/lib/allocation.ts`)

All approaches cover needs fully in their ranked order while the budget allows, then place any leftover as partial support on the next need:
- **Most verified needs** — smallest remaining gap first.
- **Urgent deadlines** — urgency tier (≤ 7, ≤ 14, ≤ 30 days, later), then smallest remaining gap, then progress.
- **Category focus** — only the chosen category, urgency order.

### Opportunity Rescue Simulator (`src/lib/simulator.ts`)

```
shortfall          = max(cost − student funds, 0)
A · donors needed  = shortfall ÷ (1 − crowdfunding fee)
B · reductions     = min(waivers + borrowing, shortfall)
B · institutional  = min(institutional, shortfall − reductions)
B · sponsor needed = shortfall − reductions − institutional
opportunities      = floor(sponsor budget ÷ amount needed per opportunity)
```
Money saved = reductions; sponsor funds conserved = A − B. The default 5% fee is an adjustable assumption (a 2.9% + $0.30 processing fee is ~4.4% of a $20 gift). The simulator does not model campaign success rates or eligibility rates.

### Business Model Simulator (`src/lib/business.ts`)

```
MRR      = institutions × subscription + programmes × management fee
costs    = fixed opex + institutions × requests × verification cost + new institutions × CAC
break-even institutions = (opex − programme revenue) ÷ (subscription − requests × verification cost)
```
Monthly projection for 24 months: institutions grow by the scenario's growth rate minus churn (conservative 3%/2%, moderate 6%/1.5%, optimistic 10%/1%); programmes grow at half the growth rate. Break-even month is the first month with operating profit after acquisition spend. All values are hypothetical.

### Public impact metrics (`src/lib/publicImpact.ts`)

Students supported and opportunities funded count fully funded/completed requests. Waiver savings = confirmed waivers, discounts and free alternatives; borrowing savings = confirmed borrowing. Average gap reduction = mean of confirmed reductions ÷ shortfall. Average time to resolve = submission → *Fully Funded*. Participation and confirmed outcomes count only what institutions recorded.

### Funding safeguards (`src/lib/actions.ts`)

Contributions are capped at the request's remaining gap and the sponsor's balance; only verified or partially funded requests can be funded; sponsors and the shared pool cannot fund a request whose deadline has passed (the institution can, e.g. after a provider extension); pending allocations are held from the sponsor balance and released on approval or decline; completing a request creates a simulated payment to the provider (reference `SIM-…`). Tests in `tests/` cover duplicate funding, partial contributions, insufficient balances, rejected verification, expired deadlines, pledges and matching.

## BridgeEngine (seven-step analysis)

`src/lib/engine.ts` contains a deterministic rules engine. It runs against the seeded knowledge base in `src/lib/knowledge.ts` and uses no AI API. It always runs in this order and stops early once the gap is closed:

1. Fee waivers
2. Free alternatives
3. Discounts
4. Equipment borrowing, checked against the live lending inventory and reserved automatically when a plan is applied
5. Institutional assistance
6. Educational grants
7. Sponsor funding, for the remaining shortfall only

Every recommendation includes **why it was recommended, eligibility requirements, expected savings, application instructions, required documents, estimated processing time and the relevant deadline**.

**Estimated vs. confirmed.** Savings that BridgeEngine finds are labelled *Estimated* until the verifying institution approves the request. At that point they become *Confirmed*. Bars, receipts and breakdowns show the two states differently.

**No double counting.** Each source can reduce a given expense line only once. Every reduction is capped at the unpaid amount of its line and at the overall gap. Re-running BridgeEngine replaces earlier estimates rather than adding to them, and contributions can never exceed a request's remaining gap. The tests in `tests/engine.test.ts` check these rules, including the demo case: $180 total, $70 from the student, a $50 waiver, $60 requested.

## Project structure

```
src/
  app/
    (marketing)/          Landing, /why, /simulator, /impact, /business, /scale, /pilot, /signin
    (app)/                App with sidebar shell
      student/ sponsor/ institution/{urgent,matching,audit,…} settings/ activity/ notifications/ receipt/[id]/
    demo/                 Guided interactive demo (7 scenes)
    present/              Competition presentation mode (8 sections)
  components/
    ui/                   shadcn/ui components (Radix + Tailwind)
    app/                  Sidebar shell, role switcher, ⌘K search, notification center
    marketing/            Public-page sections, simulators, impact and pilot dashboards
    shared/               Stat cards, badges, breakdowns, chart tooltip, deadline risk
    student/ sponsor/ institution/ demo/
  lib/
    types.ts              Domain model
    knowledge.ts          Seeded, country-scoped waivers, alternatives and grants (fictional)
    seed.ts               15 students, 13 institutions, 3 sponsor pools, 16 requests, 13 resources
    engine.ts             BridgeEngine seven-step analysis
    optimizer.ts          BridgeEngine 2.0 strategy optimisation
    plan.ts               Builds engine/optimiser inputs from state
    impact.ts             Impact Multiplier
    deadline.ts           Financial Deadline Rescue
    verification.ts       Verification and duplicate checks
    matching.ts           Supply and demand matching
    allocation.ts         Sponsor Impact Planner
    simulator.ts          Opportunity Rescue Simulator
    business.ts           Business Model Simulator
    publicImpact.ts       Public impact metrics
    regions.ts / i18n.ts  Markets, currencies, message catalogue
    actions.ts            Pure state transitions shared by every role
    selectors.ts          Consistent derived figures
    store.tsx             React context + localStorage persistence
tests/                    Node test runner unit tests
```

## Current limitations

- **Simulated everything.** No authentication, database, payments, document storage or messaging; data lives in one browser's `localStorage`, so roles share state only within that browser. *Reset demo* also clears any pilot results recorded on `/pilot`.
- **Seeded knowledge base.** Waivers, grants and alternatives are fictional. Eligibility uses simple yes/no signals, and processing times and likelihoods are fixed assumptions, not learned from data.
- **Heuristic optimisation.** Strategies are built greedily from policy orderings; they are not proven globally optimal. Likelihoods are estimates, not probabilities validated against outcomes.
- **Display-only currencies.** Exchange rates are fixed and illustrative; amount inputs remain in USD.
- **Translation preview.** Only navigation chrome is translated (French and Spanish previews).
- **Models, not forecasts.** The simulators make simplifying assumptions (e.g. no crowdfunding success rates, constant growth/churn) and are for discussion only.
- **Fraud checks are basic.** Duplicate detection is rule-based; there is no document authenticity analysis or identity verification.

## Proposed production architecture

| Layer | Proposal |
| --- | --- |
| Frontend | This Next.js app, deployed on Vercel, with server components for public pages. |
| API | Next.js route handlers or a separate service (e.g. NestJS) exposing the same pure domain functions (`engine`, `optimizer`, `deadline`, `verification`, `matching`, `allocation`) server-side. |
| Data | PostgreSQL (e.g. Supabase or Neon) with row-level security per institution; an append-only audit table; programme catalogue tables keyed by country, level and eligibility rule. |
| Identity | Role-based auth (institution staff, sponsors, students), SSO for institutions, guardian consent for minors, MFA for staff. |
| Documents | Encrypted object storage with signed URLs, virus scanning and retention policies; documents visible only to the verifying institution. |
| Payments | Licensed payment partners per market (e.g. card processors and mobile-money aggregators) paying **providers directly**; sponsor funds held by a regulated partner, never by BridgeFund on students' behalf. |
| FX | A licensed exchange-rate feed; amounts stored with currency and settled locally. |
| Notifications | Email/SMS/WhatsApp via a provider, with deadline reminders scheduled by a job queue. |
| Analytics | Aggregated, de-identified reporting with small-number suppression; public impact page fed only by institution-confirmed data. |
| Compliance | Data-protection review per market (e.g. Kenya's Data Protection Act), safeguarding policies, and external audit of fund flows. |
| i18n | `next-intl` with locally reviewed translations. |

## Tech stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (Radix primitives) · Lucide icons · Framer Motion · Recharts · Sonner · cmdk · Geist.

## Principles
- Students never pay to request essential assistance.
- The app offers no loans, interest or predatory mechanisms.
- Money is paid directly to providers, never to students as cash.
- Sponsors see goals, amounts, deadlines and outcomes, never personal circumstances.
- No automated system approves or rejects a student; checks only advise staff.
- All simulated data is clearly labelled. The app makes no claims of real impact, testimonials, users, pilots or partnerships, and external claims link to their sources (`/why#evidence`).

The previous vintage-styled prototype is preserved on the `vintage-prototype` branch.
