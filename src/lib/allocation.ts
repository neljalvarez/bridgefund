/**
 * Smart Impact Allocation — transparent, deterministic suggestion of how a
 * fixed sponsor budget can be spread across verified needs.
 *
 * Ranking (in order):
 *   1. Deadline urgency tier (≤7 days, ≤14 days, ≤30 days, later)
 *   2. Smallest amount required to complete the request (more needs finished)
 *   3. Existing assistance already secured (closest to the finish line)
 * Pass 1 fully covers needs in ranked order while the budget allows.
 * Pass 2 places any leftover on the highest-ranked uncovered need.
 */

export interface AllocNeed {
  id: string;
  ref: string;
  label: string;
  amount: number; // total sponsor amount requested
  funded: number; // already secured
  deadline: string; // ISO
  category?: string;
  studentId?: string;
}

export interface AllocItem {
  needId: string;
  amount: number;
  completes: boolean;
  rank: number;
  reasons: string[];
}

export interface AllocResult {
  items: AllocItem[];
  allocated: number;
  remainingBudget: number;
  fullyCovered: number;
}

const DAY = 86_400_000;

export function daysBetween(fromISO: string | Date, toISO: string | Date) {
  const a = new Date(fromISO);
  const b = new Date(toISO);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / DAY);
}

export function urgencyTier(days: number) {
  if (days <= 7) return { tier: 3, label: "Critical" as const };
  if (days <= 14) return { tier: 2, label: "High" as const };
  if (days <= 30) return { tier: 1, label: "Moderate" as const };
  return { tier: 0, label: "Low" as const };
}

export function rankNeeds(needs: AllocNeed[], today: Date) {
  return [...needs]
    .filter((n) => n.amount - n.funded > 0)
    .map((n) => {
      const days = daysBetween(today, n.deadline);
      const remaining = Math.round((n.amount - n.funded) * 100) / 100;
      return { need: n, days, remaining, tier: urgencyTier(days).tier, progress: n.amount ? n.funded / n.amount : 0 };
    })
    .sort((a, b) => b.tier - a.tier || a.remaining - b.remaining || b.progress - a.progress || a.need.ref.localeCompare(b.need.ref));
}

export function suggestAllocation(needs: AllocNeed[], budget: number, today: Date): AllocResult {
  const ranked = rankNeeds(needs, today);
  let left = budget;
  const items: AllocItem[] = [];

  ranked.forEach((r, i) => {
    if (r.remaining <= left) {
      left = Math.round((left - r.remaining) * 100) / 100;
      const reasons = [
        r.days <= 0 ? "Deadline is today" : `Deadline in ${r.days} day${r.days === 1 ? "" : "s"} (${urgencyTier(r.days).label.toLowerCase()} urgency)`,
        `AED ${r.remaining} is exactly what completes this request`,
      ];
      if (r.need.funded > 0) reasons.push(`AED ${r.need.funded} already secured from other sponsors`);
      items.push({ needId: r.need.id, amount: r.remaining, completes: true, rank: i + 1, reasons });
    }
  });

  if (left > 0) {
    const next = ranked.find((r) => !items.some((it) => it.needId === r.need.id));
    if (next) {
      const amt = Math.round(Math.min(left, next.remaining) * 100) / 100;
      left = Math.round((left - amt) * 100) / 100;
      items.push({
        needId: next.need.id,
        amount: amt,
        completes: amt >= next.remaining,
        rank: ranked.indexOf(next) + 1,
        reasons: [
          `Highest-ranked need not yet covered (deadline in ${next.days} days)`,
          `Partial support: AED ${Math.round((next.remaining - amt) * 100) / 100} would still remain`,
        ],
      });
    }
  }

  const allocated = Math.round((budget - left) * 100) / 100;
  return { items, allocated, remainingBudget: left, fullyCovered: items.filter((i) => i.completes).length };
}

/* ------------------------------------------------------------------ */
/* Sponsor Impact Planner — the same budget under different approaches  */
/* ------------------------------------------------------------------ */

