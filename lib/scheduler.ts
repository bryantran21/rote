import type { Card, CardProgress, DrillFormat, Settings } from "./types";
import { todayISO, addDays, isDue } from "./date";

// Leitner spaced repetition, 5 boxes.
//   Correct -> box + 1 (cap 5).   Wrong -> back to box 1.
// Box -> days-until-due is Settings.boxIntervals (default [0,1,3,7,16]).

export const MAX_BOX = 5;

export function nextBox(currentBox: number, correct: boolean): number {
  if (!correct) return 1;
  return Math.min(currentBox + 1, MAX_BOX);
}

/** Clamp a 1–5 confidence rating into a valid Leitner box. Shared by the
 * syntax-card grade loop and the problem review scheduler. */
export function confidenceToBox(confidence: number): number {
  return Math.max(1, Math.min(MAX_BOX, Math.round(confidence)));
}

export function dueDateForBox(
  box: number,
  intervals: number[],
  from: string = todayISO(),
): string {
  const days = intervals[box - 1] ?? intervals[intervals.length - 1] ?? 0;
  return addDays(from, days);
}

/** Fresh progress for a card the user has never seen. */
export function newProgress(cardId: string): CardProgress {
  return {
    cardId,
    box: 1,
    dueDate: todayISO(),
    lastSeen: "",
    timesSeen: 0,
    timesCorrect: 0,
  };
}

export interface GradeOutcome {
  progress: CardProgress;
  promoted: boolean; // moved to a higher box
  fromBox: number;
  toBox: number;
}

/**
 * Apply a grade to a card's progress, returning the updated record plus whether
 * it was promoted (for the session summary). Pure — the caller persists it.
 */
export function applyGrade(
  prev: CardProgress | undefined,
  card: Card,
  correct: boolean,
  settings: Settings,
  now: string = todayISO(),
  confidence?: number,
): GradeOutcome {
  const base = prev ?? newProgress(card.id);
  // Wrong -> box 1. Correct with a confidence rating -> that box (reuses the
  // shared confidence→box map). Correct without a rating -> classic box + 1.
  const toBox = !correct
    ? 1
    : confidence != null
      ? confidenceToBox(confidence)
      : nextBox(base.box, true);
  return {
    progress: {
      cardId: card.id,
      box: toBox,
      dueDate: dueDateForBox(toBox, settings.boxIntervals, now),
      lastSeen: new Date().toISOString(),
      timesSeen: base.timesSeen + 1,
      timesCorrect: base.timesCorrect + (correct ? 1 : 0),
    },
    promoted: toBox > base.box,
    fromBox: base.box,
    toBox,
  };
}

export interface QueueOptions {
  /** Restrict to a single topic (per-topic drilling). */
  topic?: string;
  /** Restrict to one card format. 'mixed' (or undefined) includes both. */
  format?: DrillFormat;
  /**
   * Session length cap. When set, the queue is capped at this many cards total
   * (due first). When omitted, falls back to Settings.dailyGoal for new cards
   * (the classic daily flow).
   */
  limit?: number;
  today?: string;
}

/**
 * Build the day's queue: all DUE cards first (earliest due first, then lower
 * box first), then NEW (never-seen) cards. With `limit` set, the whole queue is
 * capped at that many cards; otherwise new cards fill up to the daily goal and
 * due cards are never dropped.
 */
export function buildDailyQueue(
  cards: Card[],
  progress: CardProgress[],
  settings: Settings,
  opts: QueueOptions = {},
): Card[] {
  const today = opts.today ?? todayISO();
  let pool = opts.topic ? cards.filter((c) => c.topic === opts.topic) : cards;
  if (opts.format && opts.format !== "mixed") {
    pool = pool.filter((c) => c.type === opts.format);
  }
  const progressById = new Map(progress.map((p) => [p.cardId, p]));

  const due: { card: Card; p: CardProgress }[] = [];
  const fresh: Card[] = [];

  for (const card of pool) {
    const p = progressById.get(card.id);
    if (!p) {
      fresh.push(card);
    } else if (isDue(p.dueDate, today)) {
      due.push({ card, p });
    }
  }

  due.sort((a, b) => {
    if (a.p.dueDate !== b.p.dueDate)
      return a.p.dueDate < b.p.dueDate ? -1 : 1;
    return a.p.box - b.p.box;
  });

  const dueCards = due.map((d) => d.card);

  if (opts.limit != null) {
    const remaining = Math.max(0, opts.limit - dueCards.length);
    return [...dueCards, ...fresh.slice(0, remaining)].slice(0, opts.limit);
  }
  const remaining = Math.max(0, settings.dailyGoal - dueCards.length);
  return [...dueCards, ...fresh.slice(0, remaining)];
}

/** How many due/new cards exist right now (for dashboard + CTA copy). */
export function queueCounts(
  cards: Card[],
  progress: CardProgress[],
  today: string = todayISO(),
): { due: number; fresh: number } {
  const progressById = new Map(progress.map((p) => [p.cardId, p]));
  let due = 0;
  let fresh = 0;
  for (const card of cards) {
    const p = progressById.get(card.id);
    if (!p) fresh++;
    else if (isDue(p.dueDate, today)) due++;
  }
  return { due, fresh };
}
