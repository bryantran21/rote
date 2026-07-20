"use client";

import { useCallback, useEffect, useState } from "react";
import type { Problem, ProblemAttempt, ProblemStatus } from "@/lib/types";
import { store } from "@/lib/datastore";
import { rateAttempt, setAttemptStatus, isAttemptDue } from "@/lib/problemReview";

export interface ProblemRow {
  problem: Problem;
  attempt: ProblemAttempt | null;
}

export interface UseProblems {
  loading: boolean;
  rows: ProblemRow[];
  /** All curated lists present in the catalog, in a stable display order. */
  lists: string[];
  /** All app topics present, sorted. */
  topics: string[];
  rate: (slug: string, confidence: number) => Promise<void>;
  setStatus: (slug: string, status: ProblemStatus) => Promise<void>;
  importSolved: (slugs: string[]) => Promise<number>;
  exportAttempts: () => Promise<ProblemAttempt[]>;
  refresh: () => void;
}

const LIST_ORDER = ["neetcode150", "blind75", "grind75", "pareto50"];

export function useProblems(): UseProblems {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [attempts, setAttempts] = useState<Map<string, ProblemAttempt>>(
    new Map(),
  );
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ds = store();
      const [ps, as] = await Promise.all([
        ds.getProblems(),
        ds.getProblemAttempts(),
      ]);
      if (!alive) return;
      setProblems(ps);
      setAttempts(new Map(as.map((a) => [a.slug, a])));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [nonce]);

  const rows: ProblemRow[] = problems.map((problem) => ({
    problem,
    attempt: attempts.get(problem.slug) ?? null,
  }));

  const lists = LIST_ORDER.filter((l) =>
    problems.some((p) => p.lists.includes(l)),
  );
  const topics = [...new Set(problems.flatMap((p) => p.appTopics))].sort();

  const persist = useCallback(async (next: ProblemAttempt) => {
    await store().saveProblemAttempt(next);
    setAttempts((prev) => {
      const m = new Map(prev);
      m.set(next.slug, next);
      return m;
    });
  }, []);

  const rate = useCallback(
    async (slug: string, confidence: number) => {
      const ds = store();
      const [prev, settings] = await Promise.all([
        ds.getProblemAttempt(slug),
        ds.getSettings(),
      ]);
      const next = rateAttempt({ ...(prev ?? { slug, status: "unsolved", attempts: 0, timeSpentMin: 0 }), slug }, confidence, settings);
      await persist({ ...next, slug });
    },
    [persist],
  );

  const setStatus = useCallback(
    async (slug: string, status: ProblemStatus) => {
      const prev = await store().getProblemAttempt(slug);
      await persist(setAttemptStatus(prev, slug, status));
    },
    [persist],
  );

  const importSolved = useCallback(async (slugs: string[]) => {
    const known = new Set(problems.map((p) => p.slug));
    const valid = slugs.filter((s) => known.has(s));
    await store().bulkMarkSolved(valid);
    setNonce((n) => n + 1);
    return valid.length;
  }, [problems]);

  const exportAttempts = useCallback(() => store().getProblemAttempts(), []);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return {
    loading,
    rows,
    lists,
    topics,
    rate,
    setStatus,
    importSolved,
    exportAttempts,
    refresh,
  };
}

export { isAttemptDue };