export type Approach = "most" | "urgent" | "category";

export const APPROACHES: Record<Approach, { name: string; tagline: string; tradeoff: string }> = {
  most: {
    name: "Support the most verified needs",
    tagline: "Smallest remaining gaps first, so the budget completes as many requests as possible.",
    tradeoff: "Larger or more expensive needs may wait, even when their deadlines are close.",
  },
  urgent: {
    name: "Prioritise urgent deadlines",
    tagline: "Needs closest to their deadline first, then the smallest amount that completes them.",
    tradeoff: "A single expensive urgent need can absorb a large share of the budget.",
  },
  category: {
    name: "Focus on one category",
    tagline: "Only needs in the chosen opportunity category, most urgent first.",
    tradeoff: "Needs outside the category receive nothing; part of the budget may stay unallocated.",
  },
};

export interface PlanSummary {
  approach: Approach;
  items: AllocItem[];
  allocated: number;
  unallocated: number;
  fullyCovered: number;
  partial: number;
  students: number;
  urgentCovered: number; // fully covered needs due within 7 days
  urgentLeft: number; // urgent needs left with a remaining gap
  avgDaysToDeadline: number | null;
}

export function planAllocation(needs: AllocNeed[], budget: number, today: Date, approach: Approach, category?: string): PlanSummary {
  const base = rankNeeds(needs, today);
  const pool = approach === "category" ? base.filter((r) => r.need.category === category) : base;
  const ordered =
    approach === "most"
      ? [...pool].sort((a, b) => a.remaining - b.remaining || a.days - b.days || a.need.ref.localeCompare(b.need.ref))
      : pool; // rankNeeds already orders by urgency tier, then remaining amount
  let left = Math.max(budget, 0);
  const items: AllocItem[] = [];

  ordered.forEach((r, i) => {
    if (r.remaining <= left + 1e-9) {
      left = Math.round((left - r.remaining) * 100) / 100;
      const reasons = [
        approach === "most" ? `Among the smallest remaining gaps (${aed0(r.remaining)})` : `Deadline in ${r.days} day${r.days === 1 ? "" : "s"} (${urgencyTier(r.days).label.toLowerCase()} urgency)`,
        `${aed0(r.remaining)} completes this request`,
      ];
      if (approach === "category") reasons.unshift(`Matches your focus: ${category}`);
      if (r.need.funded > 0) reasons.push(`${aed0(r.need.funded)} already secured from others`);
      items.push({ needId: r.need.id, amount: r.remaining, completes: true, rank: i + 1, reasons });
    }
  });
  if (left > 0) {
    const next = ordered.find((r) => !items.some((it) => it.needId === r.need.id));
    if (next) {
      const amt = Math.round(Math.min(left, next.remaining) * 100) / 100;
      left = Math.round((left - amt) * 100) / 100;
      items.push({ needId: next.need.id, amount: amt, completes: false, rank: ordered.indexOf(next) + 1, reasons: [`Partial support for the next need in line`, `${aed0(Math.round((next.remaining - amt) * 100) / 100)} would still remain`] });
    }
  }

  const covered = items.filter((i) => i.completes).map((i) => base.find((b) => b.need.id === i.needId)!);
  const urgent = base.filter((b) => b.days <= 7);
  return {
    approach,
    items,
    allocated: Math.round((budget - left) * 100) / 100,
    unallocated: left,
    fullyCovered: covered.length,
    partial: items.filter((i) => !i.completes).length,
    students: new Set(items.map((i) => needs.find((n) => n.id === i.needId)?.studentId ?? i.needId)).size,
    urgentCovered: covered.filter((c) => c.days <= 7).length,
    urgentLeft: urgent.filter((u) => !covered.some((c) => c.need.id === u.need.id)).length,
    avgDaysToDeadline: covered.length ? Math.round(covered.reduce((a, c) => a + c.days, 0) / covered.length) : null,
  };
}

const aed0 = (n: number) => `AED ${n.toLocaleString("en-AE", { maximumFractionDigits: 2 })}`;
