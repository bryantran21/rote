import type { Card, CardProgress } from "./types";
import { TOPIC_NAMES } from "@/content/topics";

// Mastery derivation, shared by the dashboard bars and the problem picker.
//
// mastery(topic) = average over that topic's cards of (box - 1) / 4, clamped to
// [0,1]. Unseen cards count as box 1 (mastery 0). Topics with no cards default
// to 0.5 (neutral) so the weighted picker still gives them a chance.

export function computeTopicMastery(
  cards: Card[],
  progress: CardProgress[],
): Record<string, number> {
  const boxByCard = new Map(progress.map((p) => [p.cardId, p.box]));
  const out: Record<string, number> = {};
  for (const topic of TOPIC_NAMES) {
    const topicCards = cards.filter((c) => c.topic === topic);
    if (topicCards.length === 0) {
      out[topic] = 0.5;
      continue;
    }
    const sum = topicCards.reduce((acc, c) => {
      const box = boxByCard.get(c.id) ?? 1;
      return acc + (box - 1) / 4;
    }, 0);
    out[topic] = clamp01(sum / topicCards.length);
  }
  return out;
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
