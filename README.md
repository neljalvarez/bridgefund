# BridgeFund

**Small gaps. Big futures.**

BridgeFund helps financially disadvantaged students get past the *small* financial barriers that stand between them and life-changing educational opportunities: exam fees, application fees, competition registration, equipment, textbooks, transport to interviews, internship travel, certification fees and internet access.

It is **not** a scholarship directory, a budgeting app, a lender or a generic crowdfunding site. BridgeFund identifies the exact barrier, then finds the cheapest combination of solutions to remove it. It looks for waivers, free alternatives, discounts, borrowable equipment and grants first, and asks sponsors **only for what is left**.

> ⚠️ **Competition prototype.** Every student, institution, sponsor, programme, waiver, amount and outcome in this repository is fictional demonstration data. Payments, verification and authentication are simulated, and no real money moves. Final eligibility for any real waiver must be confirmed by the institution that offers it.

---

## Quick start

```bash
git clone https://github.com/neljalvarez/bridgefund.git
cd bridgefund
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Production build (all routes prerender) |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests for BridgeEngine and Smart Allocation (Node ≥ 22.6, uses built-in type stripping) |

Requirements: Node.js 18.18+ (Node 22 recommended). It needs no API keys, no database and no paid services.

## Deploy to Vercel

1. Push this repository to GitHub (already done if you're reading this there).
2. In Vercel choose **Add New → Project**, import `neljalvarez/bridgefund`.
3. Keep the defaults: framework **Next.js**, build command `next build`, output auto-detected.
4. Click **Deploy**. You don't need to set any environment variables.

Or from the CLI: `npx vercel --prod`.

## Judge demo: the 2-minute walkthrough

Open **Judge demo** in the top bar (or go to `/demo`). Each stage has a button that lets the judge perform the action. **Do it for me** performs it automatically, **Next** advances, and the ← → arrow keys also work.

| Stage | What happens | Role shown |
| --- | --- | --- |
| 1. Meet the student | Amina (fictional) has earned a seat on a $180 certification exam. She has saved $70. | Student |
| 2. Identify the barrier | The Financial Barrier Scanner calculates the **$110** shortfall, the urgency and the line items. | Student |
| 3. Activate BridgeEngine | Six priorities are checked in order. A **$50** fee waiver is found and the gap falls to **$60**. The reduced request is submitted. | Student |
| 4. Institutional verification | Amina's school reviews the private details and approves the request. | Institution |
| 5. Sponsor assistance | The sponsor contributes $60 from a $500 simulated pool. The balance animates to **$440**. | Sponsor |
| 6. Opportunity unlocked | The last planks of the bridge drop in, the student walks across, and the gap shows **$0**. | Student |
| 7. Demonstrate impact | The impact receipt shows $180 = $70 student + $50 waiver + $60 sponsor. | Sponsor |

**Restart** resets all demo data, and **Exit demo** returns to the landing page. Every demo action also updates the real student, sponsor and institution dashboards, so judges can leave the walkthrough at any point and explore.

A **Reset demo** button (↺) in the top bar restores everything to its starting state at any time.

## What's inside

### Three roles, switchable instantly
Use the role switcher in the top bar. No accounts are needed.

- **Student**: Amina, Grade 12, Northfield Community School (fictional)
- **Sponsor**: Juniper Demo Fund, with a $500 simulated balance
- **Institution**: Verification desk for a network of 13 fictional partner institutions

### Student
- **Quest journal** (`/student`): active opportunities, total barriers, amount covered, remaining gap, deadlines, recommended assistance, application status and goal milestones. An animated pixel bridge is the main progress visual, and each plank's colour shows where that part of the money came from.
- **Financial Barrier Scanner** (`/student/scanner`): six-question wizard with dynamic add/remove expenses that produces a barrier report (total, available, gap, urgency, breakdown).
- **Opportunity Cost Calculator** (`/student/calculator`): compare up to four opportunities across eight cost categories. It separates confirmed and estimated costs, shows the gap after BridgeEngine, picks the "most accessible" option and exports to CSV.
- **BridgeEngine** (`/student/engine`): the flagship feature (see below). The plan runs as a step-by-step animation with a "Why was this recommended?" explanation for every match.
- **Fee Waiver Finder** (`/student/waivers`): search, filters by country, category and type, an eligibility questionnaire, saved waivers, documents and how-to-apply steps.
- **Resource Rescue** (`/student/resources`): reserve calculators, laptops, lab kits, textbooks and other items. Shows availability, a waitlist and the money saved.
- **Emergency funding requests** (`/student/requests`): purpose, exact amount, deadline, expense breakdown, a private reason, document placeholders and a verification method. Requests move through Draft → Submitted → Under Review → Verified → Partially Funded → Fully Funded → Completed.
- **Deadline calendar** (`/student/calendar`): opportunity, funding, saved-waiver and pickup deadlines.
- **Opportunity Passport** (`/student/passport`): pixel-art achievement stamps for educational progress, never for hardship or the amount of money received.

### Sponsor
- **Verified needs marketplace** (`/sponsor`): filter by category, country, remaining gap, deadline, urgency and institution. Contribute to a specific need or to the shared pool. The marketplace has no popularity rankings.
- **Smart Impact Allocation** (`/sponsor/allocate`): transparent suggestions ranked by urgency, then the amount needed to complete a request, then existing assistance. Every line can be edited before confirming.
- **My impact** (`/sponsor/contributions`) and **impact receipts** (`/receipt/[id]`). Receipts can be printed or downloaded as standalone HTML.

### Institution
- **Verification desk** (`/institution`): verification queue, approve, decline, request information, assign fee waivers, reserve resources, allocate the institution fund or shared pool, confirm completed assistance, resource inventory and distribution history.
- **Financial Barrier Heatmap** (`/institution/heatmap`): aggregated analytics only. It covers an expense-type × country heat grid, most frequent categories, average gap before and after BridgeEngine, upcoming deadlines, where assistance came from, unresolved requests and opportunities supported.

### Everywhere
Interactive onboarding, functional notifications for each role, global search (`⌘K` / `Ctrl+K` or `/`), filters and sorting, dark mode, optional 8-bit sound effects (off by default and generated with WebAudio, so no audio files are needed), loading and empty states, keyboard navigation with a skip link and focus-trapped dialogs, a responsive mobile menu, and inline form validation.

## BridgeEngine: how recommendations are made

`src/lib/engine.ts` is a **deterministic** rules engine that works against the seeded knowledge base in `src/lib/knowledge.ts`. No AI API is involved. It always runs in this order and stops once the gap reaches $0:

1. **Fee waivers**: match by opportunity category, expense type, country and eligibility profile
2. **Free alternatives**: keyword match on expense labels (e.g. "transcript" → free digital transcript)
3. **Discounts and institutional assistance**
4. **Equipment borrowing**: matched against the live resource inventory, and reserved automatically when the plan is applied
5. **Grants**: capped by each grant's maximum
6. **Sponsor funding**: only for the remainder

Every finding carries human-readable reasons. Reductions are capped at both the expense amount and the remaining gap, so a plan never over-reduces.

`src/lib/allocation.ts` implements Smart Impact Allocation. Both modules are pure functions covered by `tests/engine.test.ts`.

## Privacy and dignity by design
- Sponsors see the educational goal, the verified amount, the deadline and the potential outcome. **They never see** the reason, documents or household circumstances.
- Funds are paid by the verifying institution **directly to the provider**. Students never receive cash.
- Analytics are aggregated, and the heatmap shows counts rather than individual records.
- Students are never charged, and the platform has no loans, interest or hidden fees.

## Project structure

```
src/
  app/                      Next.js App Router pages
    page.tsx                Landing page
    demo/                   Judge demo mode
    student/…               Student role pages
    sponsor/…               Sponsor role pages
    institution/…           Institution role pages
    receipt/[id]/           Printable impact receipt
    business/               Business model
  components/
    layout/                 Top bar, role switcher, search, notifications, onboarding
    pixel/                  Pixel sprites and the animated bridge
    landing/  student/  sponsor/  institution/  demo/
    ui/                     Window panels, buttons, stats, charts, modal, toasts
  lib/
    types.ts                Domain model
    knowledge.ts            Seeded waivers, alternatives, grants (fictional)
    seed.ts                 Fictional students, institutions, requests, resources
    engine.ts               BridgeEngine
    allocation.ts           Smart Impact Allocation
    actions.ts              Pure state transitions shared by every role
    selectors.ts            Derived data (progress, verified needs…)
    store.tsx               React context + localStorage persistence
tests/                      Node test runner unit tests
```

State persists in `localStorage` under `bridgefund-demo-state`. Deadlines are generated relative to the day the demo is seeded, so the walkthrough always has upcoming dates.

## Tech
Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lucide icons · Geist Sans/Mono · Jersey 10 pixel font (SIL Open Font License, self-hosted in `public/fonts`).

## Design language
The design is a vintage handheld and retro-OS look combined with an editorial fintech layout. It uses warm parchment `#F5F0E1`, forest green `#294C3D`, muted gold `#D8AA55`, terracotta `#C97052`, dark ink `#232824` and soft sage `#BCC9B6`, with thin dark borders, offset shadows, window panels, chunky progress bars and pixel sprites drawn as SVG.
