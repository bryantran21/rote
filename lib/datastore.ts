import type {
  Card,
  CardProgress,
  DailyLog,
  Settings,
  Problem,
  DailyProblemLog,
} from "./types";
import { DEFAULT_SETTINGS } from "./types";
import { CARDS } from "@/content/cards";
import { PROBLEMS } from "@/content/problems";
import { db } from "./db";
import { todayISO } from "./date";
import { computeTopicMastery } from "./mastery";

/**
 * The single seam between the app and persistence. ALL reads/writes go through
 * this interface — no component or store touches Dexie directly. Phase 2 can
 * implement this against an API without changing any UI.
 *
 * Everything is async so a network-backed implementation drops in cleanly.
 */
export interface DataStore {
  // --- static content (bundled; async for the API seam) ---
  getCards(): Promise<Card[]>;
  getCard(id: string): Promise<Card | undefined>;
  getProblems(): Promise<Problem[]>;

  // --- card progress ---
  getAllProgress(): Promise<CardProgress[]>;
  getProgress(cardId: string): Promise<CardProgress | undefined>;
  saveProgress(p: CardProgress): Promise<void>;

  // --- daily activity log ---
  getDailyLogs(): Promise<DailyLog[]>;
  getDailyLog(date: string): Promise<DailyLog | undefined>;
  recordResult(correct: boolean, date?: string): Promise<void>;

  // --- settings ---
  getSettings(): Promise<Settings>;
  saveSettings(patch: Partial<Settings>): Promise<Settings>;

  // --- derived ---
  getTopicMastery(): Promise<Record<string, number>>;

  // --- problem of the day ---
  getDailyProblem(date: string): Promise<DailyProblemLog | undefined>;
  setDailyProblem(log: DailyProblemLog): Promise<void>;
  getDailyProblemHistory(): Promise<DailyProblemLog[]>;
  /** Official daily challenge — Phase 3 seam; returns null in Phase 1. */
  getOfficialDaily(): Promise<Problem | null>;

  // --- data management ---
  resetProgress(): Promise<void>;
  exportData(): Promise<ExportBundle>;
  importData(bundle: ExportBundle): Promise<void>;
}

export interface ExportBundle {
  version: 1;
  exportedAt: string;
  settings: Settings;
  progress: CardProgress[];
  dailyLogs: DailyLog[];
  dailyProblems: DailyProblemLog[];
}

const SETTINGS_KEY = "settings";

class DexieDataStore implements DataStore {
  async getCards(): Promise<Card[]> {
    return CARDS;
  }
  async getCard(id: string): Promise<Card | undefined> {
    return CARDS.find((c) => c.id === id);
  }
  async getProblems(): Promise<Problem[]> {
    return PROBLEMS;
  }

  async getAllProgress(): Promise<CardProgress[]> {
    return db().progress.toArray();
  }
  async getProgress(cardId: string): Promise<CardProgress | undefined> {
    return db().progress.get(cardId);
  }
  async saveProgress(p: CardProgress): Promise<void> {
    await db().progress.put(p);
  }

  async getDailyLogs(): Promise<DailyLog[]> {
    return db().dailyLogs.toArray();
  }
  async getDailyLog(date: string): Promise<DailyLog | undefined> {
    return db().dailyLogs.get(date);
  }
  async recordResult(correct: boolean, date = todayISO()): Promise<void> {
    await db().transaction("rw", db().dailyLogs, async () => {
      const existing = await db().dailyLogs.get(date);
      const next: DailyLog = existing
        ? {
            date,
            cardsDone: existing.cardsDone + 1,
            correct: existing.correct + (correct ? 1 : 0),
          }
        : { date, cardsDone: 1, correct: correct ? 1 : 0 };
      await db().dailyLogs.put(next);
    });
  }

  async getSettings(): Promise<Settings> {
    const row = await db().kv.get(SETTINGS_KEY);
    const stored = (row?.value as Partial<Settings>) ?? {};
    // Merge so new setting fields added later get sane defaults.
    return { ...DEFAULT_SETTINGS, ...stored };
  }
  async saveSettings(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const next = { ...current, ...patch };
    await db().kv.put({ key: SETTINGS_KEY, value: next });
    return next;
  }

  async getTopicMastery(): Promise<Record<string, number>> {
    const progress = await this.getAllProgress();
    return computeTopicMastery(CARDS, progress);
  }

  async getDailyProblem(date: string): Promise<DailyProblemLog | undefined> {
    return db().dailyProblems.get(date);
  }
  async setDailyProblem(log: DailyProblemLog): Promise<void> {
    await db().dailyProblems.put(log);
  }
  async getDailyProblemHistory(): Promise<DailyProblemLog[]> {
    return db().dailyProblems.toArray();
  }
  async getOfficialDaily(): Promise<Problem | null> {
    // Phase 3 seam: a server route will fill this in. Off in Phase 1.
    return null;
  }

  async resetProgress(): Promise<void> {
    await db().transaction(
      "rw",
      db().progress,
      db().dailyLogs,
      db().dailyProblems,
      async () => {
        await db().progress.clear();
        await db().dailyLogs.clear();
        await db().dailyProblems.clear();
      },
    );
  }

  async exportData(): Promise<ExportBundle> {
    const [settings, progress, dailyLogs, dailyProblems] = await Promise.all([
      this.getSettings(),
      this.getAllProgress(),
      this.getDailyLogs(),
      this.getDailyProblemHistory(),
    ]);
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      progress,
      dailyLogs,
      dailyProblems,
    };
  }

  async importData(bundle: ExportBundle): Promise<void> {
    if (!bundle || bundle.version !== 1) {
      throw new Error("Unrecognized export format.");
    }
    await db().transaction(
      "rw",
      db().progress,
      db().dailyLogs,
      db().dailyProblems,
      db().kv,
      async () => {
        await db().progress.clear();
        await db().dailyLogs.clear();
        await db().dailyProblems.clear();
        await db().progress.bulkPut(bundle.progress ?? []);
        await db().dailyLogs.bulkPut(bundle.dailyLogs ?? []);
        await db().dailyProblems.bulkPut(bundle.dailyProblems ?? []);
        await db().kv.put({
          key: SETTINGS_KEY,
          value: { ...DEFAULT_SETTINGS, ...(bundle.settings ?? {}) },
        });
      },
    );
  }
}

// Singleton — swap this factory in Phase 2 for an ApiDataStore.
let _store: DataStore | null = null;
export function store(): DataStore {
  if (!_store) _store = new DexieDataStore();
  return _store;
}
