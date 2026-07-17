"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DrillCard } from "@/components/DrillCard";
import { useDrill } from "@/lib/store/drill";
import { topicByName } from "@/content/topics";

function DrillInner() {
  const params = useSearchParams();
  const topic = params.get("topic") ?? undefined;

  const status = useDrill((s) => s.status);
  const queue = useDrill((s) => s.queue);
  const index = useDrill((s) => s.index);
  const results = useDrill((s) => s.results);
  const promoted = useDrill((s) => s.promoted);
  const start = useDrill((s) => s.start);
  const grade = useDrill((s) => s.grade);
  const next = useDrill((s) => s.next);
  const restart = useDrill((s) => s.restart);

  // (Re)start whenever the topic filter changes.
  useEffect(() => {
    start(topic);
  }, [topic, start]);

  if (status === "loading" || status === "idle") {
    return <Centered>Loading your queue…</Centered>;
  }

  if (status === "empty") {
    return (
      <Centered>
        <p className="text-lg font-medium text-fg">All caught up</p>
        <p className="mt-1 text-sm text-fg-muted">
          {topic
            ? `No cards due in ${topic} right now.`
            : "Nothing due and no new cards left. Come back tomorrow, or adjust your daily goal."}
        </p>
        <BackHome />
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
          <Link
            href="/"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-fg-muted hover:bg-bg-elevated"
          >
            Back to dashboard
          </Link>
        </div>
      </Centered>
    );
  }

  const card = queue[index];
  if (!card) return <Centered>Loading…</Centered>;

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      <div className="mx-auto mb-8 w-full max-w-prose">
        {topic && (
          <p className="mb-3 text-xs text-fg-subtle">
            Drilling{" "}
            <span className="text-accent">{topicByName(topic)?.name ?? topic}</span>
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
          onGraded={(r) => grade(r.correct)}
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

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-prose flex-col items-center justify-center px-6 text-center">
      {children}
    </div>
  );
}

function BackHome() {
  return (
    <Link
      href="/"
      className="mt-6 rounded-md border border-border px-4 py-2 text-sm font-medium text-fg-muted hover:bg-bg-elevated"
    >
      Back to dashboard
    </Link>
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
