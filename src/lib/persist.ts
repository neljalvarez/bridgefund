import type { AppState } from "./types";
import { STATE_VERSION } from "./seed";

export const STORAGE_KEY = "bridgefund-state";

const ARRAYS = ["sponsors", "students", "institutions", "opportunities", "requests", "resources", "reservations", "contributions", "distribution", "notifications", "activity", "feedback"] as const;

/** Accepts saved data only if it is this schema version and structurally sound; otherwise null (start fresh). */
export function parseState(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as AppState;
    if (!s || typeof s !== "object" || s.version !== STATE_VERSION) return null;
    if (!ARRAYS.every((k) => Array.isArray((s as unknown as Record<string, unknown>)[k]))) return null;
    if (!s.display || !s.pilot || !s.demo || typeof s.pool !== "number") return null;
    if (!s.students.some((x) => x.id === s.currentStudentId) || !s.sponsors.some((x) => x.id === s.currentSponsorId)) return null;
    return s;
  } catch {
    return null;
  }
}
