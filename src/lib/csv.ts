/** Minimal CSV export (RFC 4180 quoting) — runs in the browser only. */
export function toCsv(rows: (string | number | null | undefined)[][]) {
  return rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  // BOM so Excel opens Arabic text correctly
  const url = URL.createObjectURL(new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

import type { AppState } from "./types";

/** Anonymised feedback: role, rating, page, comment, date — never names. */
export const feedbackRows = (s: AppState) => [["Date", "Role", "Rating (1-5)", "Page", "Comment"], ...s.feedback.map((f) => [f.at.slice(0, 10), f.role, f.rating, f.page, f.comment])];

export const pilotRows = (s: AppState) => [
  ["Metric", "Value"],
  ["Partner institutions", s.pilot.schools],
  ["Students onboarded", s.pilot.students],
  ["Requests verified", s.pilot.requests],
  ["Barriers resolved", s.pilot.resolved],
  ["Students who took part", s.pilot.participated],
  ["Average days to resolve", s.pilot.avgDaysToResolve ?? ""],
  ["Feedback responses", s.feedback.length],
  ["Average feedback rating", s.feedback.length ? (s.feedback.reduce((a, f) => a + f.rating, 0) / s.feedback.length).toFixed(2) : ""],
  ["Notes", s.pilot.notes],
  ["Last updated", s.pilot.updatedAt ?? "Not started"],
];
