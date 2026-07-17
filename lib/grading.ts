import type { Card } from "./types";

/**
 * Fill-in grading (Phase 1, no AI). Normalize both sides: trim and collapse
 * internal whitespace. Comparison is case-sensitive by default (Python is
 * case-sensitive). `acceptedAnswers` is honored as an alternates list.
 *
 * This is intentionally a pure function so Phase 2's AI semantic grader can
 * slot in behind the same signature.
 */
export function normalizeAnswer(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

export function gradeFill(card: Card, input: string): boolean {
  const got = normalizeAnswer(input);
  const candidates = [card.answer, ...(card.acceptedAnswers ?? [])];
  return candidates.some((c) => normalizeAnswer(c) === got);
}

export function gradeMcq(card: Card, optionId: string): boolean {
  return card.answer === optionId;
}

export function gradeCard(card: Card, response: string): boolean {
  return card.type === "mcq"
    ? gradeMcq(card, response)
    : gradeFill(card, response);
}
