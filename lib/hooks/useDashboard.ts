"use client";

import { useEffect, useState } from "react";
import type { DailyLog, Settings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { store } from "@/lib/datastore";
import { computeStreak, todayStats, totalReps } from "@/lib/stats";
import { queueCounts } from "@/lib/scheduler";

export interface DashboardData {
  loading: boolean;
  settings: Settings;
  logs: DailyLog[];
  mastery: Record<string, number>;
  streak: number;
  today: ReturnType<typeof todayStats>;
  totalReps: number;
  counts: { due: number; fresh: number };
}

const EMPTY: DashboardData = {
  loading: true,
  settings: DEFAULT_SETTINGS,
  logs: [],
  mastery: {},
  streak: 0,
  today: { cardsDone: 0, correct: 0, accuracy: 0 },
  totalReps: 0,
  counts: { due: 0, fresh: 0 },
};

/** Loads everything the dashboard renders. Reloads on `nonce` change. */
export function useDashboard(nonce = 0): DashboardData {
  const [data, setData] = useState<DashboardData>(EMPTY);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ds = store();
      const [settings, logs, mastery, cards, progress] = await Promise.all([
        ds.getSettings(),
        ds.getDailyLogs(),
        ds.getTopicMastery(),
        ds.getCards(),
        ds.getAllProgress(),
      ]);
      if (!alive) return;
      setData({
        loading: false,
        settings,
        logs,
        mastery,
        streak: computeStreak(logs),
        today: todayStats(logs),
        totalReps: totalReps(logs),
        counts: queueCounts(cards, progress),
      });
    })();
    return () => {
      alive = false;
    };
  }, [nonce]);

  return data;
}
