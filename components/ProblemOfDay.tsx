"use client";

import Link from "next/link";
import type { ProblemDifficulty } from "@/lib/types";
import { useDailyProblem } from "@/lib/hooks/useDailyProblem";
import { topicSlug } from "@/content/topics";

const DIFF_STYLE: Record<ProblemDifficulty, string> = {
  Easy: "text-success border-success/30 bg-success-subtle",
  Medium: "text-warning border-warning/30 bg-warning-subtle",
  Hard: "text-danger border-danger/30 bg-danger-subtle",
};

const STATUS_LABEL = {
  served: "",
  solved: "Solved",
  skipped: "Skipped",
} as const;

export function ProblemOfDay() {
  const { loading, problem, log, history, markSolved, skip, tooHard } =
    useDailyProblem();

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-bg-elevated p-5">
        <div className="h-4 w-40 animate-pulse rounded bg-border" />
      </div>
    );
  }

  if (!problem || !log) {
    return (
      <div className="rounded-lg border border-border bg-bg-elevated p-5 text-sm text-fg-subtle">
        No problem available — run the catalog build to populate problems.
      </div>
    );
  }

  const done = log.status !== "served";
  const primaryTopic = problem.appTopics[0];

  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Problem of the Day
        </h2>
        {done && (
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              log.status === "solved"
                ? "bg-success-subtle text-success"
                : "bg-bg-subtle text-fg-subtle"
            }`}
          >
            {STATUS_LABEL[log.status]}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums text-fg-subtle">
              #{problem.frontendId}
            </span>
            <h3 className="truncate text-lg font-medium text-fg">
              {problem.title}
            </h3>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${DIFF_STYLE[problem.difficulty]}`}
            >
              {problem.difficulty}
            </span>
            {problem.appTopics.slice(0, 3).map((t) => (
              <Link
                key={t}
                href={`/topics/${topicSlug(t)}`}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-muted hover:text-fg"
              >
                {t}
              </Link>
            ))}
            {problem.paidOnly && (
              <span className="rounded-full border border-warning/30 bg-warning-subtle px-2 py-0.5 text-xs text-warning">
                Premium
              </span>
            )}
          </div>

          {log.reason && (
            <p className="mt-3 text-sm text-fg-muted">{log.reason}</p>
          )}
        </div>

        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          Solve on LeetCode ↗
        </a>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <button
          onClick={markSolved}
          disabled={log.status === "solved"}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg hover:bg-bg-subtle disabled:opacity-40"
        >
          Mark solved
        </button>
        <button
          onClick={skip}
          disabled={log.status === "skipped"}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-fg-muted hover:bg-bg-subtle disabled:opacity-40"
        >
          Skip
        </button>
        <button
          onClick={tooHard}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-fg-muted hover:bg-bg-subtle"
        >
          Too hard
        </button>

        {log.status === "solved" && primaryTopic && (
          <Link
            href={`/drill?topic=${encodeURIComponent(primaryTopic)}`}
            className="ml-auto text-sm text-accent hover:opacity-80"
          >
            Drill {primaryTopic} syntax →
          </Link>
        )}
      </div>

      {/* This week strip */}
      {history.length > 1 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-fg-subtle">Recent problems</p>
          <div className="flex flex-wrap gap-2">
            {history.slice(0, 7).map(({ log: h, problem: p }) => (
              <a
                key={h.date}
                href={p?.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${h.date}: ${p?.title ?? h.problemId} (${h.status})`}
                className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-fg-muted hover:text-fg"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    h.status === "solved"
                      ? "bg-success"
                      : h.status === "skipped"
                        ? "bg-fg-subtle"
                        : "bg-accent"
                  }`}
                />
                #{p?.frontendId ?? "?"}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
