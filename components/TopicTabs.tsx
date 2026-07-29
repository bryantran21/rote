"use client";

import { useState } from "react";
import Link from "next/link";
import { Markdown } from "@/components/Markdown";

type Tab = "learn" | "test";

export function TopicTabs({
  topicName,
  lesson,
  cardCount,
  primitives,
}: {
  topicName: string;
  lesson: string | null;
  cardCount: number;
  primitives: string[];
}) {
  const [tab, setTab] = useState<Tab>("learn");
  const drillHref = `/drill?topic=${encodeURIComponent(topicName)}`;

  return (
    <div className="mt-6">
      <div className="mb-4 flex rounded-md border border-border p-0.5 text-sm">
        <TabButton active={tab === "learn"} onClick={() => setTab("learn")}>
          Learn
        </TabButton>
        <TabButton active={tab === "test"} onClick={() => setTab("test")}>
          Test
        </TabButton>
      </div>

      {tab === "learn" ? (
        <div>
          <div className="rounded-lg border border-border bg-bg-elevated p-5 sm:p-6">
            {lesson ? (
              <Markdown copyable>{lesson}</Markdown>
            ) : (
              <p className="text-sm text-fg-subtle">
                No lesson written for this topic yet.
              </p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Link
              href="/cheatsheet"
              className="text-xs text-fg-muted hover:text-fg"
            >
              Full cheat sheet →
            </Link>
            <button
              onClick={() => setTab("test")}
              className="text-xs text-accent hover:opacity-80"
            >
              Ready to test →
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-bg-elevated p-6 text-center">
          <p className="text-sm text-fg-muted">
            {cardCount > 0
              ? `${cardCount} drill card${cardCount === 1 ? "" : "s"} in ${topicName}.`
              : `No drill cards in ${topicName} yet.`}
          </p>
          {primitives.length > 0 && (
            <p className="mx-auto mt-2 max-w-md text-xs text-fg-subtle">
              Covers: {primitives.join(" · ")}
            </p>
          )}
          {cardCount > 0 && (
            <Link
              href={drillHref}
              className="mt-5 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90"
            >
              Drill this topic
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded px-3 py-1.5 transition-colors ${
        active
          ? "bg-accent-subtle font-medium text-fg"
          : "text-fg-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
