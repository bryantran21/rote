"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { TOPICS } from "@/content/topics";
import { CARDS } from "@/content/cards";
import { useMastery } from "@/lib/hooks/useMastery";

const CARD_COUNTS: Record<string, number> = CARDS.reduce(
  (acc, c) => {
    acc[c.topic] = (acc[c.topic] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>,
);

export default function TopicsPage() {
  const { mastery, seen } = useMastery();

  return (
    <div className="mx-auto max-w-content px-6 py-8">
      <PageHeader
        title="Topics"
        subtitle="The roadmap. Pick a topic to read the concept and drill it."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((t) => {
          const count = CARD_COUNTS[t.name] ?? 0;
          const pct = Math.round((mastery[t.name] ?? 0) * 100);
          const seenCount = seen[t.name] ?? 0;
          return (
            <Link
              key={t.slug}
              href={`/topics/${t.slug}`}
              className="group flex flex-col rounded-lg border border-border bg-bg-elevated p-4 transition-colors hover:border-border-strong"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-medium text-fg group-hover:text-fg">
                  {t.name}
                </h2>
                <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
                  {count} card{count === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-1 flex-1 text-sm text-fg-muted">{t.blurb}</p>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-fg-subtle">
                    {count === 0
                      ? "No cards yet"
                      : seenCount > 0
                        ? `${seenCount} seen`
                        : "Not started"}
                  </span>
                  <span className="tabular-nums text-fg-subtle">
                    {count === 0 ? "—" : `${pct}%`}
                  </span>
                </div>
                <span className="block h-1.5 overflow-hidden rounded-full bg-border">
                  <span
                    className="block h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${count === 0 ? 0 : pct}%` }}
                  />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
