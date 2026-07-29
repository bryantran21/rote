"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Cheatsheet } from "@/lib/cheatsheet";
import { Markdown } from "@/components/Markdown";
import { CHEATSHEET_SECTION_TOPIC } from "@/content/cheatsheet-topic-map";

export function CheatsheetView({ data }: { data: Cheatsheet }) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const filtered = useMemo(() => {
    if (!searching) return data.sections;
    return data.sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.body.toLowerCase().includes(q),
    );
  }, [data.sections, q, searching]);

  const toggle = (slug: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  return (
    <div className="mx-auto flex max-w-content gap-8 px-6 py-8">
      {/* Sticky section nav */}
      <nav className="sticky top-8 hidden h-fit w-48 shrink-0 flex-col gap-0.5 lg:flex">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Sections
        </p>
        {data.sections.map((s) => {
          const dimmed = searching && !filtered.includes(s);
          return (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className={`rounded px-2 py-1 text-sm transition-colors hover:bg-bg-elevated hover:text-fg ${
                dimmed ? "text-fg-subtle/50" : "text-fg-muted"
              }`}
            >
              {s.title}
            </a>
          );
        })}
      </nav>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Cheat sheet
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            Searchable Python reference.
          </p>
        </div>

        {/* Search */}
        <div className="sticky top-0 z-10 -mx-1 mb-5 bg-bg/90 px-1 py-2 backdrop-blur">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle">
              ⌕
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the cheat sheet…"
              spellCheck={false}
              className="w-full rounded-md border border-border bg-bg-elevated py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-fg-subtle focus:border-accent"
            />
            {searching && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-fg-subtle hover:text-fg"
              >
                Clear
              </button>
            )}
          </div>
          {searching && (
            <p className="mt-2 px-1 text-xs text-fg-subtle">
              {filtered.length} section{filtered.length === 1 ? "" : "s"} match
            </p>
          )}
        </div>

        {/* Intro (hidden while searching to keep results tight) */}
        {!searching && data.intro && (
          <div className="mb-6 border-b border-border pb-2">
            <Markdown>{data.intro}</Markdown>
          </div>
        )}

        {/* Sections */}
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-fg-subtle">
            No sections match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((s) => {
              const isCollapsed = collapsed.has(s.slug) && !searching;
              return (
                <section
                  key={s.slug}
                  id={s.slug}
                  className="scroll-mt-24 rounded-lg border border-border bg-bg-elevated"
                >
                  <div className="flex items-center gap-3 px-5 py-3">
                    <button
                      onClick={() => toggle(s.slug)}
                      className="flex flex-1 items-center justify-between text-left"
                    >
                      <h2 className="text-sm font-semibold text-fg">
                        {s.title}
                      </h2>
                      <span
                        className={`text-fg-subtle transition-transform ${
                          isCollapsed ? "" : "rotate-90"
                        }`}
                        aria-hidden
                      >
                        ›
                      </span>
                    </button>
                    {CHEATSHEET_SECTION_TOPIC[s.slug] && (
                      <Link
                        href={`/drill?topic=${encodeURIComponent(
                          CHEATSHEET_SECTION_TOPIC[s.slug],
                        )}`}
                        className="shrink-0 text-xs text-accent hover:opacity-80"
                      >
                        Drill this →
                      </Link>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="border-t border-border px-5 pb-4 pt-1">
                      <Markdown copyable>{s.body}</Markdown>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
