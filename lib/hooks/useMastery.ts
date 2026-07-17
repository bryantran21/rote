"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/datastore";

export interface MasteryData {
  loading: boolean;
  mastery: Record<string, number>;
  /** cards seen per topic, for a secondary caption */
  seen: Record<string, number>;
}

export function useMastery(): MasteryData {
  const [data, setData] = useState<MasteryData>({
    loading: true,
    mastery: {},
    seen: {},
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      const ds = store();
      const [mastery, cards, progress] = await Promise.all([
        ds.getTopicMastery(),
        ds.getCards(),
        ds.getAllProgress(),
      ]);
      if (!alive) return;
      const seenIds = new Set(progress.map((p) => p.cardId));
      const seen: Record<string, number> = {};
      for (const c of cards) {
        if (seenIds.has(c.id)) seen[c.topic] = (seen[c.topic] ?? 0) + 1;
      }
      setData({ loading: false, mastery, seen });
    })();
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
