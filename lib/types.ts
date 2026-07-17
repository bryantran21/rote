// Core data model for Rote (Phase 1). Kept framework-agnostic so it can be
// shared by UI, the DataStore layer, and content modules.

export type Language = "python"; // seam for future languages

export type Topic = string; // e.g. "Arrays & Hashing" — see content/topics.ts
export type CardType = "mcq" | "fill";
export type Difficulty = 1 | 2 | 3;

export interface McqOption {
  id: string;
  text: string;
}

export interface Card {
  id: string;
  language: Language;
  topic: Topic;
  primitive: string; // e.g. "defaultdict"
  type: CardType;
  prompt: string; // the question / instruction
  code?: string; // snippet; use ___ to mark blanks for 'fill'
  answer: string; // correct fill text, or correct option id for mcq
  options?: McqOption[]; // mcq only
  explanation: string; // shown immediately after answering
  difficulty: Difficulty;
  tags: string[];
  /** Optional alternates accepted for fill grading (seam; empty for now). */
  acceptedAnswers?: string[];
}

export interface CardProgress {
  cardId: string;
  box: number; // Leitner 1..5
  dueDate: string; // ISO date (YYYY-MM-DD)
  lastSeen: string; // ISO date-time
  timesSeen: number;
  timesCorrect: number;
}

export interface DailyLog {
  date: string; // ISO date (YYYY-MM-DD)
  cardsDone: number;
  correct: number;
}

export interface Settings {
  dailyGoal: number;
  boxIntervals: number[]; // days-until-due per box, index = box-1

  // Problem-of-the-Day settings (addendum)
  problemDifficultyCeiling: "Easy" | "Medium" | "Hard";
  includePaid: boolean;
  dailyProblemMode: "personalized" | "random" | "official";
  catalogLists: string[]; // which curated lists to draw from
}

// ---- Problem of the Day (metadata only — never problem content) ----

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string; // stable id (use frontendId as string)
  frontendId: number;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  leetcodeTags: string[]; // raw LC tag slugs
  appTopics: Topic[]; // normalized to Rote taxonomy
  acRate?: number; // 0..1
  paidOnly: boolean;
  lists: string[]; // 'neetcode150' | 'blind75' | 'grind75'
  url: string;
}

export interface DailyProblemLog {
  date: string; // ISO date, one per day
  problemId: string;
  source: "personalized" | "random" | "official";
  status: "served" | "solved" | "skipped";
  reason?: string; // the "why this problem" string
}

export const DEFAULT_SETTINGS: Settings = {
  dailyGoal: 20,
  boxIntervals: [0, 1, 3, 7, 16],
  problemDifficultyCeiling: "Medium",
  includePaid: false,
  dailyProblemMode: "personalized",
  catalogLists: ["neetcode150", "blind75", "grind75"],
};
