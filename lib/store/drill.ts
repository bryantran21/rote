import { create } from "zustand";
import type { Card, Settings } from "@/lib/types";
import { store } from "@/lib/datastore";
import { applyGrade, buildDailyQueue } from "@/lib/scheduler";
import { todayISO } from "@/lib/date";

type Status = "idle" | "loading" | "active" | "summary" | "empty";

interface GradeRecord {
  cardId: string;
  correct: boolean;
}

interface DrillState {
  status: Status;
  topic?: string;
  queue: Card[];
  index: number;
  results: GradeRecord[];
  promoted: number;
  settings: Settings | null;

  current: () => Card | undefined;

  start: (topic?: string) => Promise<void>;
  grade: (correct: boolean) => Promise<void>;
  next: () => void;
  restart: () => Promise<void>;
  quit: () => void;
}

export const useDrill = create<DrillState>((set, get) => ({
  status: "idle",
  topic: undefined,
  queue: [],
  index: 0,
  results: [],
  promoted: 0,
  settings: null,

  current: () => {
    const { queue, index } = get();
    return queue[index];
  },

  start: async (topic) => {
    set({ status: "loading", topic });
    const ds = store();
    const [cards, progress, settings] = await Promise.all([
      ds.getCards(),
      ds.getAllProgress(),
      ds.getSettings(),
    ]);
    const queue = buildDailyQueue(cards, progress, settings, { topic });
    set({
      settings,
      queue,
      index: 0,
      results: [],
      promoted: 0,
      status: queue.length === 0 ? "empty" : "active",
    });
  },

  grade: async (correct) => {
    const { queue, index, settings, results, promoted } = get();
    const card = queue[index];
    if (!card || !settings) return;

    const ds = store();
    const prev = await ds.getProgress(card.id);
    const outcome = applyGrade(prev, card, correct, settings, todayISO());
    await ds.saveProgress(outcome.progress);
    await ds.recordResult(correct);

    set({
      results: [...results, { cardId: card.id, correct }],
      promoted: promoted + (outcome.promoted ? 1 : 0),
    });
  },

  next: () => {
    const { index, queue } = get();
    if (index + 1 >= queue.length) {
      set({ status: "summary" });
    } else {
      set({ index: index + 1 });
    }
  },

  restart: async () => {
    await get().start(get().topic);
  },

  quit: () => set({ status: "idle", queue: [], index: 0, results: [] }),
}));
