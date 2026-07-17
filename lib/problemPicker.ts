import type {
  Problem,
  ProblemDifficulty,
  DailyProblemLog,
  Settings,
  Topic,
} from "./types";
import { daysBetween } from "./date";

// Weak-topic-weighted daily problem picker (Part B). Pure and deterministic:
// seeded by the ISO date so the choice is STABLE across reloads within a day
// and rolls over the next day.

const DIFF_RANK: Record<ProblemDifficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export const DEFAULT_COOLDOWN_DAYS = 30;

// --- seeded RNG (mulberry32 over a hashed string) ---
function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// weight(topic) = 0.1 + 0.9 * (1 - mastery). Floor keeps every topic possible.
export function topicWeight(mastery: number): number {
  const weakness = 1 - clamp01(mastery);
  return 0.1 + 0.9 * weakness;
}

function sampleTopic(
  mastery: Record<string, number>,
  topics: Topic[],
  rng: () => number,
): Topic {
  const weights = topics.map((t) => topicWeight(mastery[t] ?? 0.5));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < topics.length; i++) {
    r -= weights[i];
    if (r <= 0) return topics[i];
  }
  return topics[topics.length - 1];
}

export interface PickInput {
  problems: Problem[];
  mastery: Record<string, number>;
  history: DailyProblemLog[];
  settings: Settings;
  date: string; // ISO date
  mode?: "personalized" | "random";
  cooldownDays?: number;
}

export interface PickResult {
  problem: Problem;
  reason: string;
  source: "personalized" | "random";
  topic?: Topic;
}

export function pickProblem(input: PickInput): PickResult | null {
  const {
    problems,
    mastery,
    history,
    settings,
    date,
    mode = settings.dailyProblemMode === "random" ? "random" : "personalized",
    cooldownDays = DEFAULT_COOLDOWN_DAYS,
  } = input;

  if (problems.length === 0) return null;

  const rng = mulberry32(hashString(date));

  // Exclusion sets.
  const solved = new Set(
    history.filter((h) => h.status === "solved").map((h) => h.problemId),
  );
  const recent = new Set(
    history
      .filter((h) => Math.abs(daysBetween(h.date, date)) < cooldownDays)
      .map((h) => h.problemId),
  );
  const servedEver = new Set(history.map((h) => h.problemId));

  const ceilingRank = DIFF_RANK[settings.problemDifficultyCeiling];
  const lists = settings.catalogLists ?? [];

  const eligible = (
    p: Problem,
    { topic, allowSolved, maxRank, ignoreRecent }: {
      topic?: Topic;
      allowSolved: boolean;
      maxRank: number;
      ignoreRecent?: boolean;
    },
  ): boolean => {
    if (topic && !p.appTopics.includes(topic)) return false;
    if (DIFF_RANK[p.difficulty] > maxRank) return false;
    if (p.paidOnly && !settings.includePaid) return false;
    if (lists.length > 0 && !p.lists.some((l) => lists.includes(l))) return false;
    if (!allowSolved && solved.has(p.id)) return false;
    if (!ignoreRecent && recent.has(p.id)) return false;
    return true;
  };

  const choose = (pool: Problem[], preferRank: number): Problem | null => {
    if (pool.length === 0) return null;
    // Shuffle for deterministic-but-varied tie-breaking, then rank by
    // preference: exact target difficulty, then unseen, then higher acRate.
    const shuffled = seededShuffle(pool, rng);
    shuffled.sort((a, b) => {
      const aExact = DIFF_RANK[a.difficulty] === preferRank ? 0 : 1;
      const bExact = DIFF_RANK[b.difficulty] === preferRank ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      const aSeen = servedEver.has(a.id) ? 1 : 0;
      const bSeen = servedEver.has(b.id) ? 1 : 0;
      if (aSeen !== bSeen) return aSeen - bSeen;
      return (b.acRate ?? 0.5) - (a.acRate ?? 0.5);
    });
    return shuffled[0];
  };

  // ---- Random mode: uniform over the eligible pool ----
  if (mode === "random") {
    const relaxations = [
      { allowSolved: false, maxRank: ceilingRank, ignoreRecent: false },
      { allowSolved: true, maxRank: ceilingRank, ignoreRecent: false },
      { allowSolved: true, maxRank: 3, ignoreRecent: false },
      { allowSolved: true, maxRank: 3, ignoreRecent: true },
    ];
    for (const r of relaxations) {
      const pool = problems.filter((p) => eligible(p, r));
      if (pool.length > 0) {
        const problem = seededShuffle(pool, rng)[0];
        return { problem, reason: "Random pick from your catalog.", source: "random" };
      }
    }
    return null;
  }

  // ---- Personalized mode ----
  const topics = [...new Set(problems.flatMap((p) => p.appTopics))];
  const topic = sampleTopic(mastery, topics, rng);

  // Try, relaxing filters in the spec's order.
  const attempts: {
    topic?: Topic;
    allowSolved: boolean;
    maxRank: number;
    ignoreRecent?: boolean;
  }[] = [
    { topic, allowSolved: false, maxRank: ceilingRank },
    { topic, allowSolved: true, maxRank: ceilingRank }, // drop "not solved"
    { topic, allowSolved: true, maxRank: 3 }, // widen difficulty
    { allowSolved: true, maxRank: 3 }, // any topic
    { allowSolved: true, maxRank: 3, ignoreRecent: true }, // last resort
  ];

  for (const a of attempts) {
    const pool = problems.filter((p) => eligible(p, a));
    const problem = choose(pool, ceilingRank);
    if (problem) {
      return {
        problem,
        reason: reasonFor(a.topic ?? topic, mastery),
        source: "personalized",
        topic: a.topic ?? topic,
      };
    }
  }

  return null;
}

function reasonFor(topic: Topic, mastery: Record<string, number>): string {
  const m = mastery[topic] ?? 0.5;
  const pct = Math.round(m * 100);
  if (m < 0.5) {
    return `Picked because your ${topic} accuracy is low (${pct}% mastery).`;
  }
  return `Picked to keep your ${topic} sharp (${pct}% mastery).`;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
