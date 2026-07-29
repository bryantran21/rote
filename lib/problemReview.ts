import type { ProblemAttempt, ProblemStatus, Settings } from "./types";
import { dueDateForBox, MAX_BOX, confidenceToBox } from "./scheduler";
import { todayISO, isDue } from "./date";

// Confidence-driven review scheduling for tracked LeetCode problems. This is a
// thin adapter over the EXISTING Leitner scheduler — it reuses
// `dueDateForBox` and `Settings.boxIntervals` rather than introducing a second
// interval model. Confidence maps directly onto a box:
//
//   confidence 1–2  -> low boxes  -> short interval, stays in review queue
//   confidence 3–4  -> mid boxes  -> normal progression
//   confidence 5     -> graduates -> no due date, drops out of the queue
//
// A problem is "due" when its srsDueAt is on/before today and it hasn't
// graduated.

export const GRADUATION_CONFIDENCE = 5;

// confidenceToBox is defined in ./scheduler (shared with card grading) and
// re-exported here so this module stays the one-stop review API.
export { confidenceToBox };

/** True once the problem no longer needs scheduled review. */
export function isGraduated(confidence?: number): boolean {
  return (confidence ?? 0) >= GRADUATION_CONFIDENCE;
}

export function freshAttempt(slug: string): ProblemAttempt {
  return { slug, status: "unsolved", attempts: 0, timeSpentMin: 0 };
}

export interface RateOptions {
  timeSpentMin?: number;
  notes?: string;
  now?: string; // ISO date, injectable for tests
}

/**
 * Record a solve + confidence rating, returning the updated attempt. Pure — the
 * caller persists it. `confidence` of 5 graduates the problem (clears srsDueAt);
 * lower ratings schedule the next review via the shared box intervals.
 */
export function rateAttempt(
  prev: ProblemAttempt | undefined,
  confidence: number,
  settings: Settings,
  opts: RateOptions = {},
): ProblemAttempt {
  const base = prev ?? freshAttempt("");
  const now = opts.now ?? todayISO();
  const nowStamp = new Date().toISOString();
  const c = Math.max(1, Math.min(MAX_BOX, Math.round(confidence)));
  const graduated = isGraduated(c);

  const box = confidenceToBox(c);
  const srsInterval = settings.boxIntervals[box - 1] ?? 0;
  const srsDueAt = graduated
    ? undefined
    : dueDateForBox(box, settings.boxIntervals, now);

  // Confidence 1–2 keeps it flagged for review; 3+ counts as solved.
  const status: ProblemStatus = c <= 2 ? "needs-review" : "solved";

  return {
    slug: base.slug,
    status,
    firstSolvedAt: base.firstSolvedAt ?? nowStamp,
    lastSolvedAt: nowStamp,
    attempts: base.attempts + 1,
    timeSpentMin: base.timeSpentMin + (opts.timeSpentMin ?? 0),
    confidence: c,
    notes: opts.notes ?? base.notes,
    srsInterval,
    srsDueAt,
  };
}

/** Set status directly (e.g. the inline toggle) without a confidence rating. */
export function setAttemptStatus(
  prev: ProblemAttempt | undefined,
  slug: string,
  status: ProblemStatus,
): ProblemAttempt {
  const base = prev ?? freshAttempt(slug);
  const nowStamp = new Date().toISOString();

  if (status === "solved" && base.status !== "solved") {
    return {
      ...base,
      slug,
      status,
      firstSolvedAt: base.firstSolvedAt ?? nowStamp,
      lastSolvedAt: nowStamp,
      attempts: base.attempts + 1,
    };
  }
  if (status === "unsolved") {
    // Reset scheduling but keep history counters.
    return { ...base, slug, status, srsDueAt: undefined, srsInterval: undefined };
  }
  return { ...base, slug, status };
}

/** Is this attempt due for review today (scheduled and not graduated)? */
export function isAttemptDue(
  attempt: ProblemAttempt,
  today: string = todayISO(),
): boolean {
  if (!attempt.srsDueAt) return false;
  if (isGraduated(attempt.confidence)) return false;
  return isDue(attempt.srsDueAt, today);
}
