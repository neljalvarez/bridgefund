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
        `$${r.remaining} is exactly what completes this request`,
      ];
      if (r.need.funded > 0) reasons.push(`$${r.need.funded} already secured from other sponsors`);
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
          `Partial support: $${Math.round((next.remaining - amt) * 100) / 100} would still remain`,
        ],
      });
    }
  }

  const allocated = Math.round((budget - left) * 100) / 100;
  return { items, allocated, remainingBudget: left, fullyCovered: items.filter((i) => i.completes).length };
}
