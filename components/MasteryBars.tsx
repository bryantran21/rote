"use client";

import Link from "next/link";
import { TOPICS } from "@/content/topics";
import { topicSlug } from "@/content/topics";

// Per-topic mastery bars. Each row links to that topic's page.

export function MasteryBars({
  mastery,
  limit,
}: {
  mastery: Record<string, number>;
  limit?: number;
}) {
  const rows = TOPICS.map((t) => ({ ...t, value: mastery[t.name] ?? 0 }));
  const shown = limit ? rows.slice(0, limit) : rows;

  return (
    <ul className="flex flex-col gap-2.5">
      {shown.map((t) => {
        const pct = Math.round(t.value * 100);
        return (
          <li key={t.slug}>
            <Link
              href={`/topics/${topicSlug(t.name)}`}
              className="group flex items-center gap-3"
            >
              <span className="w-40 shrink-0 truncate text-sm text-fg-muted group-hover:text-fg">
                {t.name}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="w-9 shrink-0 text-right text-xs tabular-nums text-fg-subtle">
                {pct}%
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
