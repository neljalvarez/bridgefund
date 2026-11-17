# BridgeFund

**Small gaps. Big futures.**

Students who qualify for an opportunity are often stopped by something small: an exam fee, a university application fee, a competition registration, a bus ticket or a calculator. BridgeFund finds those barriers and **reduces them before anyone is asked for money**. It checks fee waivers, free alternatives, discounts, equipment the student can borrow, institutional assistance and grants. Only after all of that does it connect the student with verified sponsors, and only for the amount still left.

BridgeFund is not a scholarship directory, a crowdfunding site, a budgeting app or a lender.

> ⚠️ **Competition prototype.** Every student, institution, sponsor, programme, waiver, amount and outcome in this repository is fictional demonstration data. Sign-in, verification and transactions are simulated, and no real money moves. Final eligibility for any real waiver is always decided by the organisation that offers it.

---

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
| `npm test` | Unit tests for BridgeEngine and Smart Impact Allocation (Node ≥ 22.6) |

You need Node.js 18.18 or newer; Node 22 is recommended. The app needs no API keys, database or paid services. Demo data lives in the browser's `localStorage` under `bridgefund-state`.

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import `neljalvarez/bridgefund`.
2. Keep the defaults: framework **Next.js**, build command `next build`.
3. Click **Deploy**. You don't need to set any environment variables.

Or use the CLI: `npx vercel --prod`.

## Presenting the competition demo

Click **Launch Interactive Demo** (on the landing page or in the app header), or go to `/demo`. Each scene has a real button that performs the action. **Do it for me** runs the action for you, **Next** moves on, and the ← → keys also work. The top bar has **Restart Demo**, which resets all data to the starting state, and **Exit Demo**.

| # | Scene | What to show | Talking point |
| --- | --- | --- | --- |
| 1 | Student problem | Amina, a fictional student, needs **$180** for a certification exam. She has **$70**, which leaves a **$110** gap. | The barrier is small, specific and urgent. |
| 2 | Financial analysis | Run the **Barrier Scanner**. It shows the total cost, available funds, the shortfall, urgency and expense categories. | “I can't afford it” becomes an exact number. |
| 3 | BridgeEngine | **Activate BridgeEngine.** Seven priorities animate in order and a **$50 fee waiver** cuts the gap from $110 to **$60**. Open “Why was this recommended?” and submit the request. | Costs are reduced before anyone is asked to fund. Every recommendation explains itself, and savings are marked *estimated*. |
| 4 | Verification | The institution view. **Review and verify** the request. This confirms the waiver and publishes the $60 need. | The verifier sees the private details. Sponsors never do. |
| 5 | Funding | The sponsor view. **Contribute $60** and the simulated balance goes from **$500 to $440**. | Contributions can never exceed the remaining gap. |
| 6 | Opportunity secured | Amina's view shows “**Your opportunity is now fully funded.**” with personal funds $70, fee waiver $50, sponsor $60 and a remaining gap of **$0**. | Every source adds up and nothing is counted twice. |
| 7 | Impact | The impact receipt. Optionally press **Institution confirms payment** to add the completion date. | Sponsors see exactly what their money did. |

**Suggested script (about 2 minutes):** spend about 15 seconds on each of scenes 1–2, about 30 seconds on scene 3, and about 15 seconds on each of scenes 4–7. Then use the **role switcher** in the header to show that the student, institution and sponsor dashboards all reflect what you just did.

## Features

**Three connected roles.** You can switch between Student, Sponsor and Institution at any time, and every action updates all three views. A simulated sign-in at `/signin` lets you pick a demo account. Institutions can switch between 13 fictional institutional accounts, and sponsors between three funding pools.

