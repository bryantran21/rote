import type { DailyLog } from "./types";
import { todayISO, addDays } from "./date";

/**
 * Current streak = consecutive days with activity ending today. If today has no
 * activity yet, the streak is measured from yesterday so it doesn't read as
 * broken before the day's first rep.
 */
export function computeStreak(
  logs: DailyLog[],
  today: string = todayISO(),
): number {
  const active = new Set(
    logs.filter((l) => l.cardsDone > 0).map((l) => l.date),
  );
  if (active.size === 0) return 0;

  let cursor = active.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (active.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive active days across all history. */
export function longestStreak(logs: DailyLog[]): number {
  const dates = logs
    .filter((l) => l.cardsDone > 0)
    .map((l) => l.date)
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of dates) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export interface TodayStats {
  cardsDone: number;
  correct: number;
  accuracy: number; // 0..1
}

export function todayStats(
  logs: DailyLog[],
  today: string = todayISO(),
): TodayStats {
  const log = logs.find((l) => l.date === today);
  const cardsDone = log?.cardsDone ?? 0;
  const correct = log?.correct ?? 0;
  return {
    cardsDone,
    correct,
    accuracy: cardsDone ? correct / cardsDone : 0,
  };
}

export function totalReps(logs: DailyLog[]): number {
  return logs.reduce((a, l) => a + l.cardsDone, 0);
}
