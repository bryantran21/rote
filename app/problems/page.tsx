"use client";

import { useMemo, useRef, useState } from "react";
import type { ProblemDifficulty, ProblemStatus } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { ConfidenceRating } from "@/components/ConfidenceRating";
import {
  useProblems,
  isAttemptDue,
  type ProblemRow,
} from "@/lib/hooks/useProblems";

const LIST_LABELS: Record<string, string> = {
  neetcode150: "NeetCode 150",
  blind75: "Blind 75",
  grind75: "Grind 75",
  pareto50: "Pareto 50",
};

const DIFF_STYLE: Record<ProblemDifficulty, string> = {
  Easy: "text-success border-success/30 bg-success-subtle",
  Medium: "text-warning border-warning/30 bg-warning-subtle",
  Hard: "text-danger border-danger/30 bg-danger-subtle",
};

const STATUS_OPTS: { value: ProblemStatus; label: string }[] = [
  { value: "unsolved", label: "Unsolved" },
  { value: "solved", label: "Solved" },
  { value: "needs-review", label: "Needs review" },
];

type View = "all" | "due";

export default function ProblemsPage() {
  const {
    loading,
    rows,
    lists,
    topics,
    rate,
    setStatus,
    importSolved,
    exportAttempts,
  } = useProblems();

  const [view, setView] = useState<View>("all");
  const [listFilter, setListFilter] = useState<string>("all");
  const [diffFilter, setDiffFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const status = (r: ProblemRow): ProblemStatus =>
    r.attempt?.status ?? "unsolved";

  const dueRows = useMemo(
    () => rows.filter((r) => r.attempt && isAttemptDue(r.attempt)),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (listFilter !== "all" && !r.problem.lists.includes(listFilter))
        return false;
      if (diffFilter !== "all" && r.problem.difficulty !== diffFilter)
        return false;
      if (topicFilter !== "all" && !r.problem.appTopics.includes(topicFilter))
        return false;
      if (statusFilter !== "all" && status(r) !== statusFilter) return false;
      if (q && !r.problem.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, listFilter, diffFilter, topicFilter, statusFilter, query]);

  const perList = useMemo(() => {
    return lists.map((list) => {
      const inList = rows.filter((r) => r.problem.lists.includes(list));
      const solved = inList.filter((r) => status(r) !== "unsolved").length;
      return { list, total: inList.length, solved };
    });
  }, [rows, lists]);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2500);
  };

  const doExport = async () => {
    const data = await exportAttempts();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rote-problems-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      const slugs = extractSlugs(parsed);
      if (slugs.length === 0) {
        flash("No slugs found in that file.");
        return;
      }
      const n = await importSolved(slugs);
      flash(`Marked ${n} problem${n === 1 ? "" : "s"} solved.`);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Import failed.");
    }
  };

  const shown = view === "due" ? dueRows : filtered;

  return (
    <div className="mx-auto max-w-content px-6 py-8">
      <PageHeader
        title="Problems"
        subtitle="Track your way through the curated LeetCode lists."
        action={
          msg ? <span className="text-xs text-success">{msg}</span> : null
        }
      />

      {/* Per-list progress */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {perList.map(({ list, total, solved }) => {
          const pct = total ? Math.round((solved / total) * 100) : 0;
          return (
            <Panel key={list} className="p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-fg">
                  {LIST_LABELS[list] ?? list}
                </span>
                <span className="text-xs tabular-nums text-fg-subtle">
                  {solved}/{total}
                </span>
              </div>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </span>
            </Panel>
          );
        })}
      </div>

      {/* View toggle + import/export */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md border border-border p-0.5 text-sm">
          <ViewTab active={view === "all"} onClick={() => setView("all")}>
            All problems
          </ViewTab>
          <ViewTab active={view === "due"} onClick={() => setView("due")}>
            Due for review{dueRows.length ? ` (${dueRows.length})` : ""}
          </ViewTab>
        </div>
        <div className="flex gap-2">
          <button
            onClick={doExport}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-fg hover:bg-bg-elevated"
          >
            Export
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-fg hover:bg-bg-elevated"
          >
            Import solved
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Filters (only for the "all" view) */}
      {view === "all" && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles…"
            className="w-48 rounded-md border border-border bg-bg-elevated px-3 py-1.5 text-sm outline-none placeholder:text-fg-subtle focus:border-accent"
          />
          <Filter value={listFilter} onChange={setListFilter} label="List">
            {lists.map((l) => (
              <option key={l} value={l}>
                {LIST_LABELS[l] ?? l}
              </option>
            ))}
          </Filter>
          <Filter value={diffFilter} onChange={setDiffFilter} label="Difficulty">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </Filter>
          <Filter value={topicFilter} onChange={setTopicFilter} label="Topic">
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Filter>
          <Filter value={statusFilter} onChange={setStatusFilter} label="Status">
            {STATUS_OPTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Filter>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="py-10 text-center text-sm text-fg-subtle">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-fg-subtle">
          {view === "due"
            ? "Nothing due for review. Rate a problem 1–2 to schedule one."
            : "No problems match these filters."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle">
                <Th>Title</Th>
                <Th>Difficulty</Th>
                <Th className="hidden md:table-cell">Topics</Th>
                <Th>Status</Th>
                <Th className="hidden sm:table-cell">Last solved</Th>
                <Th>Confidence</Th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ problem, attempt }) => (
                <tr
                  key={problem.slug}
                  className="border-b border-border last:border-0 hover:bg-bg-subtle/50"
                >
                  <td className="px-3 py-2.5">
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-fg hover:text-accent"
                    >
                      <span className="tabular-nums text-fg-subtle">
                        {problem.frontendId}.
                      </span>{" "}
                      {problem.title} <span className="text-fg-subtle">↗</span>
                    </a>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${DIFF_STYLE[problem.difficulty]}`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 text-xs text-fg-muted md:table-cell">
                    {problem.appTopics.join(", ")}
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={attempt?.status ?? "unsolved"}
                      onChange={(e) =>
                        setStatus(problem.slug, e.target.value as ProblemStatus)
                      }
                      className={`rounded-md border bg-bg px-2 py-1 text-xs outline-none focus:border-accent ${
                        (attempt?.status ?? "unsolved") === "solved"
                          ? "border-success/40 text-success"
                          : (attempt?.status ?? "unsolved") === "needs-review"
                            ? "border-warning/40 text-warning"
                            : "border-border text-fg-muted"
                      }`}
                    >
                      {STATUS_OPTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="hidden px-3 py-2.5 text-xs tabular-nums text-fg-subtle sm:table-cell">
                    {attempt?.lastSolvedAt
                      ? attempt.lastSolvedAt.slice(0, 10)
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <ConfidenceRating
                      value={attempt?.confidence}
                      onRate={(c) => rate(problem.slug, c)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "due" && dueRows.length > 0 && (
        <p className="mt-3 text-center text-xs text-fg-subtle">
          Solve it again on LeetCode, then re-rate your confidence — 5 graduates
          it out of review.
        </p>
      )}
    </div>
  );
}

/** Accept a slug array, an array of {slug}, or an exported attempts array. */
function extractSlugs(parsed: unknown): string[] {
  if (Array.isArray(parsed)) {
    return parsed
      .map((x) =>
        typeof x === "string" ? x : typeof x?.slug === "string" ? x.slug : null,
      )
      .filter((s): s is string => Boolean(s));
  }
  if (parsed && typeof parsed === "object" && Array.isArray((parsed as any).slugs)) {
    return (parsed as any).slugs.filter((s: unknown): s is string => typeof s === "string");
  }
  return [];
}

function ViewTab({
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
      className={`rounded px-3 py-1 transition-colors ${
        active
          ? "bg-accent-subtle font-medium text-fg"
          : "text-fg-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function Filter({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-border bg-bg-elevated px-2.5 py-1.5 text-sm text-fg-muted outline-none focus:border-accent"
      aria-label={label}
    >
      <option value="all">{label}: all</option>
      {children}
    </select>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-3 py-2 font-medium ${className}`}>{children}</th>;
}
