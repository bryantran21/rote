import Dexie, { type Table } from "dexie";
import type {
  CardProgress,
  DailyLog,
  DailyProblemLog,
  ProblemAttempt,
} from "./types";

// A tiny key/value row wrapper for singletons (settings).
interface KV {
  key: string;
  value: unknown;
}

/**
 * The ONLY module that talks to IndexedDB directly. Everything else goes
 * through the DataStore layer (lib/datastore.ts), which owns this instance.
 * Static content (cards, problems) is NOT stored here — it ships in the bundle.
 */
export class RoteDB extends Dexie {
  progress!: Table<CardProgress, string>; // keyed by cardId
  dailyLogs!: Table<DailyLog, string>; // keyed by date
  dailyProblems!: Table<DailyProblemLog, string>; // keyed by date
  problemAttempts!: Table<ProblemAttempt, string>; // keyed by slug
  kv!: Table<KV, string>; // singletons: settings

  constructor() {
    super("rote");
    this.version(1).stores({
      progress: "cardId, box, dueDate",
      dailyLogs: "date",
      dailyProblems: "date, problemId, status",
      kv: "key",
    });
    // v2: add problem-list tracking. Only ADDS a table — the v1 stores are
    // untouched, so existing syntax-card progress/logs/settings survive the
    // upgrade with no data transform needed.
    this.version(2).stores({
      problemAttempts: "slug, status, srsDueAt",
    });
  }
}

// Guard against constructing Dexie during SSR (no indexedDB on the server).
let _db: RoteDB | null = null;
export function db(): RoteDB {
  if (typeof window === "undefined") {
    throw new Error("RoteDB accessed on the server — call from the client only.");
  }
  if (!_db) _db = new RoteDB();
  return _db;
}