### Student
- **Dashboard** (`/student`). Shows active opportunities, total required expenses, available funds, remaining gap, potential and confirmed savings, assistance received, deadlines, recommended actions, recent activity and application progress. It also has a breakdown of where each opportunity's funding came from and a timeline of financial assistance.
- **Financial Barrier Scanner** (`/student/scanner`). A six-step questionnaire covering opportunity type, institution, deadline, expenses (added one by one), funds and existing assistance, and eligibility. It produces a professional barrier report with a live preview from BridgeEngine.
- **BridgeEngine** (`/student/engine`). An animated, explainable plan with a running financial breakdown (see below).
- **Assistance requests** (`/student/requests`). Each request has a purpose, exact amount, deadline, breakdown, private explanation, document placeholders and a verifying institution. Requests move through **Draft → Submitted → Under Review → Additional Information Required → Verified → Partially Funded → Fully Funded → Completed**.
- **Opportunity cost calculator** (`/student/calculator`). Compares up to three opportunities across eight cost categories and shows total cost, available assistance, out-of-pocket cost, remaining gap and an affordability chart.
- **Fee waiver finder** (`/student/waivers`). Filter by country, opportunity type, education level, eligibility, deadline and estimated savings, and save waivers. A personalised eligibility assessment labels each result *likely*, *check requirements* or *not available*, and never guarantees eligibility.
- **Resource Rescue** (`/student/resources`). Search and filter by category and location, then reserve an item and track it from Reserved to Collected to Returned. Each item shows how much borrowing saves.
- **Opportunity tracker** (`/student/tracker`). A calendar view, per-deadline reminders, documents still required, money saved and personal milestones.

### Sponsor
- **Dashboard** (`/sponsor`). Shows total contributions, expenses covered, students supported, completed requests and pending contributions. It includes Recharts charts of impact by category and contribution status, a filterable history, impact receipts and the shared opportunity pool.
- **Opportunity marketplace** (`/sponsor/marketplace`). Filter by category, financial gap, location, deadline, institution and urgency, and save needs. Each need has its own detail page at `/sponsor/marketplace/[id]`. Needs are **never ranked by popularity**.
- **Smart impact allocation** (`/sponsor/allocate`). Enter a budget and get recommendations ranked by urgency, then by the ability to fully cover an expense, then by assistance already received. Each recommendation shows its reasoning, and every amount can be edited before confirming. Institutions keep final approval.
- **Impact receipts** (`/receipt/[id]`). Show the contribution, the expense it covered, an anonymous recipient reference, verification status, completion date, a breakdown and the educational outcome. They can be printed or downloaded as HTML.

### Institution
- **Dashboard** (`/institution`). Includes the verification queue, approved assistance, available funds and shared pool, upcoming deadlines, inventory summary, distribution history and unresolved barriers. From here an institution can approve or reject a request, ask for more documentation, verify a need (which confirms the estimated savings), assign fee waivers, reserve equipment, allocate funding and confirm that assistance was completed.
- **Lending inventory** (`/institution/resources`). Add items, adjust quantities and manage active loans.
- **Barrier analytics** (`/institution/analytics`). Aggregated charts with date and category filters. Analytics never expose an individual student.

### Across the app
Global search (`⌘K` / `Ctrl+K`), a notification center for each role, deadline reminders, saved items, activity history (`/activity`), profile settings (`/settings`) and dark mode. Pages load with skeleton screens and fade in on navigation. Dialogs trap keyboard focus and there is a skip-to-content link. Layouts are responsive, and **Reset demo** is in the account menu and in settings.

## BridgeEngine

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
    (marketing)/          Landing page, /business, /signin (top navigation + footer)
    (app)/                Authenticated-style app with sidebar shell
      student/ sponsor/ institution/ settings/ activity/ notifications/ receipt/[id]/
    demo/                 Launch Interactive Demo (7 scenes)
  components/
    ui/                   shadcn/ui components (Radix + Tailwind)
    app/                  Sidebar shell, role switcher, ⌘K search, notification center
    marketing/            Landing-page sections
    shared/               Stat cards, status badges, gap breakdown, request breakdown, chart tooltip
    student/ sponsor/ institution/ demo/
  lib/
    types.ts              Domain model
    knowledge.ts          Seeded waivers, alternatives and grants (fictional)
    seed.ts               15 fictional students, 13 institutions, 3 sponsor pools, 14 requests, 13 resources
    engine.ts             BridgeEngine
    allocation.ts         Smart Impact Allocation
    actions.ts            Pure state transitions shared by every role
    selectors.ts          Consistent derived figures (one breakdown used everywhere)
    store.tsx             React context + localStorage persistence
tests/                    Node test runner unit tests
```

## Tech stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui (Radix primitives) · Lucide icons · Framer Motion · Recharts · Sonner · cmdk · Geist.

## Principles
- Students never pay to request essential assistance.
- The app offers no loans, interest or predatory mechanisms.
- Money is paid directly to providers, never to students as cash.
- Sponsors see goals, amounts, deadlines and outcomes, never personal circumstances.
- All simulated data is clearly labelled. The app makes no claims of real impact, testimonials or partnerships.

The previous vintage-styled prototype is preserved on the `vintage-prototype` branch.
