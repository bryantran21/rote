import { create } from "zustand";
import type { Card, DrillFormat, Settings } from "@/lib/types";
import { store } from "@/lib/datastore";
import { applyGrade, buildDailyQueue } from "@/lib/scheduler";
import { todayISO } from "@/lib/date";

type Status = "idle" | "loading" | "active" | "summary" | "empty";

interface GradeRecord {
  cardId: string;
  correct: boolean;
}

export interface SessionOptions {
  topic?: string;
  format?: DrillFormat; // defaults to settings.drillFormat
  length?: number; // max cards; undefined = all
  hardMode?: boolean; // defaults to settings.drillHardMode
}

interface DrillState {
  status: Status;
  // Active session config (kept for restart + the card to read hardMode).
  topic?: string;
  format: DrillFormat;
  length?: number;
  hardMode: boolean;

  queue: Card[];
  index: number;
  results: GradeRecord[];
  promoted: number;
  settings: Settings | null;

  current: () => Card | undefined;

  start: (opts?: SessionOptions) => Promise<void>;
  grade: (correct: boolean, confidence?: number) => Promise<void>;
  next: () => void;
  restart: () => Promise<void>;
  quit: () => void;
}

export const useDrill = create<DrillState>((set, get) => ({
  status: "idle",
  topic: undefined,
  format: "mixed",
  length: undefined,
  hardMode: false,

  queue: [],
  index: 0,
  results: [],
  promoted: 0,
  settings: null,

  current: () => {
    const { queue, index } = get();
    return queue[index];
  },

  start: async (opts = {}) => {
    set({ status: "loading" });
    const ds = store();
    const [cards, progress, settings] = await Promise.all([
      ds.getCards(),
      ds.getAllProgress(),
      ds.getSettings(),
    ]);

    const format = opts.format ?? settings.drillFormat;
    const hardMode = opts.hardMode ?? settings.drillHardMode;

    // Remember the chosen format + hard mode as the next session's defaults.
    if (
      format !== settings.drillFormat ||
      hardMode !== settings.drillHardMode
    ) {
      await ds.saveSettings({ drillFormat: format, drillHardMode: hardMode });
    }

    const queue = buildDailyQueue(cards, progress, settings, {
      topic: opts.topic,
      format,
      limit: opts.length,
    });

    set({
      settings,
      topic: opts.topic,
      format,
      length: opts.length,
      hardMode,
      queue,
      index: 0,
      results: [],
      promoted: 0,
      status: queue.length === 0 ? "empty" : "active",
    });
  },

  grade: async (correct, confidence) => {
    const { queue, index, settings, results, promoted } = get();
    const card = queue[index];
    if (!card || !settings) return;

    const ds = store();
    const prev = await ds.getProgress(card.id);
    const outcome = applyGrade(
      prev,
      card,
      correct,
      settings,
      todayISO(),
      confidence,
    );
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
    const { topic, format, length, hardMode } = get();
    await get().start({ topic, format, length, hardMode });
  },

  quit: () => set({ status: "idle", queue: [], index: 0, results: [] }),
}));
