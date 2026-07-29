"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DrillCard } from "@/components/DrillCard";
import { useDrill } from "@/lib/store/drill";
import { TOPICS, topicByName } from "@/content/topics";
import { store } from "@/lib/datastore";
import type { DrillFormat } from "@/lib/types";

const FORMATS: { value: DrillFormat; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  { value: "mcq", label: "Multiple choice" },
  { value: "fill", label: "Fill-in" },
];

const LENGTHS: (number | "all")[] = [10, 20, "all"];

function DrillInner() {
  const params = useSearchParams();
  const topicParam = params.get("topic") ?? "";

  const status = useDrill((s) => s.status);
  const queue = useDrill((s) => s.queue);
  const index = useDrill((s) => s.index);
  const results = useDrill((s) => s.results);
  const promoted = useDrill((s) => s.promoted);
  const sessionHardMode = useDrill((s) => s.hardMode);
  const startSession = useDrill((s) => s.start);
  const grade = useDrill((s) => s.grade);
  const next = useDrill((s) => s.next);
  const restart = useDrill((s) => s.restart);
  const quit = useDrill((s) => s.quit);

  // Setup form state (defaults pulled from saved settings + topic query param).
  const [format, setFormat] = useState<DrillFormat>("mixed");
  const [topic, setTopic] = useState<string>(topicParam);
  const [length, setLength] = useState<number | "all">(20);
  const [hardMode, setHardMode] = useState(false);

  useEffect(() => {
    let alive = true;
    store()
      .getSettings()
      .then((s) => {
        if (!alive) return;
        setFormat(s.drillFormat);
        setHardMode(s.drillHardMode);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setTopic(topicParam);
  }, [topicParam]);

  const begin = () =>
    startSession({
      topic: topic || undefined,
      format,
      length: length === "all" ? undefined : length,
      hardMode,
    });

  // ---- Setup screen ----
  if (status === "idle") {
    return (
      <div className="mx-auto flex min-h-screen max-w-prose flex-col justify-center px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          New drill session
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Pick how you want to practice.
        </p>

        <div className="mt-6 flex flex-col gap-5 rounded-lg border border-border bg-bg-elevated p-5">
          <Field label="Format">
            <Segmented
              options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
              value={format}
              onChange={(v) => setFormat(v as DrillFormat)}
            />
          </Field>

          <Field label="Topic">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">All topics</option>
              {TOPICS.map((t) => (
                <option key={t.slug} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Length">
            <Segmented
              options={LENGTHS.map((l) => ({
                value: String(l),
                label: l === "all" ? "All" : String(l),
              }))}
              value={String(length)}
              onChange={(v) => setLength(v === "all" ? "all" : Number(v))}
            />
          </Field>

          <label className="flex cursor-pointer items-center justify-between">
            <span>
              <span className="block text-sm text-fg">Hard mode</span>
              <span className="block text-xs text-fg-subtle">
                Hide the topic &amp; concept until after you answer.
              </span>
            </span>
            <Toggle on={hardMode} onChange={setHardMode} />
          </label>
        </div>

        <button
          onClick={begin}
          className="mt-5 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90"
        >
          Start drilling
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return <Centered>Loading your queue…</Centered>;
  }

  if (status === "empty") {
    return (
      <Centered>
        <p className="text-lg font-medium text-fg">All caught up</p>
        <p className="mt-1 text-sm text-fg-muted">
          {topic
            ? `No ${format !== "mixed" ? format + " " : ""}cards ${
                topic ? `in ${topic} ` : ""
              }match right now.`
            : "Nothing due and no new cards left for these settings."}
        </p>
        <button
          onClick={quit}
          className="mt-6 rounded-md border border-border px-4 py-2 text-sm font-medium text-fg-muted hover:bg-bg-elevated"
        >
          Change settings
        </button>
      </Centered>
    );
  }

  if (status === "summary") {
    const correct = results.filter((r) => r.correct).length;
    const acc = results.length
      ? Math.round((correct / results.length) * 100)
      : 0;
    return (
      <Centered>
        <p className="text-sm font-medium uppercase tracking-wide text-fg-subtle">
          Session complete
        </p>
        <div className="mt-5 flex items-baseline gap-8">
          <Stat value={String(results.length)} label="cards" />
          <Stat value={`${acc}%`} label="accuracy" />
          <Stat value={String(promoted)} label="promoted" />
        </div>
        <div className="mt-8 flex gap-3">
          <button
            onClick={restart}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            Drill again
          </button>
          <button
            onClick={quit}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-fg-muted hover:bg-bg-elevated"
          >
            New session
          </button>
          <Link
            href="/"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-fg-muted hover:bg-bg-elevated"
          >
            Dashboard
          </Link>
        </div>
      </Centered>
    );
  }

  // ---- Active session ----
  const card = queue[index];
  if (!card) return <Centered>Loading…</Centered>;

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      <div className="mx-auto mb-8 w-full max-w-prose">
        {topic && (
          <p className="mb-3 text-xs text-fg-subtle">
            Drilling{" "}
            <span className="text-accent">
              {topicByName(topic)?.name ?? topic}
            </span>
          </p>
        )}
        <div className="h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(index / queue.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="flex flex-1 items-start justify-center">
        <DrillCard
          key={card.id}
          card={card}
          index={index + 1}
          total={queue.length}
          hardMode={sessionHardMode}
          onGraded={(r) => grade(r.correct, r.confidence)}
          onNext={next}
        />
      </div>
    </div>
  );
}

export default function DrillPage() {
  return (
    <Suspense fallback={<Centered>Loading…</Centered>}>
      <DrillInner />
    </Suspense>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-md border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded px-3 py-1.5 text-sm transition-colors ${
            value === o.value
              ? "bg-accent-subtle font-medium text-fg"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-accent" : "bg-border-strong"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-prose flex-col items-center justify-center px-6 text-center">
      {children}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-3xl font-semibold tabular-nums text-fg">
        {value}
      </span>
      <span className="text-xs uppercase tracking-wide text-fg-subtle">
        {label}
      </span>
    </div>
  );
}
