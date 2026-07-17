"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Problem,
  DailyProblemLog,
  ProblemDifficulty,
} from "@/lib/types";
import { store } from "@/lib/datastore";
import { pickProblem } from "@/lib/problemPicker";
import { todayISO } from "@/lib/date";

export interface DailyProblemState {
  loading: boolean;
  problem: Problem | null;
  log: DailyProblemLog | null;
  history: { log: DailyProblemLog; problem: Problem | null }[];
  markSolved: () => Promise<void>;
  skip: () => Promise<void>;
  tooHard: () => Promise<void>;
}

const LOWER: Record<ProblemDifficulty, ProblemDifficulty> = {
  Hard: "Medium",
  Medium: "Easy",
  Easy: "Easy",
};

export function useDailyProblem(): DailyProblemState {
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [log, setLog] = useState<DailyProblemLog | null>(null);
  const [history, setHistory] = useState<
    { log: DailyProblemLog; problem: Problem | null }[]
  >([]);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ds = store();
      const today = todayISO();
      const [problems, settings, mastery, allHistory] = await Promise.all([
        ds.getProblems(),
        ds.getSettings(),
        ds.getTopicMastery(),
        ds.getDailyProblemHistory(),
      ]);
      const byId = new Map(problems.map((p) => [p.id, p]));

      let todayLog = await ds.getDailyProblem(today);

      if (!todayLog) {
        // Official mode: try the (Phase-3) route, else fall back to personalized.
        let picked = null as ReturnType<typeof pickProblem>;
        let source: DailyProblemLog["source"] = "personalized";

        if (settings.dailyProblemMode === "official") {
          const official = await ds.getOfficialDaily();
          if (official) {
            todayLog = {
              date: today,
              problemId: official.id,
              source: "official",
              status: "served",
              reason: "Today's official LeetCode daily challenge.",
            };
          }
        }

        if (!todayLog) {
          picked = pickProblem({
            problems,
            mastery,
            history: allHistory,
            settings,
            date: today,
            mode: settings.dailyProblemMode === "random" ? "random" : "personalized",
          });
          if (picked) {
            source = picked.source;
            todayLog = {
              date: today,
              problemId: picked.problem.id,
              source,
              status: "served",
              reason: picked.reason,
            };
          }
        }

        if (todayLog) await ds.setDailyProblem(todayLog);
      }

      if (!alive) return;

      const refreshedHistory = await ds.getDailyProblemHistory();
      setLog(todayLog ?? null);
      setProblem(todayLog ? (byId.get(todayLog.problemId) ?? null) : null);
      setHistory(
        refreshedHistory
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map((h) => ({ log: h, problem: byId.get(h.problemId) ?? null })),
      );
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [nonce]);

  const updateStatus = useCallback(
    async (status: DailyProblemLog["status"]) => {
      if (!log) return;
      const next = { ...log, status };
      await store().setDailyProblem(next);
      setLog(next);
      setNonce((n) => n + 1);
    },
    [log],
  );

  const markSolved = useCallback(() => updateStatus("solved"), [updateStatus]);
  const skip = useCallback(() => updateStatus("skipped"), [updateStatus]);

  const tooHard = useCallback(async () => {
    if (!log) return;
    const settings = await store().getSettings();
    await store().saveSettings({
      problemDifficultyCeiling: LOWER[settings.problemDifficultyCeiling],
    });
    await updateStatus("skipped");
  }, [log, updateStatus]);

  return { loading, problem, log, history, markSolved, skip, tooHard };
}
